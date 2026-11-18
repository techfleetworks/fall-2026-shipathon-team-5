"""Download the candidate AI-image classifiers into models/ (git-ignored).

Only the files the backend needs are fetched: config.json,
preprocessor_config.json and the quantized ONNX file. Each folder gets a
SOURCE.json recording the exact revision and the SHA-256 of every file, which
the Docker build will pin once a model is chosen (plan step 5).

Needs huggingface_hub (requirements-eval.txt) and access to huggingface.co.
Run from the backend folder:

    python -m evaluation.download_candidate_models          # all candidates
    python -m evaluation.download_candidate_models vit-distilled
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

MODELS = Path(__file__).parent.parent / "models"

# name: (Hugging Face repo, preferred quantized ONNX file). See the plan's
# candidate table. If the preferred file isn't there, the first other
# quantized file found is used.
CANDIDATES: dict[str, tuple[str, str]] = {
    "vit-distilled": ("onnx-community/ai-image-detect-distilled-ONNX", "onnx/model_int8.onnx"),
    "swinv2-deploy": ("SoldadoXara/ai-image-detector-deploy-ONNX", "onnx/model_uint8.onnx"),
    "vit-cifake": ("onnx-community/ai-image-detection-ONNX", "onnx/model_int8.onnx"),
}
FALLBACK_FILES = (
    "onnx/model_quantized.onnx", "onnx/model_int8.onnx", "onnx/model_uint8.onnx",
    "model_quantized.onnx", "model_int8.onnx", "model_uint8.onnx",
)
CONFIG_FILES = ("config.json", "preprocessor_config.json")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1 << 20), b""):
            digest.update(block)
    return digest.hexdigest()


def download(name: str) -> Path:
    from huggingface_hub import HfApi, hf_hub_download

    repo, preferred = CANDIDATES[name]
    api = HfApi()
    revision = api.model_info(repo).sha  # pin everything to one commit
    available = set(api.list_repo_files(repo, revision=revision))
    onnx_file = next((f for f in (preferred, *FALLBACK_FILES) if f in available), None)
    if onnx_file is None:
        raise SystemExit(f"{repo} has no quantized ONNX file; found: {sorted(available)}")
    folder = MODELS / name
    files = {}
    for file in (*CONFIG_FILES, onnx_file):
        local = Path(hf_hub_download(repo, file, revision=revision, local_dir=folder))
        files[file] = {"sha256": sha256(local), "bytes": local.stat().st_size}
    (folder / "SOURCE.json").write_text(
        json.dumps({"repo": repo, "revision": revision, "model_file": onnx_file, "files": files}, indent=2) + "\n",
        encoding="utf-8",
    )
    size = files[onnx_file]["bytes"] / 1e6
    print(f"{name}: {repo}@{revision[:10]}, {Path(onnx_file).name} {size:.0f} MB -> {folder}")
    return folder


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("names", nargs="*", metavar="NAME",
                        help=f"which candidates (default: all of {', '.join(CANDIDATES)})")
    args = parser.parse_args(argv)
    unknown = set(args.names) - set(CANDIDATES)
    if unknown:
        parser.error(f"unknown candidate(s): {', '.join(sorted(unknown))}")
    for name in args.names or CANDIDATES:
        download(name)


if __name__ == "__main__":
    main()
