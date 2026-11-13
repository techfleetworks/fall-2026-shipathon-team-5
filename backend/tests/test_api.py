import pytest

from app.config import get_settings
from app.services.image_check import detect_image_type
from app.services.scam_rules import check_text
from tests.conftest import JPEG_BYTES, PNG_BYTES, WEBP_BYTES


def test_health(client):
    assert client.get("/api/health").json() == {"status": "ok"}


@pytest.mark.parametrize(
    "data,expected",
    [(PNG_BYTES, "image/png"), (JPEG_BYTES, "image/jpeg"), (WEBP_BYTES, "image/webp"),
     (b"%PDF-1.7 not an image", None), (b"", None)],
)
def test_detect_image_type(data, expected):
    assert detect_image_type(data) == expected


def test_image_type_is_judged_by_content_not_name(client):
    # A PDF renamed to .png must be rejected.
    r = client.post("/api/check-image", files={"file": ("photo.png", b"%PDF-1.7", "image/png")})
    assert r.status_code == 415


def test_image_exactly_at_limit_is_accepted(client):
    limit = get_settings().max_image_bytes
    data = PNG_BYTES + b"\x00" * (limit - len(PNG_BYTES))
    r = client.post("/api/check-image", files={"file": ("big.png", data, "image/png")})
    assert r.status_code == 200


def test_image_one_byte_over_limit_is_rejected(client):
    limit = get_settings().max_image_bytes
    data = PNG_BYTES + b"\x00" * (limit - len(PNG_BYTES) + 1)
    r = client.post("/api/check-image", files={"file": ("big.png", data, "image/png")})
    assert r.status_code == 413


def test_flag_positions_point_at_the_flagged_words():
    text = "Your account is blocked. Send a gift card now."
    for flag in check_text(text).red_flags:
        assert text[flag.start:flag.end].strip() != ""
    words = {text[f.start:f.end].lower() for f in check_text(text).red_flags}
    assert {"blocked", "gift card"} <= words


def test_uk_delivery_scam_is_flagged():
    result = check_text("Royal Mail: your parcel is on hold. Pay a small fee within 24 hours: www.rm-redeliver.co")
    assert result.risk == "high"


def test_us_bank_scam_is_flagged():
    result = check_text("Your account is locked. Move your money to a safe account with Zelle and don't tell the bank.")
    assert {f.type for f in result.red_flags} >= {"urgency", "payment", "secrecy"}


def test_word_pin_in_normal_text_is_not_flagged():
    result = check_text("Grandma, don't forget to pin the photo to the fridge this weekend.")
    assert result.red_flags == []


def test_cors_allows_configured_frontend(client):
    r = client.options(
        "/api/check-text",
        headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "POST"},
    )
    assert r.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_cors_blocks_unknown_site(client):
    r = client.options(
        "/api/check-text",
        headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "POST"},
    )
    assert "access-control-allow-origin" not in r.headers


def test_limit_applies_to_image_checks_too(client):
    allowed = int(get_settings().rate_limit.split("/")[0])
    upload = {"file": ("photo.png", PNG_BYTES, "image/png")}
    codes = [client.post("/api/check-image", files=upload).status_code for _ in range(allowed + 1)]
    assert codes[:allowed] == [200] * allowed
    assert codes[-1] == 429


def test_health_is_not_rate_limited(client):
    allowed = int(get_settings().rate_limit.split("/")[0])
    assert all(client.get("/api/health").status_code == 200 for _ in range(allowed + 5))
