# llm_response.py
import os, json, urllib.parse as up
from typing import List, Dict, Any

import torch
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

import google.generativeai as genai

load_dotenv()

# ======== Config ========
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not set. Put it in .env or env vars.")

GEMINI_MODEL   = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
MAX_TOKENS     = int(os.getenv("MAX_NEW_TOKENS", "256"))
TEMP           = float(os.getenv("TEMPERATURE", "0.2"))

TH_HIGH        = float(os.getenv("TH_HIGH", "0.80"))
TH_MED         = float(os.getenv("TH_MED",  "0.50"))

META_PATH      = os.getenv("META_PATH", "meta.json")
WEIGHT_PATH    = os.getenv("WEIGHT_PATH", "urlnet_model.bin")
CORS_ORIGINS   = os.getenv("CORS_ORIGINS", "*").split(",")

# ======== Encoders & Dynamic URLNet builder ========
from encoders_from_notebook import enc_char_url, enc_words, enc_token_chars  # 你的编码器
from modeldef_from_notebook import build_urlnet_from_state_dict             # 动态搭建模型

# ======== FastAPI ========
app = FastAPI(title="URL Security API (Gemini + URLNet)", version="2.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======== Helpers ========
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

def risk_band(score: float) -> str:
    return "HIGH" if score >= TH_HIGH else ("MEDIUM" if score >= TH_MED else "LOW")

def enforce_action(band: str, action: str) -> str:
    if band == "HIGH":
        return action if action in {"block","quarantine"} else "block"
    if band == "MEDIUM":
        return action if action in {"sandbox","allow_with_warning"} else "sandbox"
    return action if action in {"allow","allow_with_warning"} else "allow_with_warning"

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

def build_user_prompt(url_raw: str, score: float, band: str, safe_url: str) -> str:
    return (
        f"ORIGINAL_URL: {url_raw}\n"
        f"ASCII_SAFE_URL: {safe_url}\n"
        f"MODEL_SCORE: {score:.3f}\n"
        f"RISK_BAND: {band}\n"
        "RETRIEVED_CONTEXT:\n- (no RAG)\n"
        "Constraints:\n- Output JSON only, no extra text. evidence<=4, steps<=4."
    )

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

def call_gemini_json(user_prompt: str) -> Dict[str, Any]:
    try:
        resp = app.state.gemini.generate_content(
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
        return _robust_extract_json(txt)
    except Exception as e:
        try:
            cand = getattr(resp, "candidates", None)
            if cand and getattr(cand[0], "content", None):
                for p in cand[0].content.parts:
                    if getattr(p, "text", None):
                        return _robust_extract_json(p.text)
        except Exception:
            pass
        raise HTTPException(status_code=502, detail=f"Gemini call failed: {e}")

# ======== URLNet Wrapper ========
class URLScorer:
    def __init__(self, meta_path: str = META_PATH, weights_path: str = WEIGHT_PATH):
        with open(meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)
        self.CHAR2ID = meta["CHAR2ID"]
        self.WORD2ID = meta["WORD2ID"]
        self.TOKCHAR2ID = meta["TOKCHAR2ID"]
        self.MAX_LEN = meta.get("MAX_LEN", 256)
        self.MAX_WORDS = meta.get("MAX_WORDS", 64)
        self.MAX_TOK_CHAR = meta.get("MAX_TOK_CHAR", 16)

        sd = torch.load(weights_path, map_location="cpu")
        if not isinstance(sd, dict) or any(not isinstance(k, str) for k in sd.keys()):
            sd = sd.state_dict()

        if any(k.startswith("module.") for k in sd.keys()):
            sd = {k[7:]: v for k, v in sd.items()}

        self.model = build_urlnet_from_state_dict(self.CHAR2ID, self.WORD2ID, self.TOKCHAR2ID, sd)
        self.model.eval()

    def score(self, url: str) -> float:
        x_char = torch.tensor([enc_char_url(url, self.CHAR2ID, max_len=self.MAX_LEN)], dtype=torch.long)
        x_word = torch.tensor([enc_words(url, self.WORD2ID, max_words=self.MAX_WORDS)], dtype=torch.long)
        x_tokc = torch.tensor([enc_token_chars(url, self.TOKCHAR2ID,
                                               max_words=self.MAX_WORDS, max_tok_char=self.MAX_TOK_CHAR)],
                              dtype=torch.long)
        with torch.no_grad():
            out = self.model(x_char, x_word, x_tokc)
            prob = out.get("prob", None)
            if prob is None:
                logit = out.get("logit", None)
                if logit is None:
                    raise RuntimeError("Model output missing both 'prob' and 'logit'.")
                prob = torch.sigmoid(logit)
            return float(prob.squeeze().item())

# ======== Schemas ========
class ScoreRequest(BaseModel):
    url: str

class ScoreResponse(BaseModel):
    url: str
    ascii_safe_url: str
    score: float
    risk_band: str

class RecommendRequest(BaseModel):
    url: str

class Recommendation(BaseModel):
    risk_band: str
    action: str
    confidence_note: str
    evidence: List[str]
    recommended_next_steps: List[str]
    user_safe_message: str
    notes_for_analyst: str

class RecommendResponse(BaseModel):
    url: str
    ascii_safe_url: str
    score: float
    risk_band: str
    llm: Recommendation

# ======== Startup ========
@app.on_event("startup")
def _startup():
    genai.configure(api_key=GEMINI_API_KEY)
    app.state.gemini = genai.GenerativeModel(GEMINI_MODEL)
    app.state.scorer = URLScorer()
    print(f">>> Gemini ready | model={GEMINI_MODEL}")

# ======== Routes ========
@app.get("/healthz")
def healthz():
    return {"status": "ok", "provider": "gemini", "model": GEMINI_MODEL}

@app.post("/score", response_model=ScoreResponse)
def score(req: ScoreRequest):
    safe = ascii_safe_url(req.url)
    s = app.state.scorer.score(req.url)
    b = risk_band(s)
    return ScoreResponse(url=req.url, ascii_safe_url=safe, score=s, risk_band=b)

@app.post("/recommend", response_model=RecommendResponse)
def recommend(req: RecommendRequest):
    safe = ascii_safe_url(req.url)
    s = app.state.scorer.score(req.url)
    b = risk_band(s)

    user_prompt = build_user_prompt(req.url, s, b, safe)
    out = call_gemini_json(user_prompt)

    normalized = {
        "risk_band": b,
        "action": enforce_action(b, out.get("action","allow_with_warning")),
        "confidence_note": out.get("confidence_note",""),
        "evidence": out.get("evidence", [])[:4],
        "recommended_next_steps": out.get("recommended_next_steps", [])[:4],
        "user_safe_message": out.get("user_safe_message",""),
        "notes_for_analyst": out.get("notes_for_analyst",""),
    }
    return RecommendResponse(
        url=req.url, ascii_safe_url=safe, score=s, risk_band=b, llm=Recommendation(**normalized)
    )

@app.get("/__diag")
def diag(sample: str = Query("http://secure-login.paypaI.com.verify-accounts.xyz/login")):
    safe = ascii_safe_url(sample)
    s = app.state.scorer.score(sample)
    b = risk_band(s)
    return {"ok": True, "sample": sample, "ascii": safe, "score": s, "band": b}

@app.post("/__reload")
def hot_reload():
    try:
        app.state.scorer = URLScorer()
        return {"ok": True, "reloaded": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"reload failed: {e}")
