from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.rate_limit import limiter, rate_limit_exceeded_handler
from app.routers import checks


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="AI Image & Scam Checker API",
        version="0.1.0",
        description="Helps older adults check pictures and messages. "
        "Uploaded pictures and messages are processed in memory and never stored.",
    )
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )
    app.include_router(checks.router)
    return app


app = create_app()
