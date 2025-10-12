"""
OpenAI GPT service for SMS/Email content analysis
Independent from the Gemini LLM service
"""
from typing import Optional
from openai import OpenAI
from app.core.config import gpt_settings

class GPTSession:
    """
    Manages OpenAI GPT API interactions for content analysis
    """
    def __init__(self):
        # Only create client if API key is valid
        if gpt_settings.openai_api_key != "dummy_openai_key":
            self.client = OpenAI(api_key=gpt_settings.openai_api_key)
        else:
            self.client = None
            print("Warning: OpenAI GPT client not initialized due to missing API key")
        
        self.model = gpt_settings.openai_model
        self.max_tokens = gpt_settings.openai_max_tokens
        self.temperature = gpt_settings.openai_temperature
    
    def analyze_content(self, content: str, has_image: bool = False) -> str:
        """
        Analyze SMS/Email content for scam indicators and return markdown report
        
        Args:
            content: The text content to analyze
            has_image: Whether the content was extracted from an image
            
        Returns:
            Markdown formatted analysis report
        """
        if not self.client:
            return self._fallback_response()
        
        try:
            # System prompt for scam analysis
            system_prompt = """You are a cybersecurity expert specializing in scam detection. 
Your task is to analyze SMS and email content for potential scams, phishing attempts, and fraudulent activity.

Return your analysis as a well-structured markdown report with the following sections:

# Risk Assessment
Provide an overall risk level (Safe, Low Risk, Medium Risk, High Risk, Critical) with a brief summary.

# Key Findings
List the main indicators found in the content (both suspicious and legitimate).

# Detailed Analysis
Analyze specific elements:
- Sender information and legitimacy
- Language patterns and urgency tactics
- Links or contact information (if present)
- Common scam indicators (too good to be true offers, pressure tactics, impersonation, etc.)

# Recommendations
Provide clear, actionable advice for the user.

Be thorough but concise. Use bullet points and formatting for readability."""

            user_prompt = f"""Analyze the following {"image-extracted " if has_image else ""}message content for scam indicators:

---
{content}
---

Provide a comprehensive security analysis in markdown format."""

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature
            )
            
            return response.choices[0].message.content or self._fallback_response()
            
        except Exception as e:
            print(f"Error calling OpenAI API: {e}")
            return self._fallback_response()
    
    def analyze_content_with_image(self, content: str, image_base64: str, mime_type: str) -> str:
        """
        Analyze content with accompanying image using GPT-4 Vision
        
        Args:
            content: Text description or context
            image_base64: Base64 encoded image data
            mime_type: Image MIME type (e.g., 'image/jpeg')
            
        Returns:
            Markdown formatted analysis report
        """
        if not self.client:
            return self._fallback_response()
        
        try:
            system_prompt = """You are a cybersecurity expert specializing in scam detection. 
Analyze the provided image (which may contain a screenshot of an SMS, email, or message) for potential scams.

Return your analysis as a well-structured markdown report with the following sections:

# Risk Assessment
Provide an overall risk level (Safe, Low Risk, Medium Risk, High Risk, Critical) with a brief summary.

# Key Findings
List the main indicators found in the image (both suspicious and legitimate).

# Detailed Analysis
Analyze specific elements visible in the image:
- Sender information and legitimacy
- Language patterns and urgency tactics
- Links or contact information (if present)
- Visual design elements (logos, branding, layout)
- Common scam indicators

# Recommendations
Provide clear, actionable advice for the user.

Be thorough but concise. Use bullet points and formatting for readability."""

            user_prompt = f"""Analyze this message screenshot for scam indicators.
{f'Additional context: {content}' if content else 'Please extract and analyze all visible text and elements.'}

Provide a comprehensive security analysis in markdown format."""

            response = self.client.chat.completions.create(
                model=self.model if "vision" in self.model or "gpt-4" in self.model else "gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": user_prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{mime_type};base64,{image_base64}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature
            )
            
            return response.choices[0].message.content or self._fallback_response()
            
        except Exception as e:
            print(f"Error calling OpenAI Vision API: {e}")
            return self._fallback_response()
    
    def _fallback_response(self) -> str:
        """Return a fallback markdown response when API is unavailable"""
        return """# Service Unavailable

The AI analysis service is currently unavailable. Please check your API configuration.

## What You Can Do
- Verify your OpenAI API key is configured correctly
- Check for suspicious elements manually:
  - Unknown or suspicious sender
  - Urgent language or pressure tactics
  - Requests for personal information
  - Too-good-to-be-true offers
  - Spelling or grammar errors
  - Suspicious links or attachments

## Need Help?
Contact support or try again later."""


# Global session instance (lazy loaded)
_gpt_session: Optional[GPTSession] = None

def get_gpt_session() -> GPTSession:
    """Get or create the global GPT session instance"""
    global _gpt_session
    if _gpt_session is None:
        try:
            _gpt_session = GPTSession()
        except Exception as e:
            print(f"Warning: Could not create GPT session: {e}")
            _gpt_session = GPTSession()  # Create anyway with dummy client
    return _gpt_session

