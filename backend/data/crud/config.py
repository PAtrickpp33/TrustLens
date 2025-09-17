from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

ENV_PATH = Path(__file__).resolve().parent / ".env"

# Settings for API_url for posting and getting data
class Settings(BaseSettings):
    api_url: str
    model_config = SettingsConfigDict(env_prefix="", env_file=str(ENV_PATH), extra="ignore")
    
settings = Settings()