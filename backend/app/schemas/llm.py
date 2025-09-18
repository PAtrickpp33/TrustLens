from pydantic import BaseModel
from typing import List, Literal

# ======== Schemas ========
class ScoreRequest(BaseModel):
    url: str

class ScoreResponse(BaseModel):
    url: str
    ascii_safe_url: str
    score: float
    risk_band: str

class RecommendRequest(BaseModel):
    url: str

class Recommendation(BaseModel):
    risk_band: str
    action: str
    confidence_note: str
    evidence: str
    recommended_next_steps: List[str]
    user_safe_message: str
    notes_for_analyst: str

class RecommendResponse(BaseModel):
    url: str
    ascii_safe_url: str
    score: float
    risk_band: str
    llm: Recommendation
    
class GenerateResponseInput(BaseModel):
    type: Literal["url", "email address", "mobile number", "email", "sms"]