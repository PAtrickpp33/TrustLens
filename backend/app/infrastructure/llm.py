from google import genai
from app.core.config import llm_settings
from app.infrastructure.ml_model import URLScorer

class LLMSession:
    SCORER = URLScorer()
    THINKING_BUDGET = llm_settings.thinking_budget
    MAX_TOKENS = llm_settings.max_tokens
    TEMP = llm_settings.temp
    TH_HIGH = llm_settings.th_high
    TH_MED = llm_settings.th_med
    TH_LOW = llm_settings.th_low
    META_PATH = llm_settings.meta_path
    WEIGHT_PATH = llm_settings.weight_path
    
    def __init__(self):
        self.client = genai.Client(api_key=llm_settings.gemini_api_key)
        self.model = llm_settings.gemini_model
        self.scorer = URLScorer()
        
        
def get_llm_session():
    session: LLMSession = LLMSession()
    return session

llm_session = get_llm_session()