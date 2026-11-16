import io
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.rate_limit import limiter

FIXTURES = Path(__file__).parent / "fixtures" / "images"


def _picture(fmt: str) -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (16, 12), (40, 120, 200)).save(buffer, fmt)
    return buffer.getvalue()


# Small, real pictures with no content credentials.
PNG_BYTES = _picture("PNG")
JPEG_BYTES = _picture("JPEG")
WEBP_BYTES = _picture("WEBP")


def fixture_bytes(name: str) -> bytes:
    return (FIXTURES / name).read_bytes()


@pytest.fixture
def client() -> TestClient:
    limiter.reset()  # each test starts with a fresh allowance
    return TestClient(app)
