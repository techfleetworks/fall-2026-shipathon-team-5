"""Download the AI-image classifier into the Docker image at build time.

Everything is pinned: the Hugging Face revision (a commit, so the JSON files
can't change) and the SHA-256 of the ONNX file. The build fails if anything
doesn't match, so the image never ships a model nobody measured.
The server never downloads anything at run time. See ADR 0006.

The weights are then moved out of the .onnx file into a separate
`<name>.onnx_data` file. The model and its scores are unchanged, but ONNX
Runtime can then map the weights straight from disk instead of copying them
into memory, which roughly halves the memory the model needs (measured: 491 MB
-> 57 MB after loading). Needs the `onnx` package, so run it in a build stage.

Usage: python fetch_model.py <repo> <revision> <onnx-file> <sha256> <folder>
"""

import hashlib
import shutil
import sys
import urllib.request
from pathlib import Path


def fetch(repo: str, revision: str, file: str, dest: Path) -> str:
    url = f"https://huggingface.co/{repo}/resolve/{revision}/{file}"
    dest.parent.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha256()
    with urllib.request.urlopen(url, timeout=60) as response, dest.open("wb") as out:
        while block := response.read(1 << 20):
            digest.update(block)
            out.write(block)
    return digest.hexdigest()


def move_weights_out(path: Path) -> None:
    """Rewrite the model with its weights in `<file>_data`, next to it."""
    import onnx

    model = onnx.load(str(path))
    onnx.save_model(
        model,
        str(path),
        save_as_external_data=True,
        all_tensors_to_one_file=True,
        location=path.name + "_data",
        size_threshold=1024,
    )
    (path.parent / (path.name + "_data")).chmod(0o644)


def main(repo: str, revision: str, onnx_file: str, sha256: str, folder: str) -> None:
    if len(revision) != 40:
        sys.exit("Pin the model to a full 40-character commit, not a branch name.")
    root = Path(folder)
    for file in ("config.json", "preprocessor_config.json"):
        fetch(repo, revision, file, root / file)
    got = fetch(repo, revision, onnx_file, root / onnx_file)
    if got != sha256:
        shutil.rmtree(root)
        sys.exit(f"{onnx_file}: SHA-256 is {got}, expected {sha256}. Refusing to build.")
    move_weights_out(root / onnx_file)
    print(f"{repo}@{revision[:10]}: {onnx_file} verified, weights moved to {Path(onnx_file).name}_data")


if __name__ == "__main__":
    main(*sys.argv[1:])
