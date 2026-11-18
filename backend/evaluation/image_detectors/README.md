# AI-image detector evaluation

How three small, open-source detectors do on 500 labeled pictures, to choose
one that fits Render's free plan (512 MB memory, 0.1 CPU). Run on 2026-11-18.
See `docs/plans/image-classifier.md`.

## Test set

500 pictures from `ComplexDataLab/OpenFakeTiny` (test splits), listed in
`manifest.json`. The pictures themselves aren't committed; `extract.py` rebuilds
them from the dataset's parquet files.

| Group | Real | AI | What it is |
|---|---|---|---|
| `core` | 100 | 100 | AI pictures from 16 modern generators (Midjourney 7, GPT Image 1.5, Flux 2, Veo 3 frames, ...) |
| `reddit-images` | 108 | 108 | Pictures as they were shared on Reddit |
| `reddit-video` | 42 | 42 | Frames from videos shared on Reddit |

Every picture is scored twice: as is, and as a "social media" copy (longest
side 1080 px, JPEG quality 75). A fixed 60/40 split by file name separates the
part used to choose thresholds (tuning) from the part used to report results
(holdout).

## Results

AUC: how well a model separates real from AI. 0.5 is a coin flip, 1.0 is perfect.

| Model | Size (quantized) | Peak memory | AUC, all pictures (original / social) |
|---|---|---|---|
| `onnx-community/ai-image-detect-distilled-ONNX` (int8) | 15 MB | 98 MB | 0.64 / 0.64 |
| `onnx-community/ai-image-detection-ONNX` (int8, CIFAKE) | 87 MB | 230 MB | 0.55 / 0.56 |
| `SoldadoXara/ai-image-detector-deploy-ONNX` (SwinV2, uint8) | 199 MB | 1,359 MB default; **382 MB** with graph optimisation and memory arena off | **0.93 / 0.92** |

The two small models are close to guessing on modern AI pictures. Only SwinV2
is useful.

**SwinV2 on the holdout pictures,** with "likely AI" only above a threshold
chosen on the tuning part:

| Threshold chosen for | Threshold | AI caught (original / social) | Real photos wrongly flagged (original / social) |
|---|---|---|---|
| at most 5% false alarms | 0.50 | 75% / 68% | 5% / 2% |
| **at most 2% false alarms** | **0.985** | **66% / 54%** | **2% / 0%** |
| at most 1% false alarms | 0.9988 | 43% / 36% | 0% / 0% |

By group, at the 2% threshold (original / social):

| Group | AI caught | Real photos flagged |
|---|---|---|
| `core` | 73% / 54% | 0% / 0% |
| `reddit-images` | 76% / 66% | 2% / 0% |
| `reddit-video` | 8% / 8% | 5% / 0% |

Full output: `results/summary-2pct.txt` and `results/summary-5pct.txt`.
Scores for every picture: `results/scores-*.csv`.

## Speed

With SwinV2 in low-memory mode on one thread of an Intel i7-7500U, a picture
takes about **1.4 s** (`speed.py`). Render's free plan gives 0.1 CPU, so expect
roughly **15 s per check** there. Low-memory mode changes scores by at most
0.01 compared with the optimised mode used for scoring above, so re-check the
threshold in low-memory mode before shipping.

## Limitations (read before relying on these numbers)

* **Small holdout.** 100 AI and 112 real pictures, so each real photo is
  about 1 point of false-alarm rate. Treat differences of a few points as noise.
* **Possible overlap.** The SwinV2 model card doesn't say what it was trained
  on. If OpenFake pictures were in its training data, these results are too
  optimistic. Real-world accuracy is likely lower.
* **Video frames are weak** (AUC 0.81, about 8% caught at the 2% threshold),
  so video checks should stay off.
* **New AI tools appear constantly.** Re-run this every few months, with fresh
  pictures.

## Re-running

```bash
pip install onnxruntime pillow numpy pyarrow
python extract.py <core-test.parquet> <reddit-test.parquet> testset
python evaluate.py testset <models-dir> results <model-name> 150   # repeat until complete
python analyze.py results 0.02
```
