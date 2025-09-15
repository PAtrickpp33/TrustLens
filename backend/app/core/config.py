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
    gemini_model: str = "gemini-1.5-flash"
    max_tokens: int = 256
    temp: float = 0.2
    th_high: float = 0.8
    th_med: float = 0.5
    
    model_config = SettingsConfigDict(env_prefix="", env_file=".env", extra="ignore")
    
    @model_validator(mode="after")
    def _require_api_key(self):
        if not self.gemini_api_key or not self.gemini_api_key.strip():
            raise ValueError("GEMINI_API_KEY must be set in environment or .env")
        return self
    
    @property
    def meta_path(self) -> str:
        for parent in Path(__file__).parents:
            if parent.name.lower() == "trustlens":
                return "meta.json" # Default insists that meta.json is in app/core
            res = list(parent.rglob("**/meta.json"))
            if res:
                return res[0]
    
    @property
    def weight_path(self) -> str:
        for parent in Path(__file__).parents:
            if parent.name.lower() == "trustlens":
                return "urlnet_model.bin" # Default insists that *.bin is in app/core
            res = list(parent.rglob("**/urlnet_model.bin"))
            if res:
                return res[0]
        
llm_settings = LLMSettings()

if __name__ == "__main__":
    print(llm_settings.gemini_api_key)
    print(llm_settings.meta_path)
    print(llm_settings.weight_path)