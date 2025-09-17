from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
from pathlib import Path

class Settings(BaseSettings):
    app_name: str = "TrustLens API"
    app_env: str = "local"
    app_version: str = "0.1.0"
    app_debug: bool = True

    database_url: str = (
        "mysql+pymysql://user:password@localhost:3306/trustlens?charset=utf8mb4"
    )

    # Use a simple string to avoid pydantic-settings trying to JSON-decode complex types from .env
    allow_origins: str = "*"

    model_config = SettingsConfigDict(env_prefix="", env_file=".env", extra="ignore")

    @property
    def allow_origins_list(self) -> List[str]:
        raw = (self.allow_origins or "").strip()
        if raw == "*" or raw == "":
            return ["*"]
        return [o.strip() for o in raw.split(",") if o.strip()]


settings = Settings()

# ======== Config for LLM ========
class LLMSettings(BaseSettings):
    # Required (no default) -> will raise ValidationError if missing
    gemini_api_key: str
    
    # Optionals with defaults
    gemini_model: str = "gemini-2.5-flash"
    max_tokens: int = 1024
    temp: float = 0.2
    th_high: float = 0.8
    th_med: float = 0.5
    th_low: float = 0.1
    thinking_budget: int = 0 # Allows the model to think & generate better responses; 0 if off
    
    model_config = SettingsConfigDict(env_prefix="", env_file=".env", extra="ignore")
    
    @model_validator(mode="after")
    def _require_api_key(self):
        if not self.gemini_api_key or not self.gemini_api_key.strip():
            print("Warning: GEMINI_API_KEY is not set. LLM features will be disabled.")
            # Don't raise an error, just set a dummy key to prevent startup failure
            self.gemini_api_key = "dummy_key_for_startup"
        return self
    
    @model_validator(mode="after")
    def _validate_thinking_budget(self):
        # Skip validation if using dummy key
        if self.gemini_api_key == "dummy_key_for_startup":
            return self
            
        if self.gemini_model.lower() == "gemini-2.5-pro" and self.thinking_budget == 0:
            print(f"Warning: Cannot disable thinking for {self.gemini_model}. Setting thinking_budget to 1.")
            self.thinking_budget = 1
        if not self.gemini_model.lower() in ["gemini-2.5-pro", "gemini-2.5-flash"]:
            print(f"Warning: Cannot set thinking budget for non-thinking versions of Gemini. Using default model.")
            self.gemini_model = "gemini-2.5-flash"
        return self
    
    @property
    def meta_path(self) -> str:
        # In Docker container, files are in /app/AI_model/
        meta_file = Path("/app/AI_model/meta.json")
        if meta_file.exists():
            return str(meta_file)
        
        # Fallback for local development
        for parent in Path(__file__).parents:
            res = list(parent.rglob("**/meta.json"))
            if res:
                return str(res[0])
        
        # Default fallback
        return "AI_model/meta.json"
    
    @property
    def weight_path(self) -> str:
        # In Docker container, files are in /app/AI_model/
        weight_file = Path("/app/AI_model/urlnet_model.bin")
        if weight_file.exists():
            return str(weight_file)
        
        # Fallback for local development
        for parent in Path(__file__).parents:
            res = list(parent.rglob("**/urlnet_model.bin"))
            if res:
                return str(res[0])
        
        # Default fallback
        return "AI_model/urlnet_model.bin"
        
llm_settings = LLMSettings()