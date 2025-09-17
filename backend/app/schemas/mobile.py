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


class MobileSetDeletedRequest(BaseModel):
    e164: str = Field(..., description="Full E.164 phone")
    is_deleted: int = Field(..., ge=0, le=1, description="0 or 1")


class MobileSetNotesRequest(BaseModel):
    e164: str = Field(..., description="Full E.164 phone")
    notes: str | None = Field(default=None, max_length=512)

# Richard: Changed risk level range to 0,1,2,3,4 
class MobileSetRiskLevelRequest(BaseModel):
    e164: str = Field(..., description="Full E.164 phone")
    risk_level: int = Field(..., ge=0, le=4)

# Richard: Changed risk level range to 0,1,2,3,4 
class MobileImportItem(BaseModel):
    e164: str
    risk_level: int | None = Field(default=None, ge=0, le=4)
    notes: str | None = Field(default=None, max_length=512)


class MobileBatchImportRequest(BaseModel):
    items: list[MobileImportItem]