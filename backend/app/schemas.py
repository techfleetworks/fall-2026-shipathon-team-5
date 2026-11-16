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
    found: bool = Field(description="True when the picture carries Content Credentials (C2PA).")
    status: Literal["none", "trusted", "trusted_legacy", "untrusted_signer", "invalid", "unreadable"] = Field(
        description="none: no credentials. trusted: signer is on the C2PA trust list. "
        "trusted_legacy: signer is on the older, frozen interim list. "
        "untrusted_signer: signature is intact but we don't recognise who signed it. "
        "invalid: the picture or its record was changed after signing. "
        "unreadable: the credentials couldn't be read."
    )
    source: Literal["ai_generated", "ai_modified", "camera", "computer_made", "unknown"] = Field(
        description="How the credentials say the picture was made."
    )
    signed_by: str | None = Field(None, description="Name on the signing certificate.")
    issuer: str | None = Field(None, description="Who issued the signing certificate.")
    generator: str | None = Field(None, description="App or device that made or edited the picture, if declared.")
    signed_at: str | None = Field(None, description="When it was signed, if a trusted time was recorded.")


class ImageCheckResult(BaseModel):
    ai_likelihood: float | None = Field(
        None, ge=0, le=1,
        description="0 = likely real, 1 = likely AI-made. Null when there's no evidence either way.",
    )
    verdict: Literal["likely_ai", "uncertain", "likely_real"]
    content_credentials: ContentCredentials
    signals: list[Signal]
    message: str = Field(description="One plain-language sentence for the visitor.")
    is_example: bool = Field(False, description="True only for placeholder data.")


class TextCheckRequest(BaseModel):
    text: str


RedFlagType = Literal[
    "urgency", "payment", "link", "secrecy", "credentials", "prize",
    "new_contact", "unrealistic_offer", "remote_access",
]


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
