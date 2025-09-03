from __future__ import annotations

from typing import Optional
from sqlalchemy.orm import Session

from app.core.normalization import normalize_phone
from app.domain.entities import MobileRisk
from app.infrastructure.repositories import SqlAlchemyMobileRiskRepository


class MobileRiskService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = SqlAlchemyMobileRiskRepository(session)

    def check_or_create(self, *, e164: Optional[str] = None, country_code: Optional[str] = None, national_number: Optional[str] = None) -> MobileRisk:
        e164_norm, cc, nn = normalize_phone(e164=e164, country_code=country_code, national_number=national_number)
        entity = self.repo.get_by_e164(e164_norm)
        if entity is None:
            entity = self.repo.upsert_report(e164=e164_norm, country_code=cc, national_number=nn, source=None, notes=None, risk_level=0)
            self.session.commit()
        return entity

    def report(self, *, e164: Optional[str] = None, country_code: Optional[str] = None, national_number: Optional[str] = None, risk_level: int = 2, source: str = "user_report", notes: Optional[str] = None) -> MobileRisk:
        e164_norm, cc, nn = normalize_phone(e164=e164, country_code=country_code, national_number=national_number)
        entity = self.repo.upsert_report(e164=e164_norm, country_code=cc, national_number=nn, source=source, notes=notes, risk_level=risk_level)
        self.session.commit()
        return entity

    def set_is_deleted(self, *, e164: str, is_deleted: int) -> bool:
        e164_norm, _, _ = normalize_phone(e164=e164, country_code=None, national_number=None)
        updated = self.repo.set_is_deleted(e164=e164_norm, is_deleted=is_deleted)
        if updated:
            self.session.commit()
        return updated

    def set_notes(self, *, e164: str, notes: str | None) -> bool:
        e164_norm, _, _ = normalize_phone(e164=e164, country_code=None, national_number=None)
        updated = self.repo.set_notes(e164=e164_norm, notes=notes)
        if updated:
            self.session.commit()
        return updated

    def set_risk_level(self, *, e164: str, risk_level: int) -> bool:
        e164_norm, _, _ = normalize_phone(e164=e164, country_code=None, national_number=None)
        updated = self.repo.set_risk_level(e164=e164_norm, risk_level=risk_level)
        if updated:
            self.session.commit()
        return updated

    def batch_import(self, items: list[tuple[str, int | None, str | None]]) -> dict:
        """Batch import mobiles.

        items: list of tuples (e164, risk_level, notes)
        returns summary dict
        """
        summary = {"total": 0, "succeeded": 0, "failed": 0, "errors": []}
        for e164, risk_level, notes in items:
            summary["total"] += 1
            try:
                e164_norm, cc, nn = normalize_phone(e164=e164, country_code=None, national_number=None)
                self.repo.upsert_report(e164=e164_norm, country_code=cc, national_number=nn, source=None, notes=notes, risk_level=risk_level)
                summary["succeeded"] += 1
            except Exception as e:
                summary["failed"] += 1
                if len(summary["errors"]) < 20:
                    summary["errors"].append({"input": e164, "error": str(e)})
                continue
        self.session.commit()
        return summary