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


class UrlSetDeletedRequest(BaseModel):
    url: str = Field(..., description="Full URL with scheme")
    is_deleted: int = Field(..., ge=0, le=1, description="0 or 1")


class UrlSetNotesRequest(BaseModel):
    url: str = Field(..., description="Full URL with scheme")
    notes: str | None = Field(default=None, max_length=512)


class UrlSetRiskLevelRequest(BaseModel):
    url: str = Field(..., description="Full URL with scheme")
    risk_level: int = Field(..., ge=0, le=3)


class UrlImportItem(BaseModel):
    url: str
    risk_level: int | None = Field(default=None, ge=0, le=3)
    phishing_flag: int | None = Field(default=None, ge=0, le=1)
    notes: str | None = Field(default=None, max_length=512)


class UrlBatchImportRequest(BaseModel):
    items: list[UrlImportItem]