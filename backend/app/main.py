from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.rate_limit import limiter, rate_limit_exceeded_handler
from app.routers import checks
from app.services.classifier import get_classifier


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the AI-image classifier (if one is configured) before taking
    # requests, so a missing or broken model stops the deploy instead of
    # failing visitors' checks, and the first check isn't slow.
    get_classifier()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Veritas API",
        version="0.1.0",
        description="Helps people check pictures and messages before they believe or share them. "
        "Uploaded pictures and messages are processed in memory and never stored.",
        lifespan=lifespan,
    )
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_origin_regex=settings.allowed_origin_regex,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )
    app.include_router(checks.router)
    return app


app = create_app()
