"""Camera details (EXIF) as a reassuring clue that never says "likely real"."""

import io

import pytest
from PIL import Image

from app.services.camera_details import read_camera_details
from app.services.image_check import check_image
from tests.conftest import JPEG_BYTES, StubClassifier, fixture_bytes

MAKE, MODEL, SOFTWARE, EXIF_IFD = 0x010F, 0x0110, 0x0131, 0x8769
DATE_TAKEN, EXPOSURE, F_NUMBER, ISO = 0x9003, 0x829A, 0x829D, 0x8827


def photo(make="Apple", model="iPhone 15", software=None, capture=True, base: bytes | None = None) -> bytes:
    """A small JPEG with the kind of EXIF a phone writes."""
    image = Image.open(io.BytesIO(base)) if base else Image.new("RGB", (64, 48), (180, 120, 90))
    exif = Image.Exif()
    if make is not None:
        exif[MAKE] = make
    if model is not None:
        exif[MODEL] = model
    if software:
        exif[SOFTWARE] = software
    if capture:
        exif.get_ifd(EXIF_IFD).update({DATE_TAKEN: "2026:03:03 10:15:00", EXPOSURE: 1 / 120, F_NUMBER: 1.8, ISO: 80})
    out = io.BytesIO()
    image.convert("RGB").save(out, "JPEG", exif=exif)
    return out.getvalue()


def labels(result):
    return [s.label for s in result.signals]


def test_reads_device_and_date():
    camera = read_camera_details(photo())
    assert camera.device == "Apple iPhone 15"
    assert camera.taken_text == "3 March 2026"


def test_model_that_already_names_the_maker_isnt_repeated():
    assert read_camera_details(photo(make="SAMSUNG", model="SAMSUNG Galaxy S24")).device == "SAMSUNG Galaxy S24"


@pytest.mark.parametrize(
    "kwargs",
    [
        dict(make=None, model=None),            # no device
        dict(capture=False),                    # a device name but no photo settings
        dict(software="Midjourney v7"),         # an AI tool names itself
        dict(software="DALL-E 3"),
    ],
)
def test_no_clue_without_real_camera_details(kwargs):
    assert read_camera_details(photo(**kwargs)) is None


def test_plain_picture_has_no_camera_details():
    assert read_camera_details(JPEG_BYTES) is None


def test_hostile_text_is_cleaned_and_shortened():
    camera = read_camera_details(photo(make="<script>alert(1)</script>", model="X" * 200 + "\x00\n"))
    assert "<" not in camera.device and ">" not in camera.device
    assert len(camera.device) <= 40


@pytest.mark.parametrize("score", [0.1, None])
def test_camera_photo_gets_a_reassuring_clue_but_stays_uncertain(score):
    classifier = StubClassifier(score) if score is not None else None
    result = check_image(photo(), classifier=classifier)
    assert result.verdict == "uncertain"
    assert result.ai_likelihood is None
    assert "Has details from a camera" in labels(result)
    assert "Apple iPhone 15" in result.message
    assert "copied" in result.message
    assert labels(result)[-1] == "Try other checks too"


def test_unsure_detector_and_camera_details_says_to_check_another_way():
    result = check_image(photo(), classifier=StubClassifier(0.7))
    assert result.verdict == "uncertain"
    assert "could come from AI" in result.message
    assert "Has details from a camera" in labels(result)


def test_confident_detector_wins_over_copied_camera_details():
    # An AI picture with camera details copied onto it must still be flagged.
    result = check_image(photo(), classifier=StubClassifier(0.995))
    assert result.verdict == "likely_ai"
    assert "Has details from a camera" not in labels(result)


def test_ai_label_wins_over_camera_details():
    tagged = photo(base=fixture_bytes("xmp_ai_tag.jpg"))
    # Pillow keeps the XMP packet only if present in info; check the label survived.
    if b"trainedAlgorithmicMedia" not in tagged:
        tagged = fixture_bytes("xmp_ai_tag.jpg")
    result = check_image(tagged)
    assert result.verdict == "likely_ai"
    assert "Has details from a camera" not in labels(result)


def test_content_credentials_are_never_replaced_by_camera_details():
    result = check_image(fixture_bytes("tampered.jpg"))
    assert result.content_credentials.status == "invalid"
    assert "Has details from a camera" not in labels(result)


def test_no_signs_of_ai_at_all_is_a_stronger_clue_but_still_uncertain():
    result = check_image(JPEG_BYTES, classifier=StubClassifier(0.0001))
    assert result.verdict == "uncertain"
    assert result.ai_likelihood is None
    assert "No signs of AI found at all" in labels(result)
    assert "can't be sure" in result.message


def test_a_low_but_not_tiny_score_keeps_the_plain_clue():
    result = check_image(JPEG_BYTES, classifier=StubClassifier(0.1))
    assert "No signs of AI found at all" not in labels(result)
    assert "No clear signs of AI found" in labels(result)


def test_no_signs_and_camera_details_together():
    result = check_image(photo(), classifier=StubClassifier(0.0001))
    assert result.verdict == "uncertain"
    assert "no signs of AI at all" in result.message
    assert "Apple iPhone 15" in result.message
    assert {"No signs of AI found at all", "Has details from a camera"} <= set(labels(result))


def test_no_signs_threshold_comes_from_settings(monkeypatch):
    from app.config import get_settings

    monkeypatch.setenv("APP_CLASSIFIER_NO_SIGNS_THRESHOLD", "0.2")
    get_settings.cache_clear()
    try:
        result = check_image(JPEG_BYTES, classifier=StubClassifier(0.1))
        assert "No signs of AI found at all" in labels(result)
    finally:
        get_settings.cache_clear()
