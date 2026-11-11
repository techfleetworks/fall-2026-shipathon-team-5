import pytest
from fastapi.testclient import TestClient

from app.main import app

PNG_BYTES = b"\x89PNG\r\n\x1a\n" + b"\x00" * 64
JPEG_BYTES = b"\xff\xd8\xff\xe0" + b"\x00" * 64
WEBP_BYTES = b"RIFF\x00\x00\x00\x00WEBP" + b"\x00" * 64


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)
