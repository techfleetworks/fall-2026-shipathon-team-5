"""Guards the AI-image classifier's thresholds against the measured scores.

The scores are the SwinV2 model's on 500 OpenFakeTiny pictures, each as is
and as a social media copy (evaluation/image_detectors/, ADR 0006). If the
thresholds in app/config.py change, these tests show what that does. Never
loosen the false-alarm limits without the team agreeing: a real photo called
AI does real harm.

Thresholds are chosen on the "tune" part only. The "holdout" part estimates
how they do on pictures they weren't chosen on.
"""

import csv
from pathlib import Path

import pytest

from app.config import Settings

SCORES = Path(__file__).parent.parent / "evaluation" / "image_detectors" / "results" / "scores-swinv2-uint8.csv"

# Measured on 2026-11-18 at the 0.985 threshold (holdout: 100 AI, 112 real).
BASELINES = {
    # version: (min AI pictures caught, max real photos called AI)
    "original": (66, 2),
    "social": (54, 2),
}
MAX_FALSE_ALARM_RATE = 0.02


def load(version: str, split: str) -> tuple[list[float], list[float]]:
    with SCORES.open(encoding="utf-8", newline="") as f:
        rows = [r for r in csv.DictReader(f) if r["variant"] == version and r["split"] == split]
    ai = [float(r["p_ai"]) for r in rows if r["label"] == "fake"]
    real = [float(r["p_ai"]) for r in rows if r["label"] == "real"]
    return ai, real


@pytest.fixture(scope="module")
def high() -> float:
    return Settings(_env_file=None).classifier_high_threshold


def test_threshold_keeps_false_alarms_low_on_the_tuning_part(high):
    # Chosen on both versions together, as in evaluation/image_detectors/.
    real = [s for version in BASELINES for s in load(version, "tune")[1]]
    rate = sum(s >= high for s in real) / len(real)
    assert rate <= MAX_FALSE_ALARM_RATE, f"{rate:.1%} of real photos would be called AI"


@pytest.mark.parametrize("version", BASELINES)
def test_holdout_results_do_not_get_worse(version, high):
    ai, real = load(version, "holdout")
    min_caught, max_false_alarms = BASELINES[version]
    caught = sum(s >= high for s in ai)
    false_alarms = sum(s >= high for s in real)
    assert false_alarms <= max_false_alarms, f"{false_alarms}/{len(real)} real photos called AI"
    assert caught >= min_caught, f"caught {caught}/{len(ai)} AI pictures, baseline is {min_caught}"


def test_low_threshold_is_below_the_high_one(high):
    assert 0 < Settings(_env_file=None).classifier_low_threshold < high
