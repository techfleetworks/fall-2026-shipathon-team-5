"""Estimates whether a picture was made with AI by looking at its pixels.

Content Credentials and AI labels (content_credentials.py) are the best
evidence, but social media sites strip them. This classifier fills the gap. It
runs a small, quantized image-classification model with ONNX Runtime, so the
backend fits on Render's free plan (512 MB, 0.1 CPU). See
docs/plans/image-classifier.md and ADR 0005.

The model is a Hugging Face image-classification model exported to ONNX. Its
folder holds:

* the ONNX file (``model_quantized.onnx``, ``model_int8.onnx``, ...; either
  in the folder or in an ``onnx/`` subfolder)
* ``config.json``, whose ``id2label`` says which output means "AI"
* ``preprocessor_config.json``, which says how to resize and normalise

Detectors make mistakes, especially on compressed social media pictures and
pictures from new AI tools. So the model can only raise a picture to
"likely_ai" when it is very sure. It never calls a picture "likely_real": not
finding signs of AI doesn't prove a photo is real.

Pictures are processed in memory only and never saved.
"""

from __future__ import annotations

import io
import json
import logging
import math
import threading
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Literal

import numpy as np
from PIL import Image, ImageOps

from app.config import get_settings

log = logging.getLogger(__name__)

# Tried in this order when no file name is configured. Quantized first: smaller
# and faster on the free plan's CPU.
MODEL_FILE_NAMES = (
    "model_quantized.onnx",
    "model_int8.onnx",
    "model_uint8.onnx",
    "model.onnx",
)

# Output label names that mean "made with AI", lower-cased.
AI_LABELS = frozenset(
    {"ai", "artificial", "fake", "generated", "ai_generated", "ai-generated", "synthetic", "ai image"}
)

Band = Literal["high", "middle", "low"]


class ClassifierError(Exception):
    """The model folder is missing, incomplete or doesn't look like an image classifier."""


@dataclass(frozen=True)
class Preprocessing:
    """How the model expects pictures, read from preprocessor_config.json."""

    height: int  # size of the picture the model takes
    width: int
    resize: tuple[int, int] | None  # (height, width) to resize to first, or None
    shortest_edge: int | None  # or: resize the short side to this
    resample: int
    rescale: float | None
    mean: tuple[float, float, float] | None
    std: tuple[float, float, float] | None

    @classmethod
    def from_config(cls, config: dict) -> "Preprocessing":
        size = config.get("size", 224)
        resize: tuple[int, int] | None = None
        shortest_edge = None
        if isinstance(size, int):
            resize = (size, size)
        elif "height" in size and "width" in size:
            resize = (int(size["height"]), int(size["width"]))
        elif "shortest_edge" in size:
            shortest_edge = int(size["shortest_edge"])
        else:
            raise ClassifierError(f"Unsupported 'size' in preprocessor_config.json: {size!r}")

        if config.get("do_center_crop"):
            crop_size = config.get("crop_size", size)
            if isinstance(crop_size, int):
                height = width = crop_size
            else:
                height, width = int(crop_size["height"]), int(crop_size["width"])
        elif resize is not None:
            height, width = resize
        else:
            height = width = shortest_edge  # type: ignore[assignment]

        if not config.get("do_resize", True):
            resize = shortest_edge = None

        def triple(key: str) -> tuple[float, float, float] | None:
            value = config.get(key)
            if value is None:
                return None
            if isinstance(value, (int, float)):
                return (float(value),) * 3
            return tuple(float(v) for v in value)  # type: ignore[return-value]

        normalize = config.get("do_normalize", True)
        return cls(
            height=height,
            width=width,
            resize=resize,
            shortest_edge=shortest_edge,
            resample=int(config.get("resample", Image.Resampling.BILINEAR)),
            rescale=float(config.get("rescale_factor", 1 / 255)) if config.get("do_rescale", True) else None,
            mean=triple("image_mean") if normalize else None,
            std=triple("image_std") if normalize else None,
        )

    def prepare(self, image: Image.Image) -> np.ndarray:
        """Turn a picture into the model's input: float32, shape (1, 3, H, W)."""
        image = _to_rgb(image)
        if self.shortest_edge is not None:
            scale = self.shortest_edge / min(image.size)
            image = image.resize(
                (max(1, round(image.width * scale)), max(1, round(image.height * scale))), self.resample
            )
        elif self.resize is not None:
            image = image.resize((self.resize[1], self.resize[0]), self.resample)
        if image.size != (self.width, self.height):
            # Centre crop (and scale, if needed) to the model's input size.
            image = ImageOps.fit(image, (self.width, self.height), self.resample)

        pixels = np.asarray(image, dtype=np.float32)
        if self.rescale is not None:
            pixels = pixels * self.rescale
        if self.mean is not None and self.std is not None:
            pixels = (pixels - np.asarray(self.mean, dtype=np.float32)) / np.asarray(self.std, dtype=np.float32)
        return np.ascontiguousarray(pixels.transpose(2, 0, 1)[np.newaxis])


def _to_rgb(image: Image.Image) -> Image.Image:
    """Apply the camera's rotation and flatten see-through parts onto white."""
    image = ImageOps.exif_transpose(image)
    if image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info):
        rgba = image.convert("RGBA")
        background = Image.new("RGB", rgba.size, (255, 255, 255))
        background.paste(rgba, mask=rgba.getchannel("A"))
        return background
    return image.convert("RGB")


def find_model_file(model_dir: Path, file_name: str | None = None) -> Path:
    folders = (model_dir, model_dir / "onnx")
    names = (file_name,) if file_name else MODEL_FILE_NAMES
    for name in names:
        for folder in folders:
            if (folder / name).is_file():
                return folder / name
    raise ClassifierError(f"No ONNX model ({', '.join(names)}) found in {model_dir}")


def find_ai_index(config: dict, ai_label: str | None = None) -> int:
    """Return which model output means "made with AI"."""
    id2label = {int(k): str(v) for k, v in (config.get("id2label") or {}).items()}
    if not id2label:
        raise ClassifierError("config.json has no id2label, so we can't tell which output means AI")
    wanted = {ai_label.lower()} if ai_label else AI_LABELS
    matches = [i for i, name in id2label.items() if name.lower() in wanted]
    if len(matches) != 1:
        raise ClassifierError(
            f"Can't tell which label means AI in {id2label}. Set APP_CLASSIFIER_AI_LABEL."
        )
    return matches[0]


class ImageClassifier:
    """A loaded model. Load once and reuse: loading takes seconds."""

    def __init__(
        self,
        model_dir: Path | str,
        *,
        model_file: str | None = None,
        ai_label: str | None = None,
        threads: int = 1,
        low_memory: bool = True,
    ) -> None:
        import onnxruntime as ort  # imported here so the API starts without it when no model is set

        model_dir = Path(model_dir)
        try:
            config = json.loads((model_dir / "config.json").read_text(encoding="utf-8"))
            preprocessor = json.loads((model_dir / "preprocessor_config.json").read_text(encoding="utf-8"))
        except FileNotFoundError as exc:
            raise ClassifierError(f"{exc.filename} is missing") from exc

        self.path = find_model_file(model_dir, model_file)
        self.preprocessing = Preprocessing.from_config(preprocessor)
        self.ai_index = find_ai_index(config, ai_label)
        self.labels = {int(k): str(v) for k, v in config["id2label"].items()}

        options = ort.SessionOptions()
        options.intra_op_num_threads = threads
        options.inter_op_num_threads = 1
        options.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
        if low_memory:
            # Measured with the SwinV2 model: about 1.4 GB peak with graph
            # optimisations and memory pools, 382 MB without, scores within
            # 0.01. The free plan has 512 MB for everything.
            options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_DISABLE_ALL
            options.enable_cpu_mem_arena = False
            options.enable_mem_pattern = False
        else:
            options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
        self._session = ort.InferenceSession(str(self.path), options, providers=["CPUExecutionProvider"])
        self._input = self._session.get_inputs()[0].name
        # One check at a time: on 0.1 CPU running two together only makes both
        # slower and doubles the memory used.
        self._lock = threading.Lock()

    def ai_score(self, image: Image.Image) -> float:
        """Return the model's chance (0 to 1) that the picture was made with AI."""
        pixels = self.preprocessing.prepare(image)
        with self._lock:
            (logits,) = self._session.run(None, {self._input: pixels})[:1]
        logits = np.asarray(logits, dtype=np.float64).reshape(-1)
        if logits.size == 1:  # a single output: the chance of the positive label
            p = 1 / (1 + math.exp(-float(logits[0])))
            return p if self.ai_index == 1 else 1 - p
        exp = np.exp(logits - logits.max())
        return float(exp[self.ai_index] / exp.sum())

    def score_bytes(self, data: bytes) -> float:
        with Image.open(io.BytesIO(data)) as image:
            # For JPEGs, decode at a reduced size straight away: much faster
            # and lighter than decoding a 12-megapixel photo in full.
            target = max(self.preprocessing.height, self.preprocessing.width) * 2
            image.draft("RGB", (target, target))
            return self.ai_score(image)


@dataclass(frozen=True)
class Estimate:
    score: float
    band: Band


def band_for(score: float, low: float, high: float) -> Band:
    if score >= high:
        return "high"
    if score < low:
        return "low"
    return "middle"


def estimate(classifier: ImageClassifier, data: bytes) -> Estimate | None:
    """Score a picture, or return None if the model fails, so the check still
    answers from the picture's own data."""
    settings = get_settings()
    try:
        score = classifier.score_bytes(data)
    except Exception:  # noqa: BLE001 - a model failure must not break the check
        log.exception("The AI-image classifier failed on a picture")
        return None
    return Estimate(score, band_for(score, settings.classifier_low_threshold, settings.classifier_high_threshold))


@lru_cache
def get_classifier() -> ImageClassifier | None:
    """The shared classifier, or None when no model is configured."""
    settings = get_settings()
    if not settings.classifier_model_dir:
        return None
    classifier = ImageClassifier(
        settings.classifier_model_dir,
        model_file=settings.classifier_model_file,
        ai_label=settings.classifier_ai_label,
        threads=settings.classifier_threads,
        low_memory=settings.classifier_low_memory,
    )
    log.info("Loaded AI-image classifier %s", classifier.path)
    return classifier
