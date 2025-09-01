from __future__ import annotations

from pydantic import BaseModel, Field


class MobileCheckRequest(BaseModel):
    e164: str | None = Field(default=None, description="Full E.164 phone, e.g., +61412345678")
    country_code: str | None = Field(default=None, description="Country code with +, e.g., +61")
    national_number: str | None = Field(default=None, description="Number without country code")


class MobileRiskResponse(BaseModel):
    e164: str
    risk_level: int
    report_count: int
    source: str | None = None
    notes: str | None = None
