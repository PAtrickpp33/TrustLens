"""
Schemas for SMS/Email content analysis
"""
from pydantic import BaseModel, Field
from typing import Optional


class ContentAnalysisRequest(BaseModel):
    """Request for analyzing text content (SMS/Email)"""
    content: str = Field(..., min_length=1, max_length=10000, description="Text content to analyze")
    

class ContentAnalysisResponse(BaseModel):
    """Response containing markdown analysis report"""
    markdown_report: str = Field(..., description="Markdown formatted analysis report")
    has_image: bool = Field(default=False, description="Whether content was extracted from image")

