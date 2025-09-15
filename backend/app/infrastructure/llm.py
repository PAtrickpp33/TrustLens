import google.generativeai as genai
from app.core.config import llm_settings
from app.infrastructure.ml_model import URLScorer

GEMINI_API_KEY = llm_settings.gemini_api_key
GEMINI_MODEL = llm_settings.gemini_model

class LLMSession:
    def __init__(self):
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = GEMINI_MODEL
        self.gemini = genai.GenerativeModel(self.model)
        self.scorer = URLScorer()
        print(f">>> Gemini ready | model={self.model}")
        
def get_llm_session():
    session: LLMSession = LLMSession()
    return session