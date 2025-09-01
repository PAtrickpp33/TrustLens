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
