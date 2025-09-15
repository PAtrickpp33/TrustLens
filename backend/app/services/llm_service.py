import json, urllib.parse as up
from typing import Dict, Any
from ..core.config import llm_settings

from fastapi import HTTPException

# Import LLM session from infra
from ..infrastructure.llm import LLMSession

TEMP = llm_settings.temp
MAX_TOKENS = llm_settings.max_tokens
TH_MED = llm_settings.th_med
TH_HIGH = llm_settings.th_high
META_PATH = llm_settings.meta_path
WEIGHT_PATH = llm_settings.weight_path

SYSTEM_PROMPT = (
        "You are a security assistant.\n"
        "Do NOT re-classify. RISK_BAND is already decided.\n"
        "Policy:\n"
        "- HIGH: block/quarantine + 2-4 evidence bullets.\n"
        "- MEDIUM: sandbox/caution + 2-4 verification steps.\n"
        "- LOW: allow with brief warnings.\n"
        "Keep outputs concise."
    )

RECOMMENDATION_SCHEMA = {
        "type": "object",
        "properties": {
            "risk_band": {"type": "string", "enum": ["HIGH", "MEDIUM", "LOW"]},
            "action": {"type": "string", "enum": ["block","quarantine","sandbox","allow","allow_with_warning"]},
            "confidence_note": {"type": "string"},
            "evidence": {"type": "array", "items": {"type": "string"}},
            "recommended_next_steps": {"type": "array", "items": {"type": "string"}},
            "user_safe_message": {"type": "string"},
            "notes_for_analyst": {"type": "string"}
        },
        "required": ["risk_band","action","confidence_note","evidence","recommended_next_steps","user_safe_message","notes_for_analyst"]
    }

class LLMRiskService:
    def __init__(self, session: LLMSession):
        self.session = session
    
    # ======== Helpers ========
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
    def risk_band(score: float) -> str:
        return "HIGH" if score >= TH_HIGH else ("MEDIUM" if score >= TH_MED else "LOW")

    @staticmethod
    def enforce_action(band: str, action: str) -> str:
        if band == "HIGH":
            return action if action in {"block","quarantine"} else "block"
        if band == "MEDIUM":
            return action if action in {"sandbox","allow_with_warning"} else "sandbox"
        return action if action in {"allow","allow_with_warning"} else "allow_with_warning"

    @staticmethod
    def build_user_prompt(url_raw: str, score: float, band: str, safe_url: str) -> str:
        return (
            f"ORIGINAL_URL: {url_raw}\n"
            f"ASCII_SAFE_URL: {safe_url}\n"
            f"MODEL_SCORE: {score:.3f}\n"
            f"RISK_BAND: {band}\n"
            "RETRIEVED_CONTEXT:\n- (no RAG)\n"
            "Constraints:\n- Output JSON only, no extra text. evidence<=4, steps<=4."
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
    # Richard: replaced app.state.gemini with self.session.gemini
    def call_gemini_json(self, user_prompt: str) -> Dict[str, Any]:
        try:
            resp = self.session.gemini.generate_content(
                contents=[
                    {"role": "user", "parts": [{"text": SYSTEM_PROMPT}]},
                    {"role": "user", "parts": [{"text": user_prompt}]},
                ],
                generation_config={
                    "temperature": TEMP,
                    "max_output_tokens": MAX_TOKENS,
                    "response_mime_type": "application/json",
                    "response_schema": RECOMMENDATION_SCHEMA,
                },
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