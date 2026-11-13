"""Image checking.

For now this validates the upload and returns placeholder results
(is_example=True) so the front end can be built against the real contract.
Next steps: read C2PA content credentials, then run an AI-image classifier.
Images are processed in memory only and never saved.
"""

from app.schemas import ContentCredentials, ImageCheckResult, Signal

# File signatures ("magic bytes") of the image types we accept.
_SIGNATURES: tuple[tuple[str, bytes], ...] = (
    ("image/jpeg", b"\xff\xd8\xff"),
    ("image/png", b"\x89PNG\r\n\x1a\n"),
)


def detect_image_type(data: bytes) -> str | None:
    """Return the real image type from the file's first bytes, or None."""
    for mime, signature in _SIGNATURES:
        if data.startswith(signature):
            return mime
    if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    return None


def check_image(data: bytes) -> ImageCheckResult:
    # Placeholder until the provenance reader and classifier are added.
    return ImageCheckResult(
        ai_likelihood=0.72,
        verdict="likely_ai",
        content_credentials=ContentCredentials(found=False),
        signals=[
            Signal(
                label="No content credentials found",
                explanation="The picture carries no record of how it was made. "
                "Many social media sites remove this, so it doesn't prove anything alone.",
            ),
            Signal(
                label="Very smooth skin and background",
                explanation="Computer-made pictures often look unusually smooth or perfect.",
            ),
        ],
        message="This picture is probably computer-made. Look at the hands, any text "
        "in the picture and the background, and search for where it came from.",
        is_example=True,
    )
