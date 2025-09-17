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
            entity = self.repo.create_or_update(address=addr, local_part=local, domain=domain, source=None, notes=None, risk_level=0, mx_valid=0, disposable=0)
            self.session.commit()
        return entity

    def report(self, *, address: str, risk_level: int = 2, source: str = "user_report", notes: Optional[str] = None, mx_valid: int = 0, disposable: int = 0) -> EmailRisk:
        local, domain, addr = normalize_email(address)
        entity = self.repo.upsert_report(address=addr, local_part=local, domain=domain, source=source, notes=notes, risk_level=risk_level, mx_valid=mx_valid, disposable=disposable)
        self.session.commit()
        return entity

    def set_is_deleted(self, *, address: str, is_deleted: int) -> bool:
        _, _, addr = normalize_email(address)
        updated = self.repo.set_is_deleted(address=addr, is_deleted=is_deleted)
        if updated:
            self.session.commit()
        return updated

    def set_notes(self, *, address: str, notes: str | None) -> bool:
        _, _, addr = normalize_email(address)
        updated = self.repo.set_notes(address=addr, notes=notes)
        if updated:
            self.session.commit()
        return updated

    def set_risk_level(self, *, address: str, risk_level: int) -> bool:
        _, _, addr = normalize_email(address)
        updated = self.repo.set_risk_level(address=addr, risk_level=risk_level)
        if updated:
            self.session.commit()
        return updated

    def batch_import(self, items: list[tuple[str, int | None, str | None, int | None, int | None]]) -> dict:
        """Batch import emails.

        items: list of tuples (address, risk_level, notes, mx_valid, disposable)
        returns summary dict
        """
        summary = {"total": 0, "succeeded": 0, "failed": 0, "errors": []}
        for address, risk_level, notes, mx_valid, disposable in items:
            summary["total"] += 1
            try:
                local, domain, addr = normalize_email(address)
                self.repo.create_or_update(address=addr, local_part=local, domain=domain, source=None, notes=notes, risk_level=risk_level, mx_valid=mx_valid, disposable=disposable)
                summary["succeeded"] += 1
            except Exception as e:
                summary["failed"] += 1
                if len(summary["errors"]) < 20:
                    summary["errors"].append({"input": address, "error": str(e)})
                continue
        self.session.commit()
        return summary