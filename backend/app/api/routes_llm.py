from __future__ import annotations
from email.policy import HTTP

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

# Richard: Converted helper functions, scorer, and llm call to LLMRiskService; injected dependencies
from app.api.deps import get_llm_service
from app.services.llm_service import LLMRiskService
from app.schemas.llm import ScoreRequest, ScoreResponse, RecommendRequest, RecommendResponse, Recommendation
from app.infrastructure.ml_model import URLScorer
from app.schemas import ApiResponse

router = APIRouter()

# Richard: Helper function to convert data to dict to fit ApiResponse schema
def _dump(model: BaseModel) -> dict:
    # Pydantic v2 uses model_dump(); v1 uses dict()
    return model.model_dump() if hasattr(model, "model_dump") else model.dict()

# ======== Routes ========
@router.get("/llm/healthz", response_model=ApiResponse, summary="Return the LLM Service's current state")
def healthz(svc: LLMRiskService = Depends(get_llm_service)):
    # Richard: Changed model from global const to svc prop
    return ApiResponse(success=True, data={"status": "ok", "provider": "gemini", "model": svc.session.model})

@router.post("/llm/score", response_model=ApiResponse, summary="Calculate the risk score of a URL")
def score(req: ScoreRequest, svc: LLMRiskService = Depends(get_llm_service)):
    try:
        safe = svc.ascii_safe_url(req.url)
        s = svc.session.scorer.score(req.url)
        b = svc.risk_band(s)
        payload = ScoreResponse(url=req.url, ascii_safe_url=safe, score=s, risk_band=b)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return ApiResponse(success=True, data=_dump(payload))

@router.post("/llm/recommend", response_model=ApiResponse, summary="Generate an AI rationale and recommendation on the URL risk score")
def recommend(req: RecommendRequest, svc: LLMRiskService = Depends(get_llm_service)):
    try:
        safe = svc.ascii_safe_url(req.url)
        s = svc.session.scorer.score(req.url)
        b = svc.risk_band(s)
        user_prompt = svc.build_user_prompt(url_raw=req.url, score=s, band=b, safe_url=safe)
        out = svc.call_gemini_json(user_prompt)
        
        normalized = {
            "risk_band": b,
            "action": svc.enforce_action(b, out.get("action","allow_with_warning")),
            "confidence_note": out.get("confidence_note",""),
            "evidence": out.get("evidence", ""),
            "recommended_next_steps": out.get("recommended_next_steps", [])[:4],
            "user_safe_message": out.get("user_safe_message",""),
            "notes_for_analyst": out.get("notes_for_analyst",""),
        }
        payload = RecommendResponse(url=req.url, ascii_safe_url=safe, score=s, risk_band=b, llm=Recommendation(**normalized))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    return ApiResponse(success=True, data=_dump(payload))

@router.get("/llm/__diag", summary="Diagnose the LLM session's current state")
def diag(sample: str = Query("http://secure-login.paypaI.com.verify-accounts.xyz/login"), svc: LLMRiskService = Depends(get_llm_service)):
    try:
        safe = svc.ascii_safe_url(sample)
        s = svc.session.scorer.score(sample)
        b = svc.risk_band(s)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    return ApiResponse(success=True, data={"ok": True, "sample": sample, "ascii": safe, "score": s, "band": b})

@router.post("/llm/__reload", response_model=ApiResponse, summary="Reload the current LLM risk service's URL scoring model")
def hot_reload(svc: LLMRiskService = Depends(get_llm_service)):
    try:
        svc.session.scorer = URLScorer(svc.session.META_PATH, svc.session.WEIGHT_PATH)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"reload failed: {e}")
    
    return ApiResponse(success=True, data={"ok": True, "reloaded": True})
