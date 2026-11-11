"""Limits how many checks one visitor can run, so a script can't overload the
service. Visitors are told kindly to wait instead of seeing a technical error.

Limits are counted per IP address, in this process's memory: they reset when
the server restarts and are not shared between several server copies. See
docs/adr/0002-in-memory-rate-limiting.md.
"""

from fastapi import Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.config import get_settings

limiter = Limiter(key_func=get_remote_address)


def check_limit() -> str:
    return get_settings().rate_limit


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    return JSONResponse(
        status_code=429,
        content={
            "detail": "You've run a lot of checks in a short time. "
            "Please wait a minute and try again."
        },
    )
