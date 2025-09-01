from __future__ import annotations

from pydantic import BaseModel, Field


class UrlCheckRequest(BaseModel):
    url: str = Field(..., description="Full URL with scheme")


class UrlRiskResponse(BaseModel):
    url: str
    risk_level: int
    phishing_flag: int
    report_count: int
    source: str | None = None
    notes: str | None = None
