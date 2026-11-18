import json, sys, time, resource
from pathlib import Path
import numpy as np, onnxruntime as ort
from PIL import Image
sys.path.insert(0, str(Path(__file__).parent))
from evaluate import MODELS, preprocess, p_ai
cfg = MODELS["swinv2-uint8"]
def session(level):
    o = ort.SessionOptions(); o.intra_op_num_threads = 1; o.inter_op_num_threads = 1
    o.enable_cpu_mem_arena = False; o.enable_mem_pattern = False
    o.graph_optimization_level = level
    return ort.InferenceSession(sys.argv[1], o, providers=["CPUExecutionProvider"])
low = session(ort.GraphOptimizationLevel.ORT_DISABLE_ALL)
files = sorted(Path("testset").glob("*/*/*.*"))[:: 50][:8]
times, diffs = [], []
full = session(ort.GraphOptimizationLevel.ORT_ENABLE_ALL) if len(sys.argv) > 2 else None
for f in files:
    x = preprocess(Image.open(f).convert("RGB"), cfg)
    t = time.perf_counter(); a = p_ai(low, low.get_inputs()[0].name, x, 0); times.append(time.perf_counter() - t)
    if full: diffs.append(abs(a - p_ai(full, full.get_inputs()[0].name, x, 0)))
print("low-memory mode, 1 thread: median", round(1000 * float(np.median(times))), "ms per picture")
if diffs: print("max score difference vs. optimised mode:", f"{max(diffs):.6f}")
