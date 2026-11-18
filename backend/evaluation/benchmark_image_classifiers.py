"""Measure candidate AI-image classifiers on the test set (plan step 2).

For each model, on the original pictures and on their social media versions:

* AI pictures caught and real photos wrongly called AI, at the configured
  thresholds and at the thresholds that keep false alarms to 1%, 2% and 5%
  on the tuning part
* memory: before loading, after loading and at the peak
* seconds per picture

Each model runs in its own process so memory numbers don't mix. Every score
is saved to evaluation/results/<model>-scores.csv for choosing thresholds.

Run from the backend folder, after `evaluation.download_candidate_models` and
`evaluation.image_testset download` and `social`:

    python -m evaluation.benchmark_image_classifiers models/vit-distilled models/swinv2-deploy

To get the free plan's speed and memory limit (0.1 CPU, 512 MB), run it in the
backend's Docker image (see evaluation/README.md).
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import os
import statistics
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path

from evaluation.image_testset import IMAGES, VERSIONS, Picture, load_manifest

RESULTS = Path(__file__).parent / "results"
FALSE_ALARM_TARGETS = (0.01, 0.02, 0.05)


def memory_mb() -> tuple[float, float]:
    """(current, peak) memory of this process in MB."""
    try:
        import psutil

        info = psutil.Process().memory_info()
        current = info.rss
        peak = getattr(info, "peak_wset", 0)  # Windows
    except ImportError:
        current = peak = 0
    if not peak and sys.platform != "win32":
        import resource

        peak = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss * 1024  # KB on Linux
        if not current:
            with open("/proc/self/statm") as f:
                current = int(f.read().split()[1]) * os.sysconf("SC_PAGE_SIZE")
    return current / 1e6, peak / 1e6


def threshold_for(real_scores: list[float], max_false_alarms: float) -> float:
    """Lowest threshold at which at most this share of real photos would be
    called AI (score >= threshold)."""
    ordered = sorted(real_scores, reverse=True)
    allowed = math.floor(max_false_alarms * len(ordered))
    if allowed >= len(ordered):
        return 0.0
    return math.nextafter(ordered[allowed], math.inf)


@dataclass(frozen=True)
class Rates:
    caught: int
    ai: int
    false_alarms: int
    real: int

    def __str__(self) -> str:
        return (
            f"caught {self.caught}/{self.ai} ({self.caught / max(self.ai, 1):.0%}), "
            f"false alarms {self.false_alarms}/{self.real} ({self.false_alarms / max(self.real, 1):.0%})"
        )


def rates(scored: list[tuple[Picture, float]], threshold: float) -> Rates:
    ai = [s for p, s in scored if p.is_ai]
    real = [s for p, s in scored if not p.is_ai]
    return Rates(sum(s >= threshold for s in ai), len(ai), sum(s >= threshold for s in real), len(real))


def measure_one(model_dir: Path, high: float, images: Path) -> dict:
    from app.services.classifier import ImageClassifier

    pictures = [p for p in load_manifest() if p.path(images=images).exists()]
    if not pictures:
        sys.exit("No pictures found. Run `python -m evaluation.image_testset download` first.")

    before, _ = memory_mb()
    started = time.perf_counter()
    model = ImageClassifier(model_dir)
    load_seconds = time.perf_counter() - started
    loaded, _ = memory_mb()

    rows, seconds = [], []
    for version in VERSIONS:
        for p in pictures:
            path = p.path(version, images)
            if not path.exists():
                continue
            data = path.read_bytes()
            started = time.perf_counter()
            score = model.score_bytes(data)
            seconds.append(time.perf_counter() - started)
            rows.append({"id": p.id, "version": version, "split": p.split, "label": p.label,
                         "generator": p.generator, "score": round(score, 6)})
    _, peak = memory_mb()

    RESULTS.mkdir(exist_ok=True)
    out = RESULTS / f"{model_dir.name}-scores.csv"
    with out.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)

    by_id = {p.id: p for p in pictures}
    report: dict = {
        "model": model_dir.name,
        "model_file": model.path.name,
        "model_mb": round(model.path.stat().st_size / 1e6, 1),
        "memory_mb": {"before_load": round(before), "after_load": round(loaded), "peak": round(peak)},
        "load_seconds": round(load_seconds, 2),
        "seconds_per_picture": {
            "median": round(statistics.median(seconds), 3),
            "p95": round(sorted(seconds)[int(0.95 * (len(seconds) - 1))], 3),
        },
        "results": {},
    }
    for version in VERSIONS:
        scored = {split: [(by_id[r["id"]], r["score"]) for r in rows
                          if r["version"] == version and r["split"] == split]
                  for split in ("tune", "holdout")}
        if not scored["tune"]:
            continue
        tune_real = [s for p, s in scored["tune"] if not p.is_ai]
        section = {f"configured threshold {high}": {s: str(rates(scored[s], high)) for s in scored}}
        for target in FALSE_ALARM_TARGETS:
            t = threshold_for(tune_real, target)
            section[f"threshold {t:.3f} (<= {target:.0%} false alarms on tune)"] = {
                s: str(rates(scored[s], t)) for s in scored
            }
        report["results"][version] = section
    report["scores_file"] = str(out)
    return report


def print_report(report: dict) -> None:
    print(f"\n== {report['model']} ({report['model_file']}, {report['model_mb']} MB) ==")
    m = report["memory_mb"]
    print(f"memory: {m['before_load']} MB before loading, {m['after_load']} MB after, {m['peak']} MB peak")
    s = report["seconds_per_picture"]
    print(f"speed: {s['median']} s per picture (95% within {s['p95']} s), loading {report['load_seconds']} s")
    for version, section in report["results"].items():
        print(f"-- {version} pictures --")
        for setting, by_split in section.items():
            print(f"  {setting}")
            for split, text in by_split.items():
                print(f"    {split:8} {text}")
    print(f"scores: {report['scores_file']}")


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("models", nargs="+", type=Path, help="model folders, e.g. models/vit-distilled")
    parser.add_argument("--high", type=float, default=0.9, help="threshold for 'likely_ai' to report")
    parser.add_argument("--images", type=Path, default=IMAGES)
    parser.add_argument("--json", action="store_true", help=argparse.SUPPRESS)  # used by the child processes
    args = parser.parse_args(argv)

    if len(args.models) == 1:
        report = measure_one(args.models[0], args.high, args.images)
        if args.json:
            print(json.dumps(report))
        else:
            print_report(report)
        return

    reports = []
    for model in args.models:
        # A fresh process per model, so each one's memory is measured alone.
        out = subprocess.run(
            [sys.executable, "-m", "evaluation.benchmark_image_classifiers", str(model),
             "--high", str(args.high), "--images", str(args.images), "--json"],
            check=True, capture_output=True, text=True,
        ).stdout
        reports.append(json.loads(out.strip().splitlines()[-1]))
        print_report(reports[-1])
    RESULTS.mkdir(exist_ok=True)
    (RESULTS / "summary.json").write_text(json.dumps(reports, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
