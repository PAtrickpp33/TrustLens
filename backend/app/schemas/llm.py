from pydantic import BaseModel
from typing import List

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
    evidence: str # List[str]
    recommended_next_steps: List[str]
    user_safe_message: str
    notes_for_analyst: str

class RecommendResponse(BaseModel):
    url: str
    ascii_safe_url: str
    score: float
    risk_band: str
    llm: Recommendation