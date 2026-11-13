"""Settings read from environment variables (prefix APP_) or a local .env file."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="APP_", extra="ignore")

    allowed_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    max_image_bytes: int = 10 * 1024 * 1024
    min_text_chars: int = 20
    max_text_chars: int = 10_000
    rate_limit: str = "10/minute"


@lru_cache
def get_settings() -> Settings:
    return Settings()
