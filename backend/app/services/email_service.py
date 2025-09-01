from __future__ import annotations

from typing import Optional
from sqlalchemy.orm import Session

from app.core.normalization import normalize_email
from app.domain.entities import EmailRisk
from app.infrastructure.repositories import SqlAlchemyEmailRiskRepository


class EmailRiskService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = SqlAlchemyEmailRiskRepository(session)

    def check_or_create(self, *, address: str) -> EmailRisk:
        local, domain, addr = normalize_email(address)
        entity = self.repo.get_by_address(addr)
        if entity is None:
            entity = self.repo.upsert_report(address=addr, local_part=local, domain=domain, source=None, notes=None, risk_level=0, mx_valid=0, disposable=0)
            self.session.commit()
        return entity

    def report(self, *, address: str, risk_level: int = 2, source: str = "user_report", notes: Optional[str] = None, mx_valid: int = 0, disposable: int = 0) -> EmailRisk:
        local, domain, addr = normalize_email(address)
        entity = self.repo.upsert_report(address=addr, local_part=local, domain=domain, source=source, notes=notes, risk_level=risk_level, mx_valid=mx_valid, disposable=disposable)
        self.session.commit()
        return entity
