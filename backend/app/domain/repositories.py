from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime
from typing import Protocol, Optional

from app.domain.entities import MobileRisk, EmailRisk, UrlRisk
from app.domain.entities import ArticleEntity


class MobileRiskRepository(Protocol):
    def get_by_e164(self, e164: str) -> Optional[MobileRisk]:
        ...

    def upsert_report(self, *, e164: str, country_code: str, national_number: str, source: Optional[str], notes: Optional[str], risk_level: Optional[int]) -> MobileRisk:
        ...


class EmailRiskRepository(Protocol):
    def get_by_address(self, address: str) -> Optional[EmailRisk]:
        ...

    def upsert_report(self, *, address: str, local_part: str, domain: str, source: Optional[str], notes: Optional[str], risk_level: Optional[int], mx_valid: Optional[int], disposable: Optional[int]) -> EmailRisk:
        ...


class UrlRiskRepository(Protocol):
    def get_by_sha256(self, url_sha256: str) -> Optional[UrlRisk]:
        ...

    def upsert_report(self, *, full_url: str, url_sha256: str, scheme: str, host: str, registrable_domain: Optional[str], source: Optional[str], notes: Optional[str], risk_level: Optional[int], phishing_flag: Optional[int]) -> UrlRisk:
        ...


class ArticleRepository(Protocol):
    def list_published(self) -> list[ArticleEntity]:
        ...

    def get_by_slug(self, slug: str) -> Optional[ArticleEntity]:
        ...

    def create_or_update(self, *, slug: str, title: str, summary: Optional[str], content_md: str, is_published: int) -> ArticleEntity:
        ...
