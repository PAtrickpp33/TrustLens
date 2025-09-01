from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


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
