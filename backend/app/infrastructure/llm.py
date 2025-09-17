from google import genai
from app.core.config import llm_settings

class LLMSession:
    # Remove class-level URLScorer instantiation to avoid startup crashes
    THINKING_BUDGET = llm_settings.thinking_budget
    MAX_TOKENS = llm_settings.max_tokens
    TEMP = llm_settings.temp
    TH_HIGH = llm_settings.th_high
    TH_MED = llm_settings.th_med
    TH_LOW = llm_settings.th_low
    
    def __init__(self):
        # Only create client if API key is valid
        if llm_settings.gemini_api_key != "dummy_key_for_startup":
            self.client = genai.Client(api_key=llm_settings.gemini_api_key)
        else:
            self.client = None
            print("Warning: LLM client not initialized due to missing API key")
            
        self.model = llm_settings.gemini_model
        self._scorer = None  # Lazy load the scorer
    
    @property
    def scorer(self):
        """Lazy load URLScorer to avoid startup crashes"""
        if self._scorer is None:
            try:
                from app.infrastructure.ml_model import URLScorer
                self._scorer = URLScorer()
            except Exception as e:
                print(f"Warning: Could not initialize URLScorer: {e}")
                self._scorer = None
        return self._scorer
        
        
# Global session instance (lazy loaded)
_llm_session = None

def get_llm_session():
    """Get or create the global LLM session instance"""
    global _llm_session
    if _llm_session is None:
        try:
            _llm_session = LLMSession()
        except Exception as e:
            print(f"Warning: Could not create LLM session: {e}")
            _llm_session = None
    return _llm_session

# For backward compatibility - create a module-level function that acts like the old global variable
def llm_session():
    return get_llm_session()