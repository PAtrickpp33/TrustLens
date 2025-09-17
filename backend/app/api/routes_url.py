from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_url_service, get_llm_service
from app.schemas import ApiResponse
from app.schemas.url import (
    UrlCheckRequest,
    UrlRiskResponse,
    UrlSetDeletedRequest,
    UrlSetNotesRequest,
    UrlSetRiskLevelRequest,
    UrlBatchImportRequest,
)
from app.services.url_service import UrlRiskService
from app.services.llm_service import LLMRiskService

router = APIRouter()


@router.post("/url/check", summary="Check or report URL risk")
def check_url(payload: UrlCheckRequest, svc: UrlRiskService = Depends(get_url_service)):
    try:
        entity = svc.check_or_create(url=payload.url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return ApiResponse(success=True, data={
        "url": entity.full_url,
        "risk_level": entity.risk_level,
        "phishing_flag": entity.phishing_flag,
        "report_count": entity.report_count,
        "source": entity.source,
        "notes": entity.notes,
    })

# Richard: Logic for memoized URL evaluation + LLM summarization
# 1. User inputs a URL, and clicks evaluate button (event) -> Send payload to API
# 2. Query database given URL payload
# 3.1. If URL in database, get data
# 3.2. If URL not in database, then URL is normalized and sent to ML model for scoring
# 3.2.1. ML model will score URL; probabilistic risk score -> risk_level={1,2,3,4}
# 3.2.2. Model results will be memoized in database using svc.check_or_create()
# 3.2.3. Same as 3.1., get data
# 4. Send data to LLM for summarization + recommendation in strict JSON format
# 5. Send LLM response to frontend in JSON format
@router.post("/url/evaluate", summary="Evaluate the URL by querying the database and returning comprehensive evaluation. If unknown, then evaluate using an ML model.")
def evaluate_url(payload: UrlCheckRequest, db_svc: UrlRiskService = Depends(get_url_service), llm_svc: LLMRiskService = Depends(get_llm_service)):
    try:
        entity = db_svc.check_or_create(url=payload.url)
        risk_band = llm_svc.risk_level_to_risk_band(entity.risk_level)
        prompt = (
            f"ORIGINAL_URL: {payload.url}\n"
            f"ASCII_SAFE_URL: {entity.full_url}\n"
            f"NOTES: {entity.notes}\n"
            f"RISK_BAND: {risk_band}\n"
        )
        out = llm_svc.call_gemini_json(prompt)
        normalized_out = {
            "risk_band": risk_band,
            "action": llm_svc.enforce_action(risk_band, out.get("action","allow_with_warning")),
            "confidence_note": out.get("confidence_note",""),
            "evidence": out.get("evidence", ""),
            "recommended_next_steps": out.get("recommended_next_steps", [])[:4],
            "user_safe_message": out.get("user_safe_message",""),
            "notes_for_analyst": out.get("notes_for_analyst",""),
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    return ApiResponse(
        success=True, 
        data={
            "url": entity.full_url,
            "risk_level": entity.risk_level,
            "phishing_flag": entity.phishing_flag,
            "report_count": entity.report_count,
            "source": entity.source,
            "notes": entity.notes,
            "llm": normalized_out
    })

@router.post("/url/set_deleted", summary="Set soft delete flag for a URL")
def set_url_deleted(payload: UrlSetDeletedRequest, svc: UrlRiskService = Depends(get_url_service)):
    try:
        ok = svc.set_is_deleted(url=payload.url, is_deleted=payload.is_deleted)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not ok:
        raise HTTPException(status_code=404, detail="URL not found")
    return ApiResponse(success=True, data=None)

@router.post("/url/set_notes", summary="Set notes for a URL")
def set_url_notes(payload: UrlSetNotesRequest, svc: UrlRiskService = Depends(get_url_service)):
    try:
        ok = svc.set_notes(url=payload.url, notes=payload.notes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not ok:
        raise HTTPException(status_code=404, detail="URL not found or deleted")
    return ApiResponse(success=True, data=None)


@router.post("/url/set_risk_level", summary="Set risk level for a URL")
def set_url_risk_level(payload: UrlSetRiskLevelRequest, svc: UrlRiskService = Depends(get_url_service)):
    try:
        ok = svc.set_risk_level(url=payload.url, risk_level=payload.risk_level)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not ok:
        raise HTTPException(status_code=404, detail="URL not found or deleted")
    return ApiResponse(success=True, data=None)


@router.post("/url/import", summary="Batch import URL records")
def import_urls(payload: UrlBatchImportRequest, svc: UrlRiskService = Depends(get_url_service)):
    summary = svc.batch_import([(item.url, item.risk_level, item.phishing_flag, item.notes) for item in payload.items])
    return ApiResponse(success=True, data=summary)


@router.post("/url/report", summary="Report a URL as risky")
def report_url(payload: UrlCheckRequest, svc: UrlRiskService = Depends(get_url_service)):
    try:
        entity = svc.report(url=payload.url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return ApiResponse(success=True, data={
        "url": entity.full_url,
        "risk_level": entity.risk_level,
        "phishing_flag": entity.phishing_flag,
        "report_count": entity.report_count,
        "source": entity.source,
        "notes": entity.notes,
    })
