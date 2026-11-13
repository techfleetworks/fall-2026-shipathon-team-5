"""Measure how well the scam checker does on the labeled test set.

Run from the backend folder:

    python -m evaluation.evaluate_scam_checker            # summary
    python -m evaluation.evaluate_scam_checker --details  # also list every mistake

A message counts as "flagged" when the checker rates it medium or high risk.
"""

import argparse
import csv
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path

from app.services.scam_rules import check_text

DATASET = Path(__file__).with_name("scam_messages.csv")


@dataclass(frozen=True)
class Example:
    id: str
    is_scam: bool
    message_type: str
    region: str
    text: str


@dataclass(frozen=True)
class Report:
    scams: int
    caught: int
    ordinary: int
    false_alarms: int
    missed: list[Example]
    wrongly_flagged: list[Example]
    catch_rate_by_type: dict[str, tuple[int, int]]

    @property
    def catch_rate(self) -> float:
        return self.caught / self.scams

    @property
    def false_alarm_rate(self) -> float:
        return self.false_alarms / self.ordinary


def load_examples(path: Path = DATASET) -> list[Example]:
    with path.open(encoding="utf-8", newline="") as f:
        return [
            Example(
                id=row["id"],
                is_scam=row["label"] == "scam",
                message_type=row["message_type"],
                region=row["region"],
                text=row["text"],
            )
            for row in csv.DictReader(f)
        ]


def is_flagged(text: str) -> bool:
    return check_text(text).risk in {"medium", "high"}


def evaluate(examples: list[Example]) -> Report:
    missed, wrongly_flagged = [], []
    by_type: dict[str, list[int]] = defaultdict(lambda: [0, 0])
    for ex in examples:
        flagged = is_flagged(ex.text)
        if ex.is_scam:
            by_type[ex.message_type][1] += 1
            if flagged:
                by_type[ex.message_type][0] += 1
            else:
                missed.append(ex)
        elif flagged:
            wrongly_flagged.append(ex)

    scams = sum(ex.is_scam for ex in examples)
    return Report(
        scams=scams,
        caught=scams - len(missed),
        ordinary=len(examples) - scams,
        false_alarms=len(wrongly_flagged),
        missed=missed,
        wrongly_flagged=wrongly_flagged,
        catch_rate_by_type={k: (v[0], v[1]) for k, v in sorted(by_type.items())},
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--details", action="store_true", help="list every mistake")
    args = parser.parse_args()

    r = evaluate(load_examples())
    print(f"Scams caught:   {r.caught}/{r.scams} ({r.catch_rate:.0%})")
    print(f"False alarms:   {r.false_alarms}/{r.ordinary} ordinary messages ({r.false_alarm_rate:.0%})")
    print("\nCaught by scam type:")
    for kind, (caught, total) in r.catch_rate_by_type.items():
        print(f"  {kind:<14} {caught}/{total}")

    if args.details:
        print("\nMissed scams:")
        for ex in r.missed:
            print(f"  [{ex.id}] {ex.text}")
        print("\nOrdinary messages wrongly flagged:")
        for ex in r.wrongly_flagged:
            print(f"  [{ex.id}] {ex.text}")


if __name__ == "__main__":
    main()
