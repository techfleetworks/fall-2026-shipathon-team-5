"""The API contract shared with the front end.

Changing a field here changes what the front end receives, so agree on it with
your partner first. FastAPI publishes these shapes at /docs.
"""

from typing import Literal

from pydantic import BaseModel, Field


class Signal(BaseModel):
    label: str = Field(description="Short name of the clue, e.g. 'No camera data found'.")
    explanation: str = Field(description="Plain-language explanation for the visitor.")


class ContentCredentials(BaseModel):
    found: bool
    issuer: str | None = None
    generator: str | None = Field(None, description="Tool that made the image, if declared.")


class ImageCheckResult(BaseModel):
    ai_likelihood: float = Field(ge=0, le=1, description="0 = likely real, 1 = likely AI-made.")
    verdict: Literal["likely_ai", "uncertain", "likely_real"]
    content_credentials: ContentCredentials
    signals: list[Signal]
    message: str = Field(description="One reassuring, plain-language sentence for the visitor.")
    is_example: bool = Field(description="True while this endpoint returns placeholder data.")


class TextCheckRequest(BaseModel):
    text: str


RedFlagType = Literal["urgency", "payment", "link", "secrecy", "credentials", "prize"]


class RedFlag(BaseModel):
    type: RedFlagType
    start: int = Field(ge=0, description="Start index of the flagged words in the text.")
    end: int = Field(ge=0, description="End index (exclusive) of the flagged words.")
    explanation: str


class TextCheckResult(BaseModel):
    risk: Literal["low", "medium", "high"]
    red_flags: list[RedFlag]
    message: str


class QuizItem(BaseModel):
    id: str
    image_url: str
    alt_text: str
    is_ai: bool
    explanation: str


class QuizResponse(BaseModel):
    items: list[QuizItem]
    is_example: bool


class ErrorResponse(BaseModel):
    detail: str
