from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_url_service, get_llm_service
from app.schemas import ApiResponse
from app.schemas.url import (
    UrlCheckRequest,
    UrlSetDeletedRequest,
    UrlSetNotesRequest,
    UrlSetRiskLevelRequest,
    UrlBatchImportRequest,
)
from app.services.url_service import UrlRiskService
from app.services.llm_service import LLMRiskService
from app.schemas.llm import GenerateResponseInput

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


@router.post("/url/evaluate", summary="Evaluate URL and return LLM recommendation")
def evaluate_url(payload: UrlCheckRequest,
                 db_svc: UrlRiskService = Depends(get_url_service),
                 llm_svc: LLMRiskService = Depends(get_llm_service)):
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
            "action": llm_svc.enforce_action(risk_band, out.get("action", "allow_with_warning")),
            "confidence_note": out.get("confidence_note", ""),
            "evidence": out.get("evidence", ""),
            "recommended_next_steps": out.get("recommended_next_steps", [])[:4],
            "user_safe_message": out.get("user_safe_message", ""),
            "notes_for_analyst": out.get("notes_for_analyst", ""),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return ApiResponse(success=True, data={
        "url": entity.full_url,
        "risk_level": entity.risk_level,
        "phishing_flag": entity.phishing_flag,
        "report_count": entity.report_count,
        "source": entity.source,
        "notes": entity.notes,
        "llm": normalized_out,
    })
    
@router.post("/url/scamcheck", summary="Perform ScamCheck evaluation on URL and return an intelligent response.")
def scamcheck_url(payload: UrlCheckRequest, 
                  db_svc: UrlRiskService = Depends(get_url_service),
                  llm_svc: LLMRiskService = Depends(get_llm_service)):
    try:
        # Get can return either UrlRisk or None
        entity = db_svc.get(url=payload.url)
        
        # When entity not in database or not memoized, then generate LLM response and update database
        # When notes are present, then it means there's a previously generated AI response we can query
        if entity is None or entity.risk_level == 0 or entity.notes is None:
            risk_level_db = 0 if entity is None else entity.risk_level
            prompt = (
                f"URL: {payload.url}\n"
                f"RISK_LEVEL: {risk_level_db}\n"
            )
            
            # Generate a risk level and response from LLM; coerce risk level to int from str
            resp = llm_svc.generate_risk_level_and_response(prompt, GenerateResponseInput(type="url"))
            risk_level_llm = int(resp.get("risk_level", 0))
            notes_llm = resp.get("response", None)
            
            # Persist AI evaluation directly into DB notes/risk_level
            # Only update risk level when it's previously unknown
            entity = db_svc.upsert(
                url=payload.url, 
                risk_level=max(risk_level_llm, risk_level_db), # Get the maximum risk level assessment between database and LLM
                notes=notes_llm)
            # Additionally record this AI evaluation as a report entry for persistence/analytics
            entity, _ = db_svc.report(
                url=payload.url,
                source="ai_model",
                notes=notes_llm,
                risk_level=max(risk_level_llm, risk_level_db) # Get the maximum risk level assessment between database and LLM
            )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return ApiResponse(success=True, data={
        "url": entity.full_url,
        "risk_level": entity.risk_level, # Should be updated by AI generated risk level
        "phishing_flag": entity.phishing_flag,
        "report_count": entity.report_count,
        "source": entity.source,
        "notes": entity.notes # This should be the AI generated notes now
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
def report_url(payload: UrlCheckRequest, db_svc: UrlRiskService = Depends(get_url_service), llm_svc: LLMRiskService = Depends(get_llm_service)):
    try:
        # Perform a scamcheck first before we report
        entity = scamcheck_url(payload, db_svc=db_svc, llm_svc=llm_svc)
        entity, already = db_svc.report(url=payload.url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return ApiResponse(success=True, data={
        "url": entity.full_url,
        "risk_level": entity.risk_level,
        "phishing_flag": entity.phishing_flag,
        "report_count": entity.report_count,
        "source": entity.source,
        "notes": entity.notes,
        "already_reported": already,
    })
