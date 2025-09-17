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


class EmailSetDeletedRequest(BaseModel):
    address: str = Field(..., description="Email address")
    is_deleted: int = Field(..., ge=0, le=1, description="0 or 1")


class EmailSetNotesRequest(BaseModel):
    address: str = Field(..., description="Email address")
    notes: str | None = Field(default=None, max_length=512)

# Richard: Changed risk level range to 0,1,2,3,4 
class EmailSetRiskLevelRequest(BaseModel):
    address: str = Field(..., description="Email address")
    risk_level: int = Field(..., ge=0, le=4)

# Richard: Changed risk level range to 0,1,2,3,4 
class EmailImportItem(BaseModel):
    address: str
    risk_level: int | None = Field(default=None, ge=0, le=4)
    notes: str | None = Field(default=None, max_length=512)
    mx_valid: int | None = Field(default=None, ge=0, le=1)
    disposable: int | None = Field(default=None, ge=0, le=1)


class EmailBatchImportRequest(BaseModel):
    items: list[EmailImportItem]