from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.entities import MobileRisk, EmailRisk, UrlRisk
from app.domain.repositories import MobileRiskRepository, EmailRiskRepository, UrlRiskRepository
from app.infrastructure.models import RiskMobile, RiskEmail, RiskUrl


class SqlAlchemyMobileRiskRepository(MobileRiskRepository):
    def __init__(self, session: Session):
        self.session = session

    def get_by_e164(self, e164: str) -> Optional[MobileRisk]:
        stmt = select(RiskMobile).where(RiskMobile.e164 == e164, RiskMobile.is_deleted == 0)
        row = self.session.execute(stmt).scalar_one_or_none()
        if not row:
            return None
        return MobileRisk(
            id=row.id,
            country_code=row.country_code,
            national_number=row.national_number,
            e164=row.e164,
            risk_level=row.risk_level,
            source=row.source,
            report_count=row.report_count,
            last_reported_at=row.last_reported_at,
            notes=row.notes,
        )

    def set_is_deleted(self, *, e164: str, is_deleted: int) -> bool:
        stmt = select(RiskMobile).where(RiskMobile.e164 == e164)
        row = self.session.execute(stmt).scalar_one_or_none()
        if row is None:
            return False
        row.is_deleted = 1 if is_deleted else 0
        self.session.flush()
        return True

    def set_notes(self, *, e164: str, notes: str | None) -> bool:
        stmt = select(RiskMobile).where(RiskMobile.e164 == e164, RiskMobile.is_deleted == 0)
        row = self.session.execute(stmt).scalar_one_or_none()
        if row is None:
            return False
        row.notes = notes
        self.session.flush()
        return True

    def set_risk_level(self, *, e164: str, risk_level: int) -> bool:
        stmt = select(RiskMobile).where(RiskMobile.e164 == e164, RiskMobile.is_deleted == 0)
        row = self.session.execute(stmt).scalar_one_or_none()
        if row is None:
            return False
        row.risk_level = risk_level
        self.session.flush()
        return True

    def upsert_report(self, *, e164: str, country_code: str, national_number: str, source: Optional[str], notes: Optional[str], risk_level: Optional[int]) -> MobileRisk:
        stmt = select(RiskMobile).where(RiskMobile.e164 == e164)
        row = self.session.execute(stmt).scalar_one_or_none()
        now = datetime.utcnow()
        if row is None:
            row = RiskMobile(
                country_code=country_code,
                national_number=national_number,
                e164=e164,
                risk_level=risk_level or 0,
                source=source,
                report_count=1,
                last_reported_at=now,
                notes=notes,
                is_deleted=0,
            )
            self.session.add(row)
        else:
            row.report_count = (row.report_count or 0) + 1
            row.last_reported_at = now
            if risk_level is not None:
                row.risk_level = risk_level
            if source:
                row.source = source
            if notes:
                row.notes = notes
        self.session.flush()
        return MobileRisk(
            id=row.id,
            country_code=row.country_code,
            national_number=row.national_number,
            e164=row.e164,
            risk_level=row.risk_level,
            source=row.source,
            report_count=row.report_count,
            last_reported_at=row.last_reported_at,
            notes=row.notes,
        )


class SqlAlchemyEmailRiskRepository(EmailRiskRepository):
    def __init__(self, session: Session):
        self.session = session

    def get_by_address(self, address: str) -> Optional[EmailRisk]:
        stmt = select(RiskEmail).where(RiskEmail.address == address, RiskEmail.is_deleted == 0)
        row = self.session.execute(stmt).scalar_one_or_none()
        if not row:
            return None
        return EmailRisk(
            id=row.id,
            local_part=row.local_part,
            domain=row.domain,
            address=row.address,
            risk_level=row.risk_level,
            mx_valid=row.mx_valid,
            disposable=row.disposable,
            source=row.source,
            report_count=row.report_count,
            last_reported_at=row.last_reported_at,
            notes=row.notes,
        )

    def set_is_deleted(self, *, address: str, is_deleted: int) -> bool:
        stmt = select(RiskEmail).where(RiskEmail.address == address)
        row = self.session.execute(stmt).scalar_one_or_none()
        if row is None:
            return False
        row.is_deleted = 1 if is_deleted else 0
        self.session.flush()
        return True

    def set_notes(self, *, address: str, notes: str | None) -> bool:
        stmt = select(RiskEmail).where(RiskEmail.address == address, RiskEmail.is_deleted == 0)
        row = self.session.execute(stmt).scalar_one_or_none()
        if row is None:
            return False
        row.notes = notes
        self.session.flush()
        return True

    def set_risk_level(self, *, address: str, risk_level: int) -> bool:
        stmt = select(RiskEmail).where(RiskEmail.address == address, RiskEmail.is_deleted == 0)
        row = self.session.execute(stmt).scalar_one_or_none()
        if row is None:
            return False
        row.risk_level = risk_level
        self.session.flush()
        return True

    def upsert_report(self, *, address: str, local_part: str, domain: str, source: Optional[str], notes: Optional[str], risk_level: Optional[int], mx_valid: Optional[int], disposable: Optional[int]) -> EmailRisk:
        stmt = select(RiskEmail).where(RiskEmail.address == address)
        row = self.session.execute(stmt).scalar_one_or_none()
        now = datetime.utcnow()
        if row is None:
            row = RiskEmail(
                local_part=local_part,
                domain=domain,
                address=address,
                risk_level=risk_level or 0,
                mx_valid=mx_valid or 0,
                disposable=disposable or 0,
                source=source,
                report_count=1,
                last_reported_at=now,
                notes=notes,
                is_deleted=0,
            )
            self.session.add(row)
        else:
            row.report_count = (row.report_count or 0) + 1
            row.last_reported_at = now
            if risk_level is not None:
                row.risk_level = risk_level
            if mx_valid is not None:
                row.mx_valid = mx_valid
            if disposable is not None:
                row.disposable = disposable
            if source:
                row.source = source
            if notes:
                row.notes = notes
        self.session.flush()
        return EmailRisk(
            id=row.id,
            local_part=row.local_part,
            domain=row.domain,
            address=row.address,
            risk_level=row.risk_level,
            mx_valid=row.mx_valid,
            disposable=row.disposable,
            source=row.source,
            report_count=row.report_count,
            last_reported_at=row.last_reported_at,
            notes=row.notes,
        )


class SqlAlchemyUrlRiskRepository(UrlRiskRepository):
    def __init__(self, session: Session):
        self.session = session

    def get_by_sha256(self, url_sha256: str) -> Optional[UrlRisk]:
        stmt = select(RiskUrl).where(RiskUrl.url_sha256 == url_sha256, RiskUrl.is_deleted == 0)
        row = self.session.execute(stmt).scalar_one_or_none()
        if not row:
            return None
        return UrlRisk(
            id=row.id,
            scheme=row.scheme,
            host=row.host,
            registrable_domain=row.registrable_domain,
            full_url=row.full_url,
            url_sha256=row.url_sha256,
            risk_level=row.risk_level,
            phishing_flag=row.phishing_flag,
            source=row.source,
            report_count=row.report_count,
            last_reported_at=row.last_reported_at,
            notes=row.notes,
        )

    def set_is_deleted_by_sha(self, *, url_sha256: str, is_deleted: int) -> bool:
        stmt = select(RiskUrl).where(RiskUrl.url_sha256 == url_sha256)
        row = self.session.execute(stmt).scalar_one_or_none()
        if row is None:
            return False
        row.is_deleted = 1 if is_deleted else 0
        self.session.flush()
        return True

    def set_notes_by_sha(self, *, url_sha256: str, notes: str | None) -> bool:
        stmt = select(RiskUrl).where(RiskUrl.url_sha256 == url_sha256, RiskUrl.is_deleted == 0)
        row = self.session.execute(stmt).scalar_one_or_none()
        if row is None:
            return False
        row.notes = notes
        self.session.flush()
        return True

    def set_risk_level_by_sha(self, *, url_sha256: str, risk_level: int) -> bool:
        stmt = select(RiskUrl).where(RiskUrl.url_sha256 == url_sha256, RiskUrl.is_deleted == 0)
        row = self.session.execute(stmt).scalar_one_or_none()
        if row is None:
            return False
        row.risk_level = risk_level
        self.session.flush()
        return True

    def upsert_report(self, *, full_url: str, url_sha256: str, scheme: str, host: str, registrable_domain: Optional[str], source: Optional[str], notes: Optional[str], risk_level: Optional[int], phishing_flag: Optional[int]) -> UrlRisk:
        stmt = select(RiskUrl).where(RiskUrl.url_sha256 == url_sha256)
        row = self.session.execute(stmt).scalar_one_or_none()
        now = datetime.utcnow()
        if row is None:
            row = RiskUrl(
                scheme=scheme,
                host=host,
                registrable_domain=registrable_domain,
                full_url=full_url,
                url_sha256=url_sha256,
                risk_level=risk_level or 0,
                phishing_flag=phishing_flag or 0,
                source=source,
                report_count=1,
                last_reported_at=now,
                notes=notes,
                is_deleted=0,
            )
            self.session.add(row)
        else:
            row.report_count = (row.report_count or 0) + 1
            row.last_reported_at = now
            if risk_level is not None:
                row.risk_level = risk_level
            if phishing_flag is not None:
                row.phishing_flag = phishing_flag
            if source:
                row.source = source
            if notes:
                row.notes = notes
        self.session.flush()
        return UrlRisk(
            id=row.id,
            scheme=row.scheme,
            host=row.host,
            registrable_domain=row.registrable_domain,
            full_url=row.full_url,
            url_sha256=row.url_sha256,
            risk_level=row.risk_level,
            phishing_flag=row.phishing_flag,
            source=row.source,
            report_count=row.report_count,
            last_reported_at=row.last_reported_at,
            notes=row.notes,
        )
