"""Build, download and prepare the AI-image test set.

The pictures are never committed (licenses and repo size). Only the manifest,
`image_testset.csv`, is: one row per picture saying where it comes from, its
label and a SHA-256 of its bytes, so everyone measures on exactly the same
pictures. See docs/plans/image-classifier.md.

Needs the extra tools in requirements-eval.txt and access to huggingface.co.
Run from the backend folder:

    # 1. Pick pictures from Hugging Face datasets into the manifest (once).
    #    Check each dataset's license and column names first.
    python -m evaluation.image_testset sample ComplexDataLab/OpenFakeTiny \\
        --split test --label-column label --ai-values fake --real-values real \\
        --generator-column model --ai 150 --license <its license>
    python -m evaluation.image_testset sample <a permissively licensed photo set> \\
        --split train --fixed-label real --real 150 --license <its license>

    # 2. Download the pictures in the manifest into evaluation/images/.
    python -m evaluation.image_testset download

    # 3. Make the "social media" versions (1080 px wide, JPEG quality 70-85).
    python -m evaluation.image_testset social
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
import random
import sys
from collections import defaultdict
from dataclasses import asdict, dataclass, fields
from pathlib import Path

from PIL import Image, ImageOps

HERE = Path(__file__).parent
MANIFEST = HERE / "image_testset.csv"
IMAGES = HERE / "images"  # git-ignored
VERSIONS = ("original", "social")

# About a quarter of each label is held out. Never tune thresholds on it.
HOLDOUT_SHARE = 0.25
SOCIAL_WIDTH = 1080
SOCIAL_QUALITY = (70, 85)


@dataclass(frozen=True)
class Picture:
    id: str  # e.g. "openfaketiny-test-00042"; never reuse an id
    split: str  # "tune" or "holdout"
    label: str  # "ai" or "real"
    generator: str  # AI tool, or "camera" / "unknown" for real photos
    dataset: str  # Hugging Face dataset id
    config: str  # dataset configuration ("default" if none)
    dataset_split: str  # e.g. "train", "test"
    row: int  # row number within that split
    image_column: str
    sha256: str  # of the picture's original bytes
    license: str

    @property
    def is_ai(self) -> bool:
        return self.label == "ai"

    def path(self, version: str = "original", images: Path = IMAGES) -> Path:
        suffix = ".jpg" if version == "social" else ".img"
        return images / version / f"{self.id}{suffix}"


def load_manifest(path: Path = MANIFEST) -> list[Picture]:
    if not path.exists():
        return []
    with path.open(encoding="utf-8", newline="") as f:
        return [Picture(**{**row, "row": int(row["row"])}) for row in csv.DictReader(f)]


def save_manifest(pictures: list[Picture], path: Path = MANIFEST) -> None:
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=[x.name for x in fields(Picture)])
        writer.writeheader()
        writer.writerows(asdict(p) for p in sorted(pictures, key=lambda p: p.id))


def assign_split(picture_id: str) -> str:
    """Stable: the same id always lands in the same part."""
    bucket = int(hashlib.sha256(picture_id.encode()).hexdigest()[:8], 16) / 0xFFFFFFFF
    return "holdout" if bucket < HOLDOUT_SHARE else "tune"


def pick_evenly(rows: list[tuple[int, str]], count: int, seed: int) -> list[tuple[int, str]]:
    """Pick `count` (row, generator) pairs, spread as evenly as possible across
    generators, so one AI tool doesn't dominate the test set."""
    by_generator: dict[str, list[tuple[int, str]]] = defaultdict(list)
    for row in rows:
        by_generator[row[1]].append(row)
    rng = random.Random(seed)
    for group in by_generator.values():
        rng.shuffle(group)
    picked: list[tuple[int, str]] = []
    groups = sorted(by_generator.values(), key=len)
    while len(picked) < count and any(groups):
        for group in groups:
            if group and len(picked) < count:
                picked.append(group.pop())
    return sorted(picked)


def _open_dataset(name: str, config: str, split: str, image_column: str):
    from datasets import Image as ImageFeature
    from datasets import load_dataset

    ds = load_dataset(name, None if config == "default" else config, split=split, streaming=True)
    # Keep the original file bytes: re-encoding would change what we measure.
    return ds.cast_column(image_column, ImageFeature(decode=False))


def _image_bytes(value) -> bytes:
    if isinstance(value, dict) and value.get("bytes"):
        return value["bytes"]
    if isinstance(value, dict) and value.get("path"):
        return Path(value["path"]).read_bytes()
    raise ValueError("Can't read the picture's bytes from this dataset row")


def _slug(name: str) -> str:
    return name.split("/")[-1].lower().replace("_", "-")


def sample(args: argparse.Namespace) -> None:
    ai_values = {v.strip().lower() for v in args.ai_values.split(",") if v.strip()}
    real_values = {v.strip().lower() for v in args.real_values.split(",") if v.strip()}
    ds = _open_dataset(args.dataset, args.config, args.split, args.image_column)

    candidates: dict[str, list[tuple[int, str]]] = {"ai": [], "real": []}
    for row_number, row in enumerate(ds.remove_columns([args.image_column])):
        if args.max_rows and row_number >= args.max_rows:
            break
        if args.fixed_label:
            label = args.fixed_label
        else:
            value = str(row[args.label_column]).strip().lower()
            label = "ai" if value in ai_values else "real" if value in real_values else None
            if label is None:
                continue
        generator = str(row.get(args.generator_column) or "") if args.generator_column else ""
        generator = generator or ("unknown" if label == "ai" else "camera")
        candidates[label].append((row_number, generator))

    wanted = {"ai": args.ai, "real": args.real}
    chosen = {label: pick_evenly(rows, wanted[label], args.seed) for label, rows in candidates.items()}
    for label, rows in chosen.items():
        if len(rows) < wanted[label]:
            sys.exit(f"Only found {len(rows)} {label} pictures, wanted {wanted[label]}.")

    rows_wanted = {row: (label, gen) for label, rows in chosen.items() for row, gen in rows}
    existing = load_manifest()
    known = {(p.dataset, p.config, p.dataset_split, p.row) for p in existing}
    added: list[Picture] = []
    for row_number, row in enumerate(ds):
        if row_number > max(rows_wanted, default=-1):
            break
        if row_number not in rows_wanted or (args.dataset, args.config, args.split, row_number) in known:
            continue
        label, generator = rows_wanted[row_number]
        data = _image_bytes(row[args.image_column])
        picture_id = f"{_slug(args.dataset)}-{args.split}-{row_number:06d}"
        added.append(
            Picture(
                id=picture_id,
                split=assign_split(picture_id),
                label=label,
                generator=generator,
                dataset=args.dataset,
                config=args.config,
                dataset_split=args.split,
                row=row_number,
                image_column=args.image_column,
                sha256=hashlib.sha256(data).hexdigest(),
                license=args.license,
            )
        )
    save_manifest(existing + added)
    print(f"Added {len(added)} pictures to {MANIFEST.name} ({len(existing) + len(added)} in total).")


def download(args: argparse.Namespace) -> None:
    pictures = load_manifest()
    groups: dict[tuple[str, str, str, str], dict[int, Picture]] = defaultdict(dict)
    for p in pictures:
        if not p.path().exists():
            groups[(p.dataset, p.config, p.dataset_split, p.image_column)][p.row] = p
    (IMAGES / "original").mkdir(parents=True, exist_ok=True)

    problems = 0
    for (dataset, config, split, image_column), wanted in groups.items():
        ds = _open_dataset(dataset, config, split, image_column)
        last = max(wanted)
        for row_number, row in enumerate(ds):
            if row_number > last:
                break
            picture = wanted.get(row_number)
            if picture is None:
                continue
            data = _image_bytes(row[image_column])
            if hashlib.sha256(data).hexdigest() != picture.sha256:
                print(f"{picture.id}: the picture has changed upstream; skipped", file=sys.stderr)
                problems += 1
                continue
            picture.path().write_bytes(data)
        print(f"{dataset}: done")
    missing = [p.id for p in pictures if not p.path().exists()]
    print(f"{len(pictures) - len(missing)}/{len(pictures)} pictures ready in {IMAGES}.")
    if missing or problems:
        sys.exit(1)


def social_version(data: bytes, picture_id: str) -> bytes:
    """Mimic what social media sites do on upload: shrink to 1080 px wide,
    drop the metadata and save as JPEG at quality 70-85."""
    quality = random.Random(picture_id).randint(*SOCIAL_QUALITY)
    with Image.open(io.BytesIO(data)) as image:
        image = ImageOps.exif_transpose(image).convert("RGB")
        if image.width > SOCIAL_WIDTH:
            image = image.resize(
                (SOCIAL_WIDTH, round(image.height * SOCIAL_WIDTH / image.width)), Image.Resampling.LANCZOS
            )
        out = io.BytesIO()
        image.save(out, "JPEG", quality=quality)
        return out.getvalue()


def social(_: argparse.Namespace) -> None:
    (IMAGES / "social").mkdir(parents=True, exist_ok=True)
    made = 0
    for p in load_manifest():
        if p.path().exists() and not p.path("social").exists():
            p.path("social").write_bytes(social_version(p.path().read_bytes(), p.id))
            made += 1
    print(f"Made {made} social media versions in {IMAGES / 'social'}.")


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    commands = parser.add_subparsers(dest="command", required=True)

    s = commands.add_parser("sample", help="add pictures from a Hugging Face dataset to the manifest")
    s.add_argument("dataset")
    s.add_argument("--config", default="default")
    s.add_argument("--split", default="train")
    s.add_argument("--image-column", default="image")
    s.add_argument("--label-column", default="label")
    s.add_argument("--ai-values", default="fake,ai,1", help="label values meaning AI, comma-separated")
    s.add_argument("--real-values", default="real,0", help="label values meaning real")
    s.add_argument("--fixed-label", choices=["ai", "real"], help="every picture in this dataset has this label")
    s.add_argument("--generator-column", help="column naming the AI tool, if any")
    s.add_argument("--ai", type=int, default=0, help="how many AI pictures to add")
    s.add_argument("--real", type=int, default=0, help="how many real photos to add")
    s.add_argument("--license", required=True, help="the dataset's license, e.g. cc-by-4.0")
    s.add_argument("--max-rows", type=int, default=0, help="only look at the first N rows (0 = all)")
    s.add_argument("--seed", type=int, default=2026)
    s.set_defaults(run=sample)

    commands.add_parser("download", help="download the manifest's pictures").set_defaults(run=download)

    commands.add_parser("social", help="make the social media versions").set_defaults(run=social)

    args = parser.parse_args(argv)
    args.run(args)


if __name__ == "__main__":
    main()
