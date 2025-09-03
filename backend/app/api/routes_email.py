from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_email_service
from app.schemas import ApiResponse
from app.schemas.email import (
    EmailCheckRequest,
    EmailSetDeletedRequest,
    EmailSetNotesRequest,
    EmailSetRiskLevelRequest,
    EmailBatchImportRequest,
)
from app.services.email_service import EmailRiskService

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


@router.post("/email/report", summary="Report an email as risky")
def report_email(payload: EmailCheckRequest, svc: EmailRiskService = Depends(get_email_service)):
    try:
        entity = svc.report(address=payload.address)
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
