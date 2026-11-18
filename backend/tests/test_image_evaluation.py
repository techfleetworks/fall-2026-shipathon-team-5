"""Tests for the AI-image test set tools (evaluation/).

The test set itself isn't downloaded in CI, so the manifest checks skip until
`evaluation/image_testset.csv` exists. Once the model is chosen, add a guard on
its measured numbers here, like tests/test_scam_evaluation.py (plan step 6).
"""

import io
from collections import Counter

import pytest
from PIL import Image

from evaluation.benchmark_image_classifiers import Rates, rates, threshold_for
from evaluation.image_testset import (
    HOLDOUT_SHARE,
    SOCIAL_WIDTH,
    Picture,
    assign_split,
    load_manifest,
    pick_evenly,
    social_version,
)

MANIFEST = load_manifest()


def make_picture(i: int, label: str) -> Picture:
    return Picture(f"p-{i}", "tune", label, "gen", "ds", "default", "train", i, "image", "0" * 64, "mit")


def test_splits_are_stable_and_about_a_quarter_is_held_out():
    ids = [f"openfaketiny-test-{i:06d}" for i in range(2000)]
    assert [assign_split(i) for i in ids] == [assign_split(i) for i in ids]
    share = sum(assign_split(i) == "holdout" for i in ids) / len(ids)
    assert abs(share - HOLDOUT_SHARE) < 0.05


def test_pictures_are_spread_across_ai_tools():
    rows = [(i, "big") for i in range(100)] + [(100 + i, "small") for i in range(5)]
    picked = pick_evenly(rows, 10, seed=1)
    assert Counter(g for _, g in picked) == {"big": 5, "small": 5}
    assert pick_evenly(rows, 10, seed=1) == picked


def test_social_version_is_a_smaller_jpeg_without_metadata():
    buffer = io.BytesIO()
    Image.new("RGB", (3000, 2000), (10, 200, 30)).save(buffer, "PNG")
    social = social_version(buffer.getvalue(), "p-1")
    with Image.open(io.BytesIO(social)) as image:
        assert image.format == "JPEG"
        assert image.size == (SOCIAL_WIDTH, 720)
        assert not image.getexif()


def test_threshold_keeps_false_alarms_within_the_target():
    real = [i / 100 for i in range(100)]  # 0.00 ... 0.99
    t = threshold_for(real, 0.05)
    assert sum(s >= t for s in real) == 5
    assert sum(s >= threshold_for(real, 0.0) for s in real) == 0


def test_rates_count_catches_and_false_alarms():
    scored = [(make_picture(1, "ai"), 0.95), (make_picture(2, "ai"), 0.5), (make_picture(3, "real"), 0.92)]
    assert rates(scored, 0.9) == Rates(caught=1, ai=2, false_alarms=1, real=1)


@pytest.mark.skipif(not MANIFEST, reason="no AI-image test set manifest yet")
def test_manifest_is_well_formed():
    ids = Counter(p.id for p in MANIFEST)
    assert not [i for i, n in ids.items() if n > 1], "duplicate ids"
    assert {p.label for p in MANIFEST} <= {"ai", "real"}
    assert all(p.split == assign_split(p.id) for p in MANIFEST), "splits must not be edited by hand"
    assert all(len(p.sha256) == 64 and p.license for p in MANIFEST)
    for split in ("tune", "holdout"):
        labels = Counter(p.label for p in MANIFEST if p.split == split)
        assert labels["ai"] >= 20 and labels["real"] >= 20, "keep both classes well represented"
