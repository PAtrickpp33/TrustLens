from __future__ import annotations

from typing import Optional, Tuple
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.core.normalization import normalize_email
from app.domain.entities import EmailRisk
from app.infrastructure.repositories import SqlAlchemyEmailRiskRepository


def _same_utc_day(a: datetime | None, b: datetime | None) -> bool:
    if not a or not b:
        return False
    return a.astimezone(timezone.utc).date() == b.astimezone(timezone.utc).date()


class EmailRiskService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = SqlAlchemyEmailRiskRepository(session)

    def get(self, *, address: str):
        _, _, addr = normalize_email(address)
        entity = self.repo.get_by_address(addr)
        return entity
    
    def upsert(self, address: str, **kwargs):
        local, domain, addr = normalize_email(address)
        # kwargs should override the default values if provided
        payload = {
            "address": addr,
            "local_part": local,
            "domain": domain,
            "source": None,
            "notes": None,
            "risk_level": 0,
            "mx_valid": 0,
            "disposable": 0,
        }
        payload.update(kwargs)
        entity = self.repo.create_or_update(
            address=payload["address"],
            local_part=payload["local_part"],
            domain=payload["domain"],
            source=payload["source"],
            notes=payload["notes"],
            risk_level=payload["risk_level"] if payload["risk_level"] in [0,1,2,3,4] else 0,
            mx_valid=payload["mx_valid"],
            disposable=payload["disposable"],
        )
        self.session.commit()
        return entity
    
    def check_or_create(self, *, address: str) -> EmailRisk:
        local, domain, addr = normalize_email(address)
        entity = self.repo.get_by_address(addr)
        if entity is None:
            entity = self.repo.create_or_update(
                address=addr,
                local_part=local,
                domain=domain,
                source=None,
                notes=None,
                risk_level=0,
                mx_valid=0,
                disposable=0,
            )
            self.session.commit()
        return entity

    def report(
        self,
        *,
        address: str,
        mx_valid: int = 0,
        disposable: int = 0,
        source: str = "user_report",
        notes: Optional[str] = None,
        risk_level: Optional[int] = None
        ) -> Tuple[EmailRisk, bool]:
        """
        Report an email as risky.
        Returns (entity, already_reported_today)
        """
        local, domain, addr = normalize_email(address)
        existing = self.repo.get_by_address(addr)
        now = datetime.now(timezone.utc)

        # اگر امروز قبلا گزارش شده باشد، دوباره نمی‌شماریم
        if existing and _same_utc_day(existing.last_reported_at, now):
            return existing, True

        # در غیر این صورت گزارش را ثبت/افزایش می‌کنیم
        entity = self.repo.upsert_report(
            address=addr,
            local_part=local,
            domain=domain,
            source=existing.source if existing else source,
            notes=existing.notes if existing else notes,
            risk_level=existing.risk_level if existing else (risk_level if risk_level else 2),  # پیش‌فرض
            mx_valid=existing.mx_valid if existing else mx_valid,
            disposable=existing.disposable if existing else disposable,
        )
        self.session.commit()
        return entity, False

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
        """Batch import emails: (address, risk_level, notes, mx_valid, disposable)"""
        summary = {"total": 0, "succeeded": 0, "failed": 0, "errors": []}
        for address, risk_level, notes, mx_valid, disposable in items:
            summary["total"] += 1
            try:
                local, domain, addr = normalize_email(address)
                self.repo.create_or_update(
                    address=addr,
                    local_part=local,
                    domain=domain,
                    source=None,
                    notes=notes,
                    risk_level=risk_level,
                    mx_valid=mx_valid,
                    disposable=disposable,
                )
                summary["succeeded"] += 1
            except Exception as e:
                summary["failed"] += 1
                if len(summary["errors"]) < 20:
                    summary["errors"].append({"input": address, "error": str(e)})
                continue
        self.session.commit()
        return summary
