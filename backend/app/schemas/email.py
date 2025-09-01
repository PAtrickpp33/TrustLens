from __future__ import annotations

from pydantic import BaseModel, Field


class EmailCheckRequest(BaseModel):
    address: str = Field(..., description="Email address")


class EmailRiskResponse(BaseModel):
    address: str
    risk_level: int
    mx_valid: int
    disposable: int
    report_count: int
    source: str | None = None
    notes: str | None = None
