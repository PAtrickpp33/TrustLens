from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_url_service
from app.schemas.url import (
    UrlCheckRequest,
    UrlRiskResponse,
    UrlSetDeletedRequest,
    UrlSetNotesRequest,
    UrlSetRiskLevelRequest,
    UrlBatchImportRequest,
)
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


@router.post("/url/set_deleted", summary="Set soft delete flag for a URL")
def set_url_deleted(payload: UrlSetDeletedRequest, svc: UrlRiskService = Depends(get_url_service)):
    try:
        ok = svc.set_is_deleted(url=payload.url, is_deleted=payload.is_deleted)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not ok:
        raise HTTPException(status_code=404, detail="URL not found")
    return {"success": True}


@router.post("/url/set_notes", summary="Set notes for a URL")
def set_url_notes(payload: UrlSetNotesRequest, svc: UrlRiskService = Depends(get_url_service)):
    try:
        ok = svc.set_notes(url=payload.url, notes=payload.notes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not ok:
        raise HTTPException(status_code=404, detail="URL not found or deleted")
    return {"success": True}


@router.post("/url/set_risk_level", summary="Set risk level for a URL")
def set_url_risk_level(payload: UrlSetRiskLevelRequest, svc: UrlRiskService = Depends(get_url_service)):
    try:
        ok = svc.set_risk_level(url=payload.url, risk_level=payload.risk_level)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not ok:
        raise HTTPException(status_code=404, detail="URL not found or deleted")
    return {"success": True}


@router.post("/url/import", summary="Batch import URL records")
def import_urls(payload: UrlBatchImportRequest, svc: UrlRiskService = Depends(get_url_service)):
    count = svc.batch_import([(item.url, item.risk_level, item.phishing_flag, item.notes) for item in payload.items])
    return {"processed": count}


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
