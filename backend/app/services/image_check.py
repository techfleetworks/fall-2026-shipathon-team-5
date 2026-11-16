"""Checks a picture for evidence of how it was made.

Today the evidence is the picture's own data: Content Credentials (C2PA) and
IPTC "made with AI" labels (see content_credentials.py). There is no AI-image
classifier yet, so when a picture carries no such data the honest answer is
"we can't tell", and the visitor is pointed to other checks.

Pictures are processed in memory only and never saved.
"""

import io

from PIL import Image, UnidentifiedImageError

from app.schemas import ContentCredentials, ImageCheckResult, Signal
from app.services.content_credentials import Credentials, TrustStore, read_credentials

# File signatures ("magic bytes") of the image types we accept.
_SIGNATURES: tuple[tuple[str, bytes], ...] = (
    ("image/jpeg", b"\xff\xd8\xff"),
    ("image/png", b"\x89PNG\r\n\x1a\n"),
)

_OTHER_CHECKS = Signal(
    label="Try other checks too",
    explanation="Search for where the picture first appeared with a reverse image "
    "search, and look for the clues in our images checklist.",
)


def detect_image_type(data: bytes) -> str | None:
    """Return the real image type from the file's first bytes, or None."""
    for mime, signature in _SIGNATURES:
        if data.startswith(signature):
            return mime
    if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    return None


def is_complete_picture(data: bytes) -> bool:
    """Quick structural check that the file is a real picture, not junk with a
    picture's first bytes. Broken files can make the credentials reader very
    slow, so they're turned away first."""
    try:
        with Image.open(io.BytesIO(data)) as image:
            image.verify()
        return True
    except (UnidentifiedImageError, OSError, SyntaxError, ValueError, Image.DecompressionBombError):
        return False


def _signer(c: Credentials) -> str:
    return c.signed_by or c.issuer or "an unknown signer"


def _tool(c: Credentials) -> str:
    return f" ({c.generator})" if c.generator else ""


def _assess(c: Credentials) -> tuple[float | None, str, list[Signal], str]:
    """Return (ai_likelihood, verdict, signals, message) from the evidence."""
    if c.status == "invalid":
        return None, "uncertain", [
            Signal(
                label="Content Credentials don't match the picture",
                explanation="The picture carries a signed record, but the picture or the "
                "record was changed after it was signed, so we can't rely on it.",
            ),
            _OTHER_CHECKS,
        ], "This picture's record of how it was made has been changed, so we can't trust it. Check it another way."

    if c.found:
        verified = c.status in ("trusted", "trusted_legacy")
        who = Signal(
            label="Signed by a recognised organisation" if verified else "Signed, but we don't recognise the signer",
            explanation=(
                f"The record was signed by {_signer(c)}, which is on the official list of "
                "trusted Content Credentials signers."
                if c.status == "trusted"
                else f"The record was signed by {_signer(c)}, which was on the earlier "
                "list of trusted signers."
                if verified
                else f"The record is intact, but it was signed by {_signer(c)}, who isn't on "
                "the official list of trusted signers. Anyone can make a signature, so "
                "treat what it says with care."
            ),
        )
        if c.source == "ai_generated":
            return (0.95 if verified else 0.9), "likely_ai", [
                Signal(
                    label="Made with AI",
                    explanation=f"The picture's Content Credentials say it was created by an AI tool{_tool(c)}.",
                ),
                who,
            ], "This picture's own record says it was made with AI."
        if c.source == "ai_modified":
            return (0.85 if verified else 0.8), "likely_ai", [
                Signal(
                    label="Changed with AI",
                    explanation=f"The picture's Content Credentials say parts of it were made or "
                    f"changed with an AI tool{_tool(c)}.",
                ),
                who,
            ], "This picture's own record says it was changed using AI."
        if c.source == "camera" and verified:
            return 0.1, "likely_real", [
                Signal(
                    label="Taken with a camera",
                    explanation=f"The picture's Content Credentials say it was taken with a "
                    f"camera{_tool(c)}, and the record is signed by a recognised organisation. "
                    "A real photo can still be misleading, so check the story around it.",
                ),
                who,
            ], "This picture's signed record says it was taken with a camera."
        if c.source == "camera":
            return None, "uncertain", [
                Signal(
                    label="Says it was taken with a camera",
                    explanation=f"The picture's Content Credentials say it came from a "
                    f"camera{_tool(c)}, but we can't confirm who signed that record.",
                ),
                who,
                _OTHER_CHECKS,
            ], "This picture claims to be a camera photo, but we can't confirm it. Check it another way."
        return None, "uncertain", [
            Signal(
                label="Content Credentials found",
                explanation=f"The picture has a signed record{_tool(c)}, but it doesn't say "
                "whether AI was used.",
            ),
            who,
            _OTHER_CHECKS,
        ], "This picture has a record of how it was made, but it doesn't say whether AI was used."

    if c.metadata_source in ("ai_generated", "ai_modified"):
        made = "made" if c.metadata_source == "ai_generated" else "changed"
        return 0.85, "likely_ai", [
            Signal(
                label=f"Labelled as {made} with AI",
                explanation=f"The picture's hidden details include a standard label saying it was "
                f"{made} with AI. These labels aren't signed and can be removed, but they're "
                "rarely added to real photos.",
            ),
        ], f"This picture's hidden details say it was {made} with AI."

    return None, "uncertain", [
        Signal(
            label="No record of how it was made",
            explanation="Many apps and websites, including most social media, remove this "
            "information when pictures are shared. So this doesn't tell us whether the "
            "picture is real or made with AI.",
        ),
        _OTHER_CHECKS,
    ], "We couldn't find any record of how this picture was made, which is common. That doesn't mean it's real."


def check_image(data: bytes, trust: TrustStore | None = None) -> ImageCheckResult:
    creds = read_credentials(data, detect_image_type(data), trust)
    likelihood, verdict, signals, message = _assess(creds)
    return ImageCheckResult(
        ai_likelihood=likelihood,
        verdict=verdict,
        content_credentials=ContentCredentials(
            found=creds.found,
            status=creds.status,
            source=creds.source,
            signed_by=creds.signed_by,
            issuer=creds.issuer,
            generator=creds.generator,
            signed_at=creds.signed_at,
        ),
        signals=signals,
        message=message,
    )
