"""Tests for the AI-image classifier's plumbing, using a tiny fake model.

The fake model scores pictures by brightness (see tests/fake_model.py), so
these tests check loading, preparing pictures, scoring and how the estimate is
combined with Content Credentials, not how good any real model is. The real
model's quality is measured in evaluation/ (see docs/plans/image-classifier.md).
"""

import io

import numpy as np
import pytest
from PIL import Image

from app.config import get_settings
from app.services import classifier as classifier_module
from app.services.classifier import (
    ClassifierError,
    ImageClassifier,
    Preprocessing,
    band_for,
    find_ai_index,
    get_classifier,
)
from app.services.image_check import check_image
from tests.conftest import StubClassifier, fixture_bytes
from tests.fake_model import write_fake_model

WHITE, BLACK, GREY = (255, 255, 255), (0, 0, 0), (128, 128, 128)


def picture(colour, fmt="PNG", size=(64, 48), mode="RGB") -> bytes:
    buffer = io.BytesIO()
    Image.new(mode, size, colour).save(buffer, fmt)
    return buffer.getvalue()


@pytest.fixture(scope="module")
def model_dir(tmp_path_factory):
    return write_fake_model(tmp_path_factory.mktemp("model"))


@pytest.fixture(scope="module")
def fake(model_dir) -> ImageClassifier:
    return ImageClassifier(model_dir)


# --- Loading ------------------------------------------------------------------

def test_scores_follow_the_fake_models_brightness_rule(fake):
    assert fake.score_bytes(picture(WHITE)) > 0.99
    assert fake.score_bytes(picture(BLACK)) < 0.01
    assert 0.4 < fake.score_bytes(picture(GREY)) < 0.6


def test_finds_the_ai_output_whatever_its_position(tmp_path):
    flipped = ImageClassifier(write_fake_model(tmp_path, id2label={"0": "artificial", "1": "real"}))
    assert flipped.ai_index == 0
    assert flipped.score_bytes(picture(WHITE)) < 0.01


def test_model_file_can_sit_in_the_folder_itself(tmp_path):
    loaded = ImageClassifier(write_fake_model(tmp_path, file_name="model.onnx", in_onnx_folder=False))
    assert loaded.path.name == "model.onnx"


@pytest.mark.parametrize(
    "id2label, ai_label, expected",
    [
        ({"0": "AI", "1": "Real"}, None, 0),
        ({"0": "human", "1": "fake"}, None, 1),
        ({"0": "real", "1": "artificial"}, None, 1),
        ({"0": "hum", "1": "gen"}, "gen", 1),
    ],
)
def test_find_ai_index(id2label, ai_label, expected):
    assert find_ai_index({"id2label": id2label}, ai_label) == expected


@pytest.mark.parametrize("id2label", [{}, {"0": "cat", "1": "dog"}, {"0": "fake", "1": "ai"}])
def test_unclear_labels_are_refused(id2label):
    with pytest.raises(ClassifierError):
        find_ai_index({"id2label": id2label})


def test_missing_files_are_reported_clearly(tmp_path):
    with pytest.raises(ClassifierError, match="config.json"):
        ImageClassifier(tmp_path)
    write_fake_model(tmp_path)
    with pytest.raises(ClassifierError, match="No ONNX model"):
        ImageClassifier(tmp_path, model_file="model_fp16.onnx")


# --- Preparing pictures ---------------------------------------------------------

def test_preprocessing_matches_hugging_face_vit_settings():
    prep = Preprocessing.from_config(
        {"size": {"height": 224, "width": 224}, "image_mean": [0.5] * 3, "image_std": [0.5] * 3}
    )
    pixels = prep.prepare(Image.new("RGB", (640, 480), WHITE))
    assert pixels.shape == (1, 3, 224, 224) and pixels.dtype == np.float32
    assert np.allclose(pixels, 1.0)


def test_preprocessing_with_shortest_edge_and_centre_crop():
    prep = Preprocessing.from_config(
        {"size": {"shortest_edge": 256}, "do_center_crop": True, "crop_size": {"height": 224, "width": 224}}
    )
    assert prep.prepare(Image.new("RGB", (1000, 300), BLACK)).shape == (1, 3, 224, 224)


def test_see_through_parts_count_as_white(fake):
    clear = picture((0, 0, 0, 0), mode="RGBA")
    assert fake.score_bytes(clear) > 0.99


def test_large_jpegs_and_grey_pictures_work(fake):
    assert fake.score_bytes(picture(WHITE, "JPEG", size=(4000, 3000))) > 0.99
    assert fake.score_bytes(picture(200, size=(30, 30), mode="L")) > 0.9


@pytest.mark.parametrize(
    "score, band", [(0.95, "high"), (0.9, "high"), (0.89, "middle"), (0.5, "middle"), (0.49, "low")]
)
def test_bands(score, band):
    assert band_for(score, low=0.5, high=0.9) == band


# --- Combining with the picture's own data ------------------------------------------

def test_confident_model_makes_a_picture_with_no_record_likely_ai(fake):
    result = check_image(picture(WHITE), classifier=fake)
    assert result.verdict == "likely_ai"
    assert result.ai_likelihood == 1.0
    assert result.signals[0].label == "Looks made with AI"
    assert "estimate" in result.message
    assert "reverse image search" in result.signals[-1].explanation


def test_model_never_calls_a_picture_real(fake):
    result = check_image(picture(BLACK), classifier=fake)
    assert result.verdict == "uncertain"
    assert result.ai_likelihood is None
    labels = [s.label for s in result.signals]
    assert "No clear signs of AI found" in labels
    assert labels[-1] == "Try other checks too"


def test_unsure_model_says_so(fake):
    result = check_image(picture(GREY), classifier=fake)
    assert result.verdict == "uncertain"
    assert result.ai_likelihood is None
    assert any(s.label == "Our detector isn't sure" for s in result.signals)


def test_a_signed_ai_record_wins_and_the_model_is_not_run():
    stub = StubClassifier(0.0)
    result = check_image(fixture_bytes("ai_generated.jpg"), classifier=stub)
    assert result.verdict == "likely_ai"
    assert stub.calls == 0


def test_an_unconfirmed_camera_claim_can_still_be_flagged_by_the_model():
    result = check_image(fixture_bytes("camera.jpg"), classifier=StubClassifier(0.99))
    assert result.verdict == "likely_ai"
    assert result.content_credentials.status == "untrusted_signer"
    assert any("we don't recognise the signer" in s.label for s in result.signals)


def test_a_model_failure_falls_back_to_the_pictures_own_data(caplog):
    result = check_image(picture(WHITE), classifier=StubClassifier(RuntimeError("boom")))
    assert result.verdict == "uncertain"
    assert result.signals[0].label == "No record of how it was made"
    assert "classifier failed" in caplog.text


def test_without_a_model_checks_work_as_before():
    result = check_image(picture(WHITE))
    assert result.verdict == "uncertain"
    assert not any("detector" in s.explanation for s in result.signals)


# --- Settings and the API -----------------------------------------------------------

@pytest.fixture
def fresh_settings():
    get_settings.cache_clear()
    get_classifier.cache_clear()
    yield
    get_settings.cache_clear()
    get_classifier.cache_clear()


def test_no_model_is_loaded_unless_configured(fresh_settings, monkeypatch):
    monkeypatch.delenv("APP_CLASSIFIER_MODEL_DIR", raising=False)
    assert get_classifier() is None


def test_model_is_loaded_once_from_settings(fresh_settings, monkeypatch, model_dir):
    monkeypatch.setenv("APP_CLASSIFIER_MODEL_DIR", str(model_dir))
    first = get_classifier()
    assert isinstance(first, ImageClassifier)
    assert get_classifier() is first


def test_thresholds_come_from_settings(fresh_settings, monkeypatch, fake):
    monkeypatch.setenv("APP_CLASSIFIER_HIGH_THRESHOLD", "0.5")
    monkeypatch.setenv("APP_CLASSIFIER_LOW_THRESHOLD", "0.2")
    assert classifier_module.estimate(fake, picture(GREY)).band == "high"


def test_api_uses_the_configured_classifier(client, fake):
    client.app.dependency_overrides[get_classifier] = lambda: fake
    response = client.post("/api/check-image", files={"file": ("p.png", picture(WHITE), "image/png")})
    assert response.status_code == 200
    assert response.json()["verdict"] == "likely_ai"


def test_both_memory_modes_give_the_same_scores(model_dir):
    low = ImageClassifier(model_dir, low_memory=True)
    fast = ImageClassifier(model_dir, low_memory=False)
    data = picture((140, 140, 140))
    assert low.score_bytes(data) == pytest.approx(fast.score_bytes(data), abs=1e-6)


def test_ordinary_jpegs_are_decoded_in_full(fake, monkeypatch):
    seen = []
    monkeypatch.setattr(fake, "ai_score", lambda image: seen.append(image.size) or 0.0)
    fake.score_bytes(picture(WHITE, "JPEG", size=(4000, 3000)))
    fake.score_bytes(picture(WHITE, "JPEG", size=(8200, 6000)))
    assert seen == [(4000, 3000), (4100, 3000)]
