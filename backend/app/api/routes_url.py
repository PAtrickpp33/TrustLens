from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_url_service
from app.schemas.url import UrlCheckRequest, UrlRiskResponse
from app.services.url_service import UrlRiskService

router = APIRouter()


@router.post("/url/check", response_model=UrlRiskResponse, summary="Check or report URL risk")
def check_url(payload: UrlCheckRequest, svc: UrlRiskService = Depends(get_url_service)):
    try:
        entity = svc.check_or_create(url=payload.url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return UrlRiskResponse(
        url=entity.full_url,
        risk_level=entity.risk_level,
        phishing_flag=entity.phishing_flag,
        report_count=entity.report_count,
        source=entity.source,
        notes=entity.notes,
    )


@router.post("/url/report", response_model=UrlRiskResponse, summary="Report a URL as risky")
def report_url(payload: UrlCheckRequest, svc: UrlRiskService = Depends(get_url_service)):
    try:
        entity = svc.report(url=payload.url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return UrlRiskResponse(
        url=entity.full_url,
        risk_level=entity.risk_level,
        phishing_flag=entity.phishing_flag,
        report_count=entity.report_count,
        source=entity.source,
        notes=entity.notes,
    )
