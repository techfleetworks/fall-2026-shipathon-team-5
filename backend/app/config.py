"""Settings read from environment variables (prefix APP_) or a local .env file."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="APP_", extra="ignore")

    allowed_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    # Optional pattern for extra front-end addresses, e.g. Vercel preview links.
    allowed_origin_regex: str | None = None
    max_image_bytes: int = 10 * 1024 * 1024
    min_text_chars: int = 20
    max_text_chars: int = 10_000
    rate_limit: str = "10/minute"
    # Header the hosting provider sets to the visitor's real address and that
    # visitors can't fake (on Render: True-Client-IP, set by Cloudflare).
    # Leave unset when running without such a provider.
    client_ip_header: str | None = None

    # AI-image classifier (see app/services/classifier.py). Leave the folder
    # unset to run without it: picture checks then use only the picture's own
    # data, as before.
    classifier_model_dir: str | None = None
    # ONNX file name inside the folder; by default the quantized one is found.
    classifier_model_file: str | None = None
    # The model's label meaning "made with AI", if it isn't a usual name.
    classifier_ai_label: str | None = None
    classifier_threads: int = 1
    # Scores at or above the high threshold are reported as "likely_ai".
    # Below the low one, the model found no clear signs of AI (still
    # "uncertain": the model can't prove a photo is real). PLACEHOLDERS until
    # the thresholds are measured on the test set (plan step 3).
    classifier_high_threshold: float = 0.9
    classifier_low_threshold: float = 0.5


@lru_cache
def get_settings() -> Settings:
    return Settings()
