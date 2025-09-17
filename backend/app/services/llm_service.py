import json, urllib.parse as up
from typing import Dict, Any
from fastapi import HTTPException
from google.genai import types
from pathlib import Path

# Import LLM session from infra
from app.infrastructure.llm import LLMSession

# Stored system_prompt in separate textfile for maintainability
PROMPT_PATH = Path(__file__).with_name("system_prompt.txt")
SYSTEM_PROMPT = PROMPT_PATH.read_text(encoding="utf-8")

# Richard: I changed risk band to Safe, Low Risk, Medium Risk, and Unsafe
# Build a proper Schema for the JSON response
def _recommendation_schema() -> types.Schema:
    return types.Schema(
        type="object",
        properties={
            "risk_band": types.Schema(type="string", enum=["UNSAFE", "MEDIUM RISK", "LOW RISK", "SAFE"]),
            "action": types.Schema(type="string", enum=["block","quarantine","sandbox","allow","allow_with_warning"]),
            "confidence_note": types.Schema(type="string"),
            "evidence": types.Schema(type="string"),
            "recommended_next_steps": types.Schema(type="array", items=types.Schema(type="string")),
            "user_safe_message": types.Schema(type="string"),
            "notes_for_analyst": types.Schema(type="string"),
        },
        required=["risk_band","action","confidence_note","evidence","recommended_next_steps","user_safe_message","notes_for_analyst"],
    )

class LLMRiskService:
    RISKLVL_TO_RISKBAND = {0: "UNKNOWN", 1: "SAFE", 2: "LOW RISK", 3: "MEDIUM RISK", 4: "UNSAFE"}
    
    def __init__(self, session: LLMSession):
        self.session = session
    
    # Helper functions
    def risk_band(self, score: float) -> str:
        if score >= self.session.TH_HIGH:
            return "UNSAFE"
        elif score >= self.session.TH_MED:
            return "MEDIUM RISK"
        elif score >= self.session.TH_LOW:
            return "LOW RISK"
        else:
            return "SAFE"
        
    def risk_level_to_risk_band(self, risk_level: int) -> str:
        return self.RISKLVL_TO_RISKBAND[int(risk_level)]
    
    @staticmethod
    def ascii_safe_url(u: str) -> str:
        p = up.urlsplit((u or "").strip())
        host = p.hostname.encode("idna").decode("ascii") if p.hostname else ""
        userinfo = ""
        if p.username:
            userinfo = up.quote(p.username, safe="")
            if p.password:
                userinfo += ":" + up.quote(p.password, safe="")
            userinfo += "@"
        netloc = f"{userinfo}{host}" + (f":{p.port}" if p.port else "")
        path  = up.quote(p.path or "", safe="/")
        query = up.quote_plus(p.query or "", safe="=&")
        frag  = up.quote(p.fragment or "", safe="")
        return up.urlunsplit((p.scheme or "http", netloc, path, query, frag))

    @staticmethod
    def enforce_action(band: str, action: str) -> str:
        # Ensures that the recommended action by the LLM is within acceptable boundaries; will enforce default if recommendation unreasonable
        if band == "UNSAFE":
            return action if action in {"block","quarantine","sandbox"} else "block"
        # Richard: Quarantine rather than sandbox to reduce false positives; i.e. legitimate urls classified as risky and blocked
        elif band == "MEDIUM RISK":
            return action if action in {"block","quarantine","sandbox","allow_with_warning"} else "quarantine"
        elif band == "LOW RISK":
            return action if action in {"quarantine","allow_with_warning","block","sandbox","allow"} else "allow_with_warning"
        else:
            return action if action in {"allow","allow_with_warning"} else "allow"

    @staticmethod
    def build_user_prompt(url_raw: str, score: float, band: str, safe_url: str) -> str:
        return (
            f"ORIGINAL_URL: {url_raw}\n"
            f"ASCII_SAFE_URL: {safe_url}\n"
            f"MODEL_SCORE: {score:.3f}\n"
            f"RISK_BAND: {band}\n"
        )

    # @staticmethod
    # def _robust_extract_json(text: str) -> Dict[str, Any]:
    #     if not text:
    #         raise ValueError("Empty response.")
    #     if "```" in text:
    #         import re
    #         m = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL | re.IGNORECASE)
    #         if m:
    #             return json.loads(m.group(1))
    #     s, e = text.find("{"), text.rfind("}")
    #     if s != -1 and e != -1 and e > s:
    #         return json.loads(text[s:e+1])
    #     raise ValueError(f"Model did not return JSON. Got: {text[:200]}...")
    
    @staticmethod
    def _robust_extract_json(text: str) -> Dict[str, Any]:
        # CHANGED: tolerate code fences, leading/trailing prose, and nested braces.
        if not text:
            raise ValueError("Empty response.")

        s = text.strip()

        # Strip ``` fences (```json ... ```, or ``` ... ```)
        if s.startswith("```"):
            s = re.sub(r"^```[a-zA-Z0-9_-]*\s*", "", s)
            s = re.sub(r"\s*```$", "", s).strip()

        # Fast path
        try:
            return json.loads(s)
        except Exception:
            pass

        # Extract the first balanced JSON object/array from noisy text
        def _extract_balanced(payload: str, open_ch: str, close_ch: str):
            start = payload.find(open_ch)
            if start == -1:
                return None
            depth, in_str, esc = 0, False, False
            for i in range(start, len(payload)):
                ch = payload[i]
                if in_str:
                    if esc:
                        esc = False
                    elif ch == "\\":
                        esc = True
                    elif ch == '"':
                        in_str = False
                else:
                    if ch == '"':
                        in_str = True
                    elif ch == open_ch:
                        depth += 1
                    elif ch == close_ch:
                        depth -= 1
                        if depth == 0:
                            return payload[start:i+1]
            return None

        candidate = _extract_balanced(s, "{", "}")
        if not candidate:
            candidate = _extract_balanced(s, "[", "]")

        if candidate:
            try:
                return json.loads(candidate)
            except Exception:
                pass

        raise ValueError(f"Model did not return JSON. Got: {s[:500].replace('\\n',' ')}")

    @staticmethod
    def _ensure_fields(out: Dict[str, Any]) -> Dict[str, Any]:
        # CHANGED: ensure required keys are present with safe defaults
        out = dict(out or {})
        out.setdefault("risk_band", "SAFE")
        out.setdefault("action", "allow_with_warning")
        out.setdefault("confidence_note", "")
        out.setdefault("evidence", "")
        out.setdefault("recommended_next_steps", [])
        out.setdefault("user_safe_message", "")
        out.setdefault("notes_for_analyst", "")
        # coerce types a bit
        if not isinstance(out.get("recommended_next_steps"), list):
            out["recommended_next_steps"] = [str(out["recommended_next_steps"])]
        return out
    
    # ======== Main Function ========
    # Richard: replaced app.state.gemini with self.session.client
    # def call_gemini_json(self, user_prompt: str) -> Dict[str, Any]:
    #     try:
    #         # Generate response
    #         resp = self.session.client.models.generate_content(
    #             model=self.session.model,
    #             contents=user_prompt,
    #             config=types.GenerateContentConfig(
    #                 system_instruction=SYSTEM_PROMPT,
    #                 max_output_tokens=self.session.MAX_TOKENS,
    #                 temperature=self.session.TEMP,
    #                 response_mime_type="application/json",
    #                 response_schema=_recommendation_schema(),
    #                 thinking_config=types.ThinkingConfig(thinking_budget=self.session.THINKING_BUDGET)
    #             )
    #         )
    #         txt = resp.text or ""
    #         return self._robust_extract_json(txt)
    #     except Exception as e:
    #         try:
    #             cand = getattr(resp, "candidates", None)
    #             if cand and getattr(cand[0], "content", None):
    #                 for p in cand[0].content.parts:
    #                     if getattr(p, "text", None):
    #                         return self._robust_extract_json(p.text)
    #         except Exception:
    #             pass
    #         raise HTTPException(status_code=502, detail=f"Gemini call failed: {e}")
    
    def call_gemini_json(self, user_prompt: str) -> Dict[str, Any]:
        def _try_parse_from_response(resp) -> Dict[str, Any] | None:
            # CHANGED: unified parse attempts from .text and parts
            texts = []
            try:
                if getattr(resp, "text", None):
                    texts.append(resp.text)
            except Exception:
                pass
            try:
                for c in getattr(resp, "candidates", []) or []:
                    for p in getattr(c, "content", {}).parts or []:
                        if getattr(p, "text", None):
                            texts.append(p.text)
            except Exception:
                pass
            for t in texts:
                try:
                    return self._ensure_fields(self._robust_extract_json(t))
                except Exception:
                    continue
            return None

        try:
            # First attempt — your original config
            resp = self.session.client.models.generate_content(
                model=self.session.model,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    max_output_tokens=self.session.MAX_TOKENS,
                    temperature=self.session.TEMP,
                    response_mime_type="application/json",
                    response_schema=_recommendation_schema(),
                    thinking_config=types.ThinkingConfig(thinking_budget=self.session.THINKING_BUDGET),
                ),
            )
            parsed = _try_parse_from_response(resp)
            if parsed is not None:
                return parsed

            # CHANGED: second attempt — parse from whatever text we got
            # (already done inside _try_parse_from_response). If still None, fall through.

        except Exception as e_first:
            first_exc = e_first
        else:
            first_exc = None  # no transport error, just parsing failure

        # CHANGED: self-repair retry — ask model to return ONLY JSON mined from its own earlier text
        try:
            previous_text = getattr(resp, "text", "") if "resp" in locals() else ""
            repair_prompt = (
                "Return ONLY a valid JSON object that matches this schema:\n"
                "{risk_band, action, confidence_note, evidence, recommended_next_steps, user_safe_message, notes_for_analyst}.\n"
                "If some fields are missing, infer them conservatively. Do not include any explanation.\n\n"
                "SOURCE TEXT:\n" + (previous_text or user_prompt)
            )
            resp2 = self.session.client.models.generate_content(
                model=self.session.model,
                contents=repair_prompt,
                config=types.GenerateContentConfig(
                    system_instruction="You are a JSON converter. Output only JSON.",
                    max_output_tokens=self.session.MAX_TOKENS,
                    temperature=0.0,
                    response_mime_type="application/json",
                    # CHANGED: no response_schema / thinking_config on the repair call to avoid incompatibilities
                ),
            )
            parsed2 = _try_parse_from_response(resp2)
            if parsed2 is not None:
                return parsed2
        except Exception:
            pass

        # CHANGED: last-ditch fallback — derive band from the prompt and provide safe defaults
        try:
            m = re.search(r"RISK_BAND:\s*(SAFE|LOW RISK|MEDIUM RISK|UNSAFE)", user_prompt, re.I)
            band = (m.group(1).upper() if m else "SAFE")
            # keep your enforcement rules for action
            action = self.enforce_action(band, "allow_with_warning")
            return self._ensure_fields({
                "risk_band": band,
                "action": action,
                "confidence_note": "Fallback used due to non-JSON model output.",
                "evidence": "",
                "recommended_next_steps": [],
                "user_safe_message": "",
                "notes_for_analyst": "",
            })
        except Exception as final_e:
            detail = f"Gemini call failed: {final_e}"
            if first_exc:
                detail += f" | first error: {first_exc}"
            raise HTTPException(status_code=502, detail=detail)