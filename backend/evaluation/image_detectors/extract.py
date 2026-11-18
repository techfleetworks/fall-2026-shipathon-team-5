"""Pick a balanced sample from the OpenFakeTiny test parquet files and write
them as image files plus a manifest.json per group.

Usage: python extract.py <core.parquet> <reddit.parquet or -> <out-dir>
"""
import json, sys
from collections import defaultdict
from pathlib import Path
import pyarrow.parquet as pq

def even(items, n):
    return items if len(items) <= n else [items[int(k * len(items) / n)] for k in range(n)]

def ext(b: bytes) -> str:
    return "jpg" if b[:2] == b"\xff\xd8" else "png" if b[:4] == b"\x89PNG" else "webp" if b[8:12] == b"WEBP" else "bin"

def load(path):
    t = pq.read_table(path, columns=["label", "model", "type", "release_date"])
    return [dict(row=i, **r) for i, r in enumerate(t.to_pylist())]

def write(path, config, group, picks, out):
    table = pq.ParquetFile(path)
    wanted = {p["row"]: p for p in picks}
    manifest, offset = [], 0
    for batch in table.iter_batches(batch_size=50, columns=["image"]):
        for k, img in enumerate(batch.column("image").to_pylist()):
            p = wanted.get(offset + k)
            if not p:
                continue
            data = img["bytes"]
            name = f"{group}/{p['label']}/{config}-{p['row']:04d}.{ext(data)}"
            (out / name).parent.mkdir(parents=True, exist_ok=True)
            (out / name).write_bytes(data)
            manifest.append(dict(file=name, dataset="ComplexDataLab/OpenFakeTiny", config=config, split="test",
                                 row=p["row"], label=p["label"], model=p["model"], type=p["type"],
                                 release_date=p["release_date"]))
        offset += batch.num_rows
    (out / group / "manifest.json").write_text(json.dumps(manifest, indent=1))
    real = sum(m["label"] == "real" for m in manifest)
    print(f"{group}: {len(manifest)} pictures ({real} real, {len(manifest) - real} AI)")

def main(core_path, reddit_path, out):
    out = Path(out)
    core = load(core_path)
    by_model = defaultdict(list)
    for r in core:
        if r["label"] != "real":
            by_model[r["model"]].append(r)
    fake, round_ = [], 0
    while len(fake) < 100 and any(round_ < len(v) for v in by_model.values()):
        for m in sorted(by_model):
            if round_ < len(by_model[m]) and len(fake) < 100:
                fake.append(by_model[m][round_])
        round_ += 1
    write(core_path, "core", "core", even([r for r in core if r["label"] == "real"], 100) + fake, out)
    if reddit_path != "-":
        red = load(reddit_path)
        pick = lambda label, typ, n: even([r for r in red if r["label"] == label and r["type"] == typ], n)
        write(reddit_path, "reddit", "reddit-images", pick("real", "image", 108) + pick("fake", "image", 108), out)
        write(reddit_path, "reddit", "reddit-video", pick("real", "video", 42) + pick("fake", "video", 42), out)

if __name__ == "__main__":
    main(*sys.argv[1:4])
