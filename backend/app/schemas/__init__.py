from pydantic import BaseModel


class ApiResponse(BaseModel):
    success: bool
    data: dict | None = None
    error: str | None = None


