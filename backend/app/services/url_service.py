from __future__ import annotations

from typing import Optional
from sqlalchemy.orm import Session

from app.core.normalization import normalize_url
from app.domain.entities import UrlRisk
from app.infrastructure.repositories import SqlAlchemyUrlRiskRepository


class UrlRiskService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = SqlAlchemyUrlRiskRepository(session)

    def check_or_create(self, *, url: str) -> UrlRisk:
        normalized, scheme, host, registrable, sha = normalize_url(url)
        entity = self.repo.get_by_sha256(sha)
        if entity is None:
            entity = self.repo.upsert_report(full_url=normalized, url_sha256=sha, scheme=scheme, host=host, registrable_domain=registrable, source=None, notes=None, risk_level=0, phishing_flag=0)
            self.session.commit()
        return entity

    def report(self, *, url: str, risk_level: int = 2, phishing_flag: int = 1, source: str = "user_report", notes: Optional[str] = None) -> UrlRisk:
        normalized, scheme, host, registrable, sha = normalize_url(url)
        entity = self.repo.upsert_report(full_url=normalized, url_sha256=sha, scheme=scheme, host=host, registrable_domain=registrable, source=source, notes=notes, risk_level=risk_level, phishing_flag=phishing_flag)
        self.session.commit()
        return entity

    def set_is_deleted(self, *, url: str, is_deleted: int) -> bool:
        _, _, _, _, sha = normalize_url(url)
        updated = self.repo.set_is_deleted_by_sha(url_sha256=sha, is_deleted=is_deleted)
        if updated:
            self.session.commit()
        return updated

    def set_notes(self, *, url: str, notes: str | None) -> bool:
        _, _, _, _, sha = normalize_url(url)
        updated = self.repo.set_notes_by_sha(url_sha256=sha, notes=notes)
        if updated:
            self.session.commit()
        return updated

    def set_risk_level(self, *, url: str, risk_level: int) -> bool:
        _, _, _, _, sha = normalize_url(url)
        updated = self.repo.set_risk_level_by_sha(url_sha256=sha, risk_level=risk_level)
        if updated:
            self.session.commit()
        return updated

    def batch_import(self, items: list[tuple[str, int | None, int | None, str | None]]) -> int:
        """Batch import URLs.

        items: list of tuples (url, risk_level, phishing_flag, notes)
        returns processed count
        """
        count = 0
        for url, risk_level, phishing_flag, notes in items:
            try:
                normalized, scheme, host, registrable, sha = normalize_url(url)
                self.repo.upsert_report(full_url=normalized, url_sha256=sha, scheme=scheme, host=host, registrable_domain=registrable, source=None, notes=notes, risk_level=risk_level, phishing_flag=phishing_flag)
                count += 1
            except Exception:
                continue
        self.session.commit()
        return count