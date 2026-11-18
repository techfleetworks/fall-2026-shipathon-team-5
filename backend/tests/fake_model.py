"""A tiny fake AI-image classifier for tests, built with the onnx package.

It scores a picture by its average brightness: white pictures look "AI",
black ones look "real", and mid-grey ones are in between. That makes the
classifier's plumbing easy to test without downloading a real model.
"""

import json
from pathlib import Path

import numpy as np
import onnx
from onnx import TensorProto, helper, numpy_helper

PREPROCESSOR = {
    "do_resize": True,
    "size": {"height": 32, "width": 32},
    "resample": 2,
    "do_rescale": True,
    "rescale_factor": 1 / 255,
    "do_normalize": True,
    "image_mean": [0.5, 0.5, 0.5],
    "image_std": [0.5, 0.5, 0.5],
}


def write_fake_model(
    folder: Path,
    *,
    id2label: dict[str, str] | None = None,
    file_name: str = "model_quantized.onnx",
    in_onnx_folder: bool = True,
) -> Path:
    """Write the model, config.json and preprocessor_config.json; return the folder.

    Output: logits [[0, 10 * mean]] where mean is the normalised brightness
    (-1 for black, 1 for white), so the second label's chance follows the
    brightness.
    """
    folder.mkdir(parents=True, exist_ok=True)
    nodes = [
        helper.make_node("ReduceMean", ["pixel_values"], ["mean"], keepdims=0),
        helper.make_node("Mul", ["mean", "ten"], ["scaled"]),
        helper.make_node("Reshape", ["scaled", "shape"], ["column"]),
        helper.make_node("Concat", ["zeros", "column"], ["logits"], axis=1),
    ]
    graph = helper.make_graph(
        nodes,
        "fake-ai-image-classifier",
        [helper.make_tensor_value_info("pixel_values", TensorProto.FLOAT, [1, 3, 32, 32])],
        [helper.make_tensor_value_info("logits", TensorProto.FLOAT, [1, 2])],
        initializer=[
            numpy_helper.from_array(np.array(10, dtype=np.float32), "ten"),
            numpy_helper.from_array(np.array([1, 1], dtype=np.int64), "shape"),
            numpy_helper.from_array(np.zeros((1, 1), dtype=np.float32), "zeros"),
        ],
    )
    model = helper.make_model(graph, opset_imports=[helper.make_opsetid("", 17)])
    model.ir_version = 9  # readable by older ONNX Runtime releases too
    onnx.checker.check_model(model)

    model_folder = folder / "onnx" if in_onnx_folder else folder
    model_folder.mkdir(exist_ok=True)
    onnx.save(model, model_folder / file_name)
    (folder / "config.json").write_text(
        json.dumps({"id2label": id2label or {"0": "real", "1": "artificial"}}), encoding="utf-8"
    )
    (folder / "preprocessor_config.json").write_text(json.dumps(PREPROCESSOR), encoding="utf-8")
    return folder
