from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_mobile_service
from app.schemas.mobile import MobileCheckRequest, MobileRiskResponse
from app.services.mobile_service import MobileRiskService

router = APIRouter()


@router.post("/mobile/check", response_model=MobileRiskResponse, summary="Check or report mobile risk")
def check_mobile(payload: MobileCheckRequest, svc: MobileRiskService = Depends(get_mobile_service)):
    try:
        entity = svc.check_or_create(e164=payload.e164, country_code=payload.country_code, national_number=payload.national_number)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return MobileRiskResponse(
        e164=entity.e164,
        risk_level=entity.risk_level,
        report_count=entity.report_count,
        source=entity.source,
        notes=entity.notes,
    )


@router.post("/mobile/report", response_model=MobileRiskResponse, summary="Report a mobile as risky")
def report_mobile(payload: MobileCheckRequest, svc: MobileRiskService = Depends(get_mobile_service)):
    try:
        entity = svc.report(e164=payload.e164, country_code=payload.country_code, national_number=payload.national_number)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return MobileRiskResponse(
        e164=entity.e164,
        risk_level=entity.risk_level,
        report_count=entity.report_count,
        source=entity.source,
        notes=entity.notes,
    )
