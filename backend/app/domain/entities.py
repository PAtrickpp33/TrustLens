from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass
class MobileRisk:
    id: int | None
    country_code: str
    national_number: str
    e164: str
    risk_level: int
    source: str | None
    report_count: int
    last_reported_at: datetime | None
    notes: str | None


@dataclass
class EmailRisk:
    id: int | None
    local_part: str
    domain: str
    address: str
    risk_level: int
    mx_valid: int
    disposable: int
    source: str | None
    report_count: int
    last_reported_at: datetime | None
    notes: str | None


@dataclass
class UrlRisk:
    id: int | None
    scheme: str
    host: str
    registrable_domain: str | None
    full_url: str
    url_sha256: str
    risk_level: int
    phishing_flag: int
    source: str | None
    report_count: int
    last_reported_at: datetime | None
    notes: str | None
