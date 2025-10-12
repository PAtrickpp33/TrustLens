"""
API routes for SMS/Email content analysis using OpenAI GPT
"""
from __future__ import annotations

import base64
import io
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from app.infrastructure.gpt import get_gpt_session
from app.schemas import ApiResponse
from app.schemas.content import ContentAnalysisRequest, ContentAnalysisResponse

router = APIRouter()

# File size limits
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_PDF_SIZE = 5 * 1024 * 1024     # 5MB

# Allowed file types
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png"}
ALLOWED_PDF_TYPES = {"application/pdf"}


def extract_text_from_image(image_data: bytes, mime_type: str) -> Optional[str]:
    """
    Extract text from image using OCR (placeholder for now)
    In production, you would use libraries like pytesseract or cloud OCR services
    """
    # For now, return None to indicate we'll use vision API directly
    return None


def extract_text_from_pdf(pdf_data: bytes) -> str:
    """
    Extract text from PDF
    """
    try:
        import PyPDF2
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_data))
        text_parts = []
        for page in pdf_reader.pages:
            text_parts.append(page.extract_text())
        return "\n\n".join(text_parts)
    except ImportError:
        raise HTTPException(
            status_code=500, 
            detail="PDF processing not available. Please install PyPDF2."
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to extract text from PDF: {str(e)}"
        )


@router.post("/content/analyze/text", summary="Analyze text content for scams")
async def analyze_text_content(payload: ContentAnalysisRequest):
    """
    Analyze SMS or email text content for scam indicators
    Returns a markdown formatted report
    """
    try:
        gpt_session = get_gpt_session()
        if not gpt_session.client:
            raise HTTPException(
                status_code=503,
                detail="OpenAI API is not configured. Please set OPENAI_API_KEY."
            )
        
        # Analyze the content
        markdown_report = gpt_session.analyze_content(payload.content, has_image=False)
        
        response = ContentAnalysisResponse(
            markdown_report=markdown_report,
            has_image=False
        )
        
        return ApiResponse(success=True, data=response.model_dump())
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/content/analyze/upload", summary="Analyze uploaded image or PDF for scams")
async def analyze_uploaded_content(
    file: UploadFile = File(...),
    additional_context: Optional[str] = Form(None)
):
    """
    Analyze uploaded image (JPEG/PNG) or PDF for scam indicators
    Supports OCR and vision-based analysis
    Returns a markdown formatted report
    """
    try:
        gpt_session = get_gpt_session()
        if not gpt_session.client:
            raise HTTPException(
                status_code=503,
                detail="OpenAI API is not configured. Please set OPENAI_API_KEY."
            )
        
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        mime_type = file.content_type or ""
        
        # Validate file type and size
        if mime_type in ALLOWED_IMAGE_TYPES:
            if file_size > MAX_IMAGE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"Image file too large. Maximum size is {MAX_IMAGE_SIZE // (1024*1024)}MB"
                )
            
            # Use vision API directly for images
            image_base64 = base64.b64encode(file_content).decode('utf-8')
            markdown_report = gpt_session.analyze_content_with_image(
                content=additional_context or "",
                image_base64=image_base64,
                mime_type=mime_type
            )
            has_image = True
            
        elif mime_type in ALLOWED_PDF_TYPES:
            if file_size > MAX_PDF_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"PDF file too large. Maximum size is {MAX_PDF_SIZE // (1024*1024)}MB"
                )
            
            # Extract text from PDF
            extracted_text = extract_text_from_pdf(file_content)
            if not extracted_text.strip():
                raise HTTPException(
                    status_code=400,
                    detail="Could not extract text from PDF. Please ensure the PDF contains readable text."
                )
            
            # Analyze extracted text
            full_content = f"{additional_context}\n\n{extracted_text}" if additional_context else extracted_text
            markdown_report = gpt_session.analyze_content(full_content, has_image=False)
            has_image = False
            
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {mime_type}. Supported types: JPEG, PNG, PDF"
            )
        
        response = ContentAnalysisResponse(
            markdown_report=markdown_report,
            has_image=has_image
        )
        
        return ApiResponse(success=True, data=response.model_dump())
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in analyze_uploaded_content: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

