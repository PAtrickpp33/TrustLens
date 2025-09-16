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

    @staticmethod
    def _robust_extract_json(text: str) -> Dict[str, Any]:
        if not text:
            raise ValueError("Empty response.")
        if "```" in text:
            import re
            m = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL | re.IGNORECASE)
            if m:
                return json.loads(m.group(1))
        s, e = text.find("{"), text.rfind("}")
        if s != -1 and e != -1 and e > s:
            return json.loads(text[s:e+1])
        raise ValueError(f"Model did not return JSON. Got: {text[:200]}...")

    # ======== Main Function ========
    # Richard: replaced app.state.gemini with self.session.client
    def call_gemini_json(self, user_prompt: str) -> Dict[str, Any]:
        try:
            # Generate response
            resp = self.session.client.models.generate_content(
                model=self.session.model,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    max_output_tokens=self.session.MAX_TOKENS,
                    temperature=self.session.TEMP,
                    response_mime_type="application/json",
                    response_schema=_recommendation_schema(),
                    thinking_config=types.ThinkingConfig(thinking_budget=self.session.THINKING_BUDGET)
                )
            )
            txt = resp.text or ""
            return self._robust_extract_json(txt)
        except Exception as e:
            try:
                cand = getattr(resp, "candidates", None)
                if cand and getattr(cand[0], "content", None):
                    for p in cand[0].content.parts:
                        if getattr(p, "text", None):
                            return self._robust_extract_json(p.text)
            except Exception:
                pass
            raise HTTPException(status_code=502, detail=f"Gemini call failed: {e}")