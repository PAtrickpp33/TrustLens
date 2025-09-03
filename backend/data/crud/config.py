from pydantic_settings import BaseSettings, SettingsConfigDict

# Settings for API_url for posting and getting data
class Settings(BaseSettings):
    api_url: str | None = None
    model_config = SettingsConfigDict(env_prefix="", env_file=".env", extra="ignore")
    
settings = Settings()