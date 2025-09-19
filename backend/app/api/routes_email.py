from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_email_service, get_llm_service
from app.schemas import ApiResponse
from app.schemas.email import (
    EmailCheckRequest,
    EmailSetDeletedRequest,
    EmailSetNotesRequest,
    EmailSetRiskLevelRequest,
    EmailBatchImportRequest,
)
from app.services.email_service import EmailRiskService
from app.services.llm_service import LLMRiskService
from app.schemas.llm import GenerateResponseInput

router = APIRouter()


@router.post("/email/check", summary="Check or report email risk")
def check_email(payload: EmailCheckRequest, svc: EmailRiskService = Depends(get_email_service)):
    try:
        entity = svc.check_or_create(address=payload.address)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return ApiResponse(success=True, data={
        "address": entity.address,
        "risk_level": entity.risk_level,
        "mx_valid": entity.mx_valid,
        "disposable": entity.disposable,
        "report_count": entity.report_count,
        "source": entity.source,
        "notes": entity.notes,
    })
    
@router.post("/email/scamcheck", summary="Perform ScamCheck evaluation on email and return an intelligent response.")
def scamcheck_email(payload: EmailCheckRequest, 
                  db_svc: EmailRiskService = Depends(get_email_service),
                  llm_svc: LLMRiskService = Depends(get_llm_service)):
    try:
        # Get can return either EmailRisk or None
        entity = db_svc.get(address=payload.address)
        
        # When entity not in database or not memoized, then generate LLM response and update database
        # When notes are present, then it means there's a previously generated AI response we can query
        if entity is None or entity.risk_level == 0 or entity.notes is None:
            risk_level_db = 0 if entity is None else entity.risk_level
            prompt = (
                f"ADDRESS: {payload.address}\n"
                f"RISK_LEVEL: {risk_level_db}\n"
            )
            
            # Generate a risk level and response from LLM; coerce risk level to int from str
            resp = llm_svc.generate_risk_level_and_response(prompt, GenerateResponseInput(type="email address"))
            risk_level_llm = int(resp.get("risk_level", 0))
            notes_llm = resp.get("response", None)
            
            # Now update the database with risk_level and notes
            # Only update risk level when it's previously unknown
            entity = db_svc.upsert(
                address=payload.address, 
                risk_level=max(risk_level_llm, risk_level_db), 
                notes=notes_llm)
            # Additionally record this AI evaluation as a report entry for persistence/analytics
            entity, _ = db_svc.report(
                address=payload.address,
                source="ai_model",
                notes=notes_llm,
                risk_level=max(risk_level_llm, risk_level_db)
            )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return ApiResponse(success=True, data={
        "address": entity.address,
        "risk_level": entity.risk_level,
        "mx_valid": entity.mx_valid,
        "disposable": entity.disposable,
        "report_count": entity.report_count,
        "source": entity.source,
        "notes": entity.notes
    })

@router.post("/email/report", summary="Report an email as risky")
def report_email(payload: EmailCheckRequest, db_svc: EmailRiskService = Depends(get_email_service), llm_svc = Depends(get_llm_service)):
    try:
        # Perform email address scamcheck first
        entity = scamcheck_email(payload, db_svc=db_svc, llm_svc=llm_svc)
        entity, already = db_svc.report(address=payload.address, source="user_report")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return ApiResponse(success=True, data={
        "address": entity.address,
        "risk_level": entity.risk_level,
        "mx_valid": entity.mx_valid,
        "disposable": entity.disposable,
        "report_count": entity.report_count,
        "source": entity.source,
        "notes": entity.notes,
        "already_reported": already,
    })

@router.post("/email/set_deleted", summary="Set soft delete flag for an email")
def set_email_deleted(payload: EmailSetDeletedRequest, svc: EmailRiskService = Depends(get_email_service)):
    try:
        ok = svc.set_is_deleted(address=payload.address, is_deleted=payload.is_deleted)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not ok:
        raise HTTPException(status_code=404, detail="Email not found")
    return ApiResponse(success=True, data=None)


@router.post("/email/set_notes", summary="Set notes for an email")
def set_email_notes(payload: EmailSetNotesRequest, svc: EmailRiskService = Depends(get_email_service)):
    try:
        ok = svc.set_notes(address=payload.address, notes=payload.notes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not ok:
        raise HTTPException(status_code=404, detail="Email not found or deleted")
    return ApiResponse(success=True, data=None)


@router.post("/email/set_risk_level", summary="Set risk level for an email")
def set_email_risk_level(payload: EmailSetRiskLevelRequest, svc: EmailRiskService = Depends(get_email_service)):
    try:
        ok = svc.set_risk_level(address=payload.address, risk_level=payload.risk_level)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not ok:
        raise HTTPException(status_code=404, detail="Email not found or deleted")
    return ApiResponse(success=True, data=None)


@router.post("/email/import", summary="Batch import email records")
def import_emails(payload: EmailBatchImportRequest, svc: EmailRiskService = Depends(get_email_service)):
    summary = svc.batch_import([(item.address, item.risk_level, item.notes, item.mx_valid, item.disposable) for item in payload.items])
    return ApiResponse(success=True, data=summary)
