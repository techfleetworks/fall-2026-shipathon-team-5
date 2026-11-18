"""Score candidate AI-image detectors on the Veritas test set.

Usage: python evaluate.py <test-set-dir> <models-dir> <out-dir>
"""
import csv, hashlib, io, json, math, os, resource, sys, time
from pathlib import Path

import numpy as np
import onnxruntime as ort
from PIL import Image

Image.MAX_IMAGE_PIXELS = 80_000_000

MODELS = {
    # ai_index: which output means "AI-made" (from each model's config.json id2label)
    "distilled-vit-int8": dict(file="veritas-candidate-distilled-int8.onnx", size=224, mean=(0.5,)*3, std=(0.5,)*3, resample=Image.BILINEAR, ai_index=0),
    "swinv2-uint8": dict(file="veritas-candidate-swinv2-uint8.onnx", size=256, mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225), resample=Image.BICUBIC, ai_index=0),
    "vit-cifake-int8": dict(file="veritas-candidate-vitcifake-int8.onnx", size=224, mean=(0.5,)*3, std=(0.5,)*3, resample=Image.BILINEAR, ai_index=1),
}


def social_media_copy(img: Image.Image) -> Image.Image:
    """Roughly what X/Facebook do on upload: longest side 1080 px, JPEG quality 75."""
    img = img.copy()
    img.thumbnail((1080, 1080), Image.BICUBIC)
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=75)
    return Image.open(io.BytesIO(buf.getvalue())).convert("RGB")


def preprocess(img: Image.Image, cfg: dict) -> np.ndarray:
    x = img.resize((cfg["size"], cfg["size"]), cfg["resample"])
    a = np.asarray(x, dtype=np.float32) / 255.0
    a = (a - np.array(cfg["mean"], dtype=np.float32)) / np.array(cfg["std"], dtype=np.float32)
    return a.transpose(2, 0, 1)[None]


def p_ai(session, name, x, ai_index):
    logits = session.run(None, {name: x})[0][0].astype(np.float64)
    e = np.exp(logits - logits.max())
    return float(e[ai_index] / e.sum())


def split_of(file: str) -> str:
    """Deterministic 60/40 tuning/holdout split."""
    return "holdout" if int(hashlib.sha256(file.encode()).hexdigest(), 16) % 10 < 4 else "tune"


def auc(pos, neg):
    if not pos or not neg:
        return float("nan")
    s = sorted([(p, 1) for p in pos] + [(n, 0) for n in neg])
    rank_sum, i = 0.0, 0
    while i < len(s):
        j = i
        while j < len(s) and s[j][0] == s[i][0]:
            j += 1
        avg = (i + j + 1) / 2
        rank_sum += avg * sum(1 for k in range(i, j) if s[k][1] == 1)
        i = j
    return (rank_sum - len(pos) * (len(pos) + 1) / 2) / (len(pos) * len(neg))


def main(test_dir, models_dir, out_dir, model_name, budget_s="150"):
    """Score as many pictures as fit in the time budget, appending to scores-<model>.csv.
    Run again to continue where it stopped."""
    test_dir, models_dir, out_dir = Path(test_dir), Path(models_dir), Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    items = []
    for manifest in sorted(test_dir.glob("*/manifest.json")):
        for m in json.loads(manifest.read_text()):
            m["group"] = manifest.parent.name
            m["split"] = split_of(m["file"])
            items.append(m)
    cfg = MODELS[model_name]
    out = out_dir / f"scores-{model_name}.csv"
    done = set()
    if out.exists():
        with open(out) as f:
            done = {r["file"] for r in csv.DictReader(f)}
    todo = [it for it in items if it["file"] not in done]
    if not todo:
        print(model_name, "complete:", len(done), "pictures")
        return
    opts = ort.SessionOptions()
    opts.intra_op_num_threads = 2
    sess = ort.InferenceSession(str(models_dir / cfg["file"]), opts, providers=["CPUExecutionProvider"])
    inp = sess.get_inputs()[0].name
    fields = ["model", "variant", "file", "group", "split", "label", "generator", "p_ai"]
    new_file = not out.exists()
    t0 = time.monotonic()
    n = 0
    with open(out, "a", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        if new_file:
            w.writeheader()
        for it in todo:
            if time.monotonic() - t0 > float(budget_s):
                break
            img = Image.open(test_dir / it["file"]).convert("RGB")
            for variant, pic in (("original", img), ("social", social_media_copy(img))):
                p = p_ai(sess, inp, preprocess(pic, cfg), cfg["ai_index"])
                w.writerow(dict(model=model_name, variant=variant, file=it["file"], group=it["group"], split=it["split"],
                                label=it["label"], generator=it["model"], p_ai=round(p, 5)))
            n += 1
    print(model_name, f"+{n}", "->", len(done) + n, "of", len(items))


if __name__ == "__main__":
    main(*sys.argv[1:6])
