"""Guards the scam checker's measured quality.

The thresholds are baselines measured on the test sets. If a change improves
the checker, raise them so the gain can't be lost later. Never lower them to
make a change pass without the team agreeing.

Do not tune rules against scam_messages_holdout.csv: it exists to estimate how
the checker does on messages it was never tuned on (see evaluation/README.md).
"""

from collections import Counter

import pytest

from evaluation.evaluate_scam_checker import DATASET, HOLDOUT, evaluate, load_examples

# Baselines measured on 2026-11-15 (weighted rules, ADR 0003).
BASELINES = {
    # dataset: (min scams caught, max false alarms)
    DATASET: (73, 1),  # of 80 scams / 80 ordinary
    HOLDOUT: (12, 1),  # of 20 scams / 20 ordinary
}


@pytest.mark.parametrize("path", [DATASET, HOLDOUT], ids=["main", "holdout"])
def test_dataset_is_well_formed(path):
    examples = load_examples(path)
    ids = Counter(ex.id for ex in examples)
    assert not [i for i, n in ids.items() if n > 1], "duplicate ids"
    assert all(ex.text.strip() for ex in examples)
    assert all(ex.region in {"US", "UK"} for ex in examples)
    labels = Counter(ex.is_scam for ex in examples)
    assert labels[True] >= 20 and labels[False] >= 20, "keep both classes well represented"


def test_no_message_is_in_both_sets():
    main = {ex.text for ex in load_examples(DATASET)}
    assert not main & {ex.text for ex in load_examples(HOLDOUT)}


@pytest.mark.parametrize("path", [DATASET, HOLDOUT], ids=["main", "holdout"])
def test_catches_at_least_the_baseline_number_of_scams(path):
    report = evaluate(load_examples(path))
    minimum = BASELINES[path][0]
    assert report.caught >= minimum, (
        f"Caught {report.caught}/{report.scams} scams, baseline is {minimum}. "
        "Run `python -m evaluation.evaluate_scam_checker --details` to see which were missed."
    )


@pytest.mark.parametrize("path", [DATASET, HOLDOUT], ids=["main", "holdout"])
def test_false_alarms_do_not_increase(path):
    report = evaluate(load_examples(path))
    maximum = BASELINES[path][1]
    assert report.false_alarms <= maximum, (
        f"{report.false_alarms} ordinary messages were flagged, baseline is {maximum}. "
        "Run `python -m evaluation.evaluate_scam_checker --details` to see which."
    )
