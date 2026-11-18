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


@pytest.fixture(autouse=True)
def _clear_dependency_overrides():
    yield
    app.dependency_overrides.clear()


class StubClassifier:
    """Stands in for the AI-image classifier and returns a fixed score."""

    def __init__(self, score: float | Exception) -> None:
        self.score = score
        self.calls = 0

    def score_bytes(self, data: bytes) -> float:
        self.calls += 1
        if isinstance(self.score, Exception):
            raise self.score
        return self.score
