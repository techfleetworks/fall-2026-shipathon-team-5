from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile

from app.config import Settings, get_settings
from app.rate_limit import check_limit, limiter
from app.schemas import (
    ErrorResponse,
    ImageCheckResult,
    QuizItem,
    QuizResponse,
    TextCheckRequest,
    TextCheckResult,
)
from app.services import image_check, scam_rules

router = APIRouter(prefix="/api", tags=["checks"])

_CHUNK = 64 * 1024


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post(
    "/check-image",
    response_model=ImageCheckResult,
    responses={
        413: {"model": ErrorResponse},
        415: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
    },
)
@limiter.limit(check_limit)
async def check_image(
    request: Request, file: UploadFile, settings: Settings = Depends(get_settings)
) -> ImageCheckResult:
    # Read in chunks and stop as soon as the limit is passed. Note: the web
    # framework buffers uploads over 1 MB in a temporary file that is deleted
    # when the request ends; we never save the picture ourselves. In production,
    # also cap the request body size at the web server / proxy.
    data = bytearray()
    while chunk := await file.read(_CHUNK):
        data.extend(chunk)
        if len(data) > settings.max_image_bytes:
            raise HTTPException(
                413,
                "This picture is too large. Please use one under "
                f"{settings.max_image_bytes // (1024 * 1024)} MB.",
            )

    # Trust the file's actual bytes, not the name or declared type.
    if image_check.detect_image_type(bytes(data)) is None:
        raise HTTPException(
            415,
            "Please upload a picture in JPG, PNG or WEBP format.",
        )
    return image_check.check_image(bytes(data))


@router.post(
    "/check-text",
    response_model=TextCheckResult,
    responses={422: {"model": ErrorResponse}, 429: {"model": ErrorResponse}},
)
@limiter.limit(check_limit)
def check_text(
    request: Request, body: TextCheckRequest, settings: Settings = Depends(get_settings)
) -> TextCheckResult:
    text = body.text.strip()
    if len(text) < settings.min_text_chars:
        raise HTTPException(
            422,
            "Please paste the whole message so we can check it properly.",
        )
    if len(text) > settings.max_text_chars:
        raise HTTPException(
            422,
            f"This message is too long. Please paste up to {settings.max_text_chars} characters.",
        )
    return scam_rules.check_text(text)


_EXAMPLE_QUIZ = [
    QuizItem(
        id="example-1",
        image_url="/static/quiz/example-1.jpg",
        alt_text="A smiling older woman holding a birthday cake in a kitchen.",
        is_ai=True,
        explanation="Look at her fingers: there are six on one hand, and the candles melt into the cake.",
    ),
    QuizItem(
        id="example-2",
        image_url="/static/quiz/example-2.jpg",
        alt_text="A street market with fruit stalls on a rainy day.",
        is_ai=False,
        explanation="The signs have readable, correctly spelled words and the reflections match the scene.",
    ),
]


@router.get("/quiz", response_model=QuizResponse)
def quiz() -> QuizResponse:
    return QuizResponse(items=_EXAMPLE_QUIZ, is_example=True)
