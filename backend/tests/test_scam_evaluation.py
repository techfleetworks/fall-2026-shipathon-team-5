"""Guards the scam checker's measured quality on evaluation/scam_messages.csv.

The thresholds are the baseline measured when the test set was created. If a
change improves the checker, raise them so the gain can't be lost later. Never
lower them to make a change pass without the team agreeing.
"""

from collections import Counter

from evaluation.evaluate_scam_checker import evaluate, load_examples

# Baseline measured on 2026-11-13: 44/60 scams caught, 7/60 false alarms.
MIN_SCAMS_CAUGHT = 44
MAX_FALSE_ALARMS = 7


def test_dataset_is_well_formed():
    examples = load_examples()
    ids = Counter(ex.id for ex in examples)
    assert not [i for i, n in ids.items() if n > 1], "duplicate ids"
    assert all(ex.text.strip() for ex in examples)
    assert all(ex.region in {"US", "UK"} for ex in examples)
    labels = Counter(ex.is_scam for ex in examples)
    assert labels[True] >= 50 and labels[False] >= 50, "keep both classes well represented"


def test_catches_at_least_the_baseline_number_of_scams():
    report = evaluate(load_examples())
    assert report.caught >= MIN_SCAMS_CAUGHT, (
        f"Caught {report.caught}/{report.scams} scams, baseline is {MIN_SCAMS_CAUGHT}. "
        "Run `python -m evaluation.evaluate_scam_checker --details` to see which were missed."
    )


def test_false_alarms_do_not_increase():
    report = evaluate(load_examples())
    assert report.false_alarms <= MAX_FALSE_ALARMS, (
        f"{report.false_alarms} ordinary messages were flagged, baseline is {MAX_FALSE_ALARMS}. "
        "Run `python -m evaluation.evaluate_scam_checker --details` to see which."
    )
