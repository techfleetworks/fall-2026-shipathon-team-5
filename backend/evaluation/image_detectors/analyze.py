"""Summarise detector scores: how well each separates real from AI, and what
happens with a threshold tuned to keep false alarms on real photos low."""
import csv, sys
from collections import defaultdict
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from evaluate import auc

MAX_FALSE_ALARM = float(sys.argv[2]) if len(sys.argv) > 2 else 0.05

def load(path):
    with open(path) as f:
        return list(csv.DictReader(f))

def rates(rows, t):
    ai = [float(r["p_ai"]) for r in rows if r["label"] != "real"]
    real = [float(r["p_ai"]) for r in rows if r["label"] == "real"]
    catch = sum(p >= t for p in ai) / len(ai) if ai else float("nan")
    fa = sum(p >= t for p in real) / len(real) if real else float("nan")
    return catch, fa, len(ai), len(real)

def pick_threshold(rows):
    real = sorted(float(r["p_ai"]) for r in rows if r["label"] == "real")
    # smallest threshold whose false-alarm rate on these real photos is <= the target
    for t in sorted(set(real + [0.5, 0.99, 0.999, 1.0])):
        if sum(p >= t for p in real) / len(real) <= MAX_FALSE_ALARM:
            return t
    return 1.0

for path in sorted(Path(sys.argv[1]).glob("scores-*.csv")):
    rows = load(path)
    name = path.stem.removeprefix("scores-")
    n = len({r["file"] for r in rows})
    print(f"\n=== {name}  ({n} pictures x 2 versions)")
    print("  How well it separates real from AI (AUC: 0.5 = coin flip, 1.0 = perfect)")
    for variant in ("original", "social"):
        line = []
        for group in ("core", "reddit-images", "reddit-video", "ALL"):
            sel = [r for r in rows if r["variant"] == variant and (group == "ALL" or r["group"] == group)]
            pos = [float(r["p_ai"]) for r in sel if r["label"] != "real"]
            neg = [float(r["p_ai"]) for r in sel if r["label"] == "real"]
            line.append(f"{group} {auc(pos, neg):.2f}")
        print(f"    {variant:<9}", " | ".join(line))
    tune = [r for r in rows if r["split"] == "tune"]
    hold = [r for r in rows if r["split"] == "holdout"]
    t = pick_threshold(tune)
    print(f"  Threshold tuned on the tuning part for <= {MAX_FALSE_ALARM:.0%} false alarms: {t:.4f}")
    for variant in ("original", "social"):
        for group in ("core", "reddit-images", "reddit-video", "ALL"):
            sel = [r for r in hold if r["variant"] == variant and (group == "ALL" or r["group"] == group)]
            c, fa, na, nr = rates(sel, t)
            print(f"    holdout {variant:<9} {group:<14} AI caught {c:5.0%} of {na:3d} | real photos flagged {fa:5.0%} of {nr:3d}")
    c, fa, na, nr = rates([r for r in hold], 0.5)
    print(f"  For comparison, at the default 0.5: AI caught {c:.0%}, real photos flagged {fa:.0%} (holdout, both versions)")
