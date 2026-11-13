import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.rate_limit import limiter

PNG_BYTES = b"\x89PNG\r\n\x1a\n" + b"\x00" * 64
JPEG_BYTES = b"\xff\xd8\xff\xe0" + b"\x00" * 64
WEBP_BYTES = b"RIFF\x00\x00\x00\x00WEBP" + b"\x00" * 64


@pytest.fixture
def client() -> TestClient:
    limiter.reset()  # each test starts with a fresh allowance
    return TestClient(app)
