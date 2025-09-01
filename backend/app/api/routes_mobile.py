from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_mobile_service
from app.schemas.mobile import (
    MobileCheckRequest,
    MobileRiskResponse,
    MobileSetDeletedRequest,
    MobileSetNotesRequest,
    MobileSetRiskLevelRequest,
    MobileBatchImportRequest,
)
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


@router.post("/mobile/set_deleted", summary="Set soft delete flag for a mobile")
def set_mobile_deleted(payload: MobileSetDeletedRequest, svc: MobileRiskService = Depends(get_mobile_service)):
    try:
        ok = svc.set_is_deleted(e164=payload.e164, is_deleted=payload.is_deleted)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not ok:
        raise HTTPException(status_code=404, detail="Mobile not found")
    return {"success": True}


@router.post("/mobile/set_notes", summary="Set notes for a mobile")
def set_mobile_notes(payload: MobileSetNotesRequest, svc: MobileRiskService = Depends(get_mobile_service)):
    try:
        ok = svc.set_notes(e164=payload.e164, notes=payload.notes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not ok:
        raise HTTPException(status_code=404, detail="Mobile not found or deleted")
    return {"success": True}


@router.post("/mobile/set_risk_level", summary="Set risk level for a mobile")
def set_mobile_risk_level(payload: MobileSetRiskLevelRequest, svc: MobileRiskService = Depends(get_mobile_service)):
    try:
        ok = svc.set_risk_level(e164=payload.e164, risk_level=payload.risk_level)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not ok:
        raise HTTPException(status_code=404, detail="Mobile not found or deleted")
    return {"success": True}


@router.post("/mobile/import", summary="Batch import mobile records")
def import_mobiles(payload: MobileBatchImportRequest, svc: MobileRiskService = Depends(get_mobile_service)):
    count = svc.batch_import([(item.e164, item.risk_level, item.notes) for item in payload.items])
    return {"processed": count}
