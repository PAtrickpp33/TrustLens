from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query

# Richard: Converted helper functions, scorer, and llm call to LLMRiskService; injected dependencies
from app.api.deps import get_llm_service
from app.services.llm_service import LLMRiskService, llm_settings
from app.schemas.llm import ScoreRequest, ScoreResponse, RecommendRequest, RecommendResponse, Recommendation
from app.infrastructure.ml_model import URLScorer

router = APIRouter()

# ======== Routes ========
@router.get("/healthz", summary="Return the LLM Service's current state")
def healthz(svc: LLMRiskService = Depends(get_llm_service)):
    # Richard: Changed model from global const to svc prop
    return {"status": "ok", "provider": "gemini", "model": svc.session.model}

@router.post("/score", response_model=ScoreResponse, summary="Calculate the risk score of a URL")
def score(req: ScoreRequest, svc: LLMRiskService = Depends(get_llm_service)):
    safe = svc.ascii_safe_url(req.url)
    s = svc.session.scorer.score(req.url)
    b = svc.risk_band(s)
    return ScoreResponse(url=req.url, ascii_safe_url=safe, score=s, risk_band=b)

@router.post("/recommend", response_model=RecommendResponse, summary="Generate an AI rationale and recommendation on the URL risk score")
def recommend(req: RecommendRequest, svc: LLMRiskService = Depends(get_llm_service)):
    safe = svc.ascii_safe_url(req.url)
    s = svc.session.scorer.score(req.url)
    b = svc.risk_band(s)

    user_prompt = svc.build_user_prompt(req.url, s, b, safe)
    # Richard: Added the router as input parameter to call_gemini_json()
    out = svc.call_gemini_json(user_prompt)

    normalized = {
        "risk_band": b,
        "action": svc.enforce_action(b, out.get("action","allow_with_warning")),
        "confidence_note": out.get("confidence_note",""),
        "evidence": out.get("evidence", [])[:4],
        "recommended_next_steps": out.get("recommended_next_steps", [])[:4],
        "user_safe_message": out.get("user_safe_message",""),
        "notes_for_analyst": out.get("notes_for_analyst",""),
    }
    return RecommendResponse(
        url=req.url, ascii_safe_url=safe, score=s, risk_band=b, llm=Recommendation(**normalized)
    )

@router.get("/__diag", summary="Diagnose the LLM session's current state")
def diag(sample: str = Query("http://secure-login.paypaI.com.verify-accounts.xyz/login"), svc: LLMRiskService = Depends(get_llm_service)):
    safe = svc.ascii_safe_url(sample)
    s = svc.session.scorer.score(sample)
    b = svc.risk_band(s)
    return {"ok": True, "sample": sample, "ascii": safe, "score": s, "band": b}

@router.post("/__reload", summary="Reload the current LLM risk service's URL scoring model")
def hot_reload(svc: LLMRiskService = Depends(get_llm_service)):
    try:
        svc.session.scorer = URLScorer(llm_settings.meta_path, llm_settings.weight_path)
        return {"ok": True, "reloaded": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"reload failed: {e}")
