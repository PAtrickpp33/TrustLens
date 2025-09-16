import json, urllib.parse as up
from typing import Dict, Any
from ..core.config import llm_settings

from fastapi import HTTPException

# Import LLM session from infra
from app.infrastructure.llm import LLMSession

# Setting up constants
# Richard: Added thinking budget for more complex evaluations by AI; default = 0
GEMINI_MODEL = llm_settings.gemini_model
TEMP = llm_settings.temp
MAX_TOKENS = llm_settings.max_tokens
TH_HIGH = llm_settings.th_high
TH_MED = llm_settings.th_med
TH_LOW = llm_settings.th_low
META_PATH = llm_settings.meta_path
WEIGHT_PATH = llm_settings.weight_path
THINKING_BUDGET = llm_settings.thinking_budget

# Richard: I changed risk band to Safe, Low Risk, Medium Risk, and Unsafe
SYSTEM_PROMPT = """
ROLE
You are a security analyst AI. Given a URL’s model score and risk band, produce a single JSON object that STRICTLY matches the schema below. Write for everyday consumers (non-technical audience): prioritize readability and clarity, use complete sentences, explain any necessary terms in plain language, and avoid jargon.

INPUT FORMAT (the next message will include)
- ORIGINAL_URL: <raw string>
- ASCII_SAFE_URL: <IDNA/punycode-safe URL>
- MODEL_SCORE: <float 0–1, higher = riskier>
- RISK_BAND: <one of UNSAFE | MEDIUM RISK | LOW RISK | SAFE>

OUTPUT SCHEMA (must match exactly; output JSON ONLY, no extra text)
{
  "risk_band": enum["UNSAFE","MEDIUM RISK","LOW RISK","SAFE"],
  "action": enum["block","quarantine","sandbox","allow","allow_with_warning"],   // This is a RECOMMENDED action, not something we have performed.
  "confidence_note": string,
  "evidence": string,                       // A clear, coherent paragraph that explains the rationale in plain English.
  "recommended_next_steps": string[],       // 2–4 practical steps that a layperson can follow.
  "user_safe_message": string,              // A short introduction + immediate recommendation for the user.
  "notes_for_analyst": string               // Brief triage notes for a human analyst.
}

HARD RULES
- Do NOT re-classify. Treat the provided RISK_BAND as final and MAP it as:
  HIGH   -> "UNSAFE"
  MEDIUM -> "MEDIUM RISK"
  LOW    -> "LOW RISK"
  SAFE   -> "SAFE"
- Choose `action` as a RECOMMENDATION consistent with the mapped band:
  "UNSAFE": "block" (or "quarantine" or "sandbox")
  "MEDIUM RISK": "sandbox" (or "block" or "allow_with_warning" or "quarantine" or "sandbox")
  "LOW RISK": "allow_with_warning" (or "allow" or "sandbox" or "quarantine" or "block")
  "SAFE": "allow" (or "allow with warning")
- Output JSON only — no prose outside JSON, no code fences, no extra keys or fields.

CONTENT RULES (consumer-friendly)
- Base reasoning ONLY on MODEL_SCORE, RISK_BAND, and visible lexical/structural cues in ASCII_SAFE_URL. Do NOT invent external intelligence (no WHOIS, hosting data, user reports, malware feeds).
- user_safe_message: Lead with a clear, reassuring introduction and an easily understood recommendation (e.g., “This link appears unsafe and it is recommended to block it to protect your account. Please avoid opening it or entering any personal details.”). You may use 1–3 short sentences.
- evidence: Write a readable paragraph explaining WHY the recommendation is being made, in plain language. Refer to concrete cues such as:
  • “http://” (no lock icon) meaning no encryption,
  • brand lookalikes or swapped characters (e.g., “paypa1” vs “paypal”),
  • misleading subdomains (e.g., “secure-support.example.com”),
  • sign-in or verification paths (e.g., “/login”, “/verify”),
  • unusual ports or excessive confusing parameters.
  Briefly explain what each cue means for safety, without deep technical detail.
- recommended_next_steps: Provide 2–4 specific, actionable steps a layperson can follow. Prefer clear actions like:
  • “Do not click the link or enter any information,”
  • “If you already clicked, change your password and turn on two-step verification,”
  • “Go to the official website by typing the address yourself,”
  • “Contact your bank/service using the number on the back of your card or from their official site,”
  • “Report the message to the relevant provider.”
  Avoid internal-only or enterprise-only instructions (e.g., SIEM, EDR, gateway policies). If you use a term, briefly clarify it in parentheses.
- confidence_note: Connect MODEL_SCORE to the mapped band and state any limitations (e.g., “Only limited details are visible from the web address”).
- notes_for_analyst: Short triage hints suitable for a human analyst (e.g., “Monitor for sibling typosquats; consider brand-lookalike rules”). Keep professional and concise.
- Never imply we have taken action. All guidance is advisory (recommended). Avoid phrases like “has been blocked” or “we quarantined.”
- Never echo secrets/userinfo from ORIGINAL_URL; refer to ASCII_SAFE_URL when citing.

ONE-SHOT EXAMPLE (for guidance)
INPUT:
ORIGINAL_URL: http://paypa1-secure-support.com/login?session=verify
ASCII_SAFE_URL: http://paypa1-secure-support.com/login?session=verify
MODEL_SCORE: 0.912
RISK_BAND: HIGH
RETRIEVED_CONTEXT:
- (no RAG)

EXPECTED JSON:
{
  "risk_band": "UNSAFE",
  "action": "block",
  "confidence_note": "The model score is very high (0.912) and the provided band is HIGH, which maps to UNSAFE. The visible parts of the web address also show several warning signs commonly linked to phishing.",
  "evidence": "This web address starts with “http://” rather than “https://”, which means it is not using encryption (you would normally see a lock icon with secure sites). The name looks like the brand “PayPal” but actually uses the number 1 instead of the letter l (“paypa1”), which is a common trick to imitate trusted names. The address also contains words like “login” and “verify,” which scammers often use to push people to enter passwords or personal details on fake pages. Together, these signs suggest the link is designed to look legitimate while attempting to collect account information.",
  "recommended_next_steps": [
    "Do not open the link and do not enter any personal or banking information.",
    "If you already clicked the link, change your account password and turn on two-step verification (if available).",
    "Visit the official website by typing the address yourself or using a saved bookmark rather than following links.",
    "If the message claims to be from a company you use, contact them using the phone number or help page on their official site."
  ],
  "user_safe_message": "This link appears unsafe and it is recommended to block it to protect your account. Please avoid opening it or entering any personal details. If you have already interacted with it, follow the steps below to help secure your accounts.",
  "notes_for_analyst": "Consider takedown request and monitor for sibling typosquats; add lightweight brand-lookalike heuristics."
}
"""

RECOMMENDATION_SCHEMA = {
        "type": "object",
        "properties": {
            "risk_band": {"type": "string", "enum": ["UNSAFE", "MEDIUM RISK", "LOW RISK", "SAFE"]},
            "action": {"type": "string", "enum": ["block","quarantine","sandbox","allow","allow_with_warning"]},
            "confidence_note": {"type": "string"},
            "evidence": {"type": "string"},
            # "evidence": {"type": "array", "items": {"type": "string"}},
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
        if score >= TH_HIGH:
            return "UNSAFE"
        elif score >= TH_MED:
            return "MEDIUM RISK"
        elif score >= TH_LOW:
            return "LOW RISK"
        else:
            return "SAFE"

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
    # Richard: replaced app.state.gemini with self.session.gemini
    def call_gemini_json(self, user_prompt: str) -> Dict[str, Any]:
        try:
            # Config for LLM response generation
            gen_cfg = {
                    "temperature": TEMP,
                    "max_output_tokens": MAX_TOKENS,
                    "response_mime_type": "application/json",
                    "response_schema": RECOMMENDATION_SCHEMA,
                }
            if GEMINI_MODEL.startswith("gemini-2.5"):
                gen_cfg["thinking"] = {"budget_tokens": THINKING_BUDGET}
            # Generate response
            resp = self.session.gemini.generate_content(
                contents=[
                    {"role": "user", "parts": [{"text": SYSTEM_PROMPT}]},
                    {"role": "user", "parts": [{"text": user_prompt}]},
                ],
                generation_config=gen_cfg
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