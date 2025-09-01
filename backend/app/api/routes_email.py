from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_email_service
from app.schemas.email import EmailCheckRequest, EmailRiskResponse
from app.services.email_service import EmailRiskService

router = APIRouter()


@router.post("/email/check", response_model=EmailRiskResponse, summary="Check or report email risk")
def check_email(payload: EmailCheckRequest, svc: EmailRiskService = Depends(get_email_service)):
    try:
        entity = svc.check_or_create(address=payload.address)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return EmailRiskResponse(
        address=entity.address,
        risk_level=entity.risk_level,
        mx_valid=entity.mx_valid,
        disposable=entity.disposable,
        report_count=entity.report_count,
        source=entity.source,
        notes=entity.notes,
    )


@router.post("/email/report", response_model=EmailRiskResponse, summary="Report an email as risky")
def report_email(payload: EmailCheckRequest, svc: EmailRiskService = Depends(get_email_service)):
    try:
        entity = svc.report(address=payload.address)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return EmailRiskResponse(
        address=entity.address,
        risk_level=entity.risk_level,
        mx_valid=entity.mx_valid,
        disposable=entity.disposable,
        report_count=entity.report_count,
        source=entity.source,
        notes=entity.notes,
    )
