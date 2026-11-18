---
status: proposed
date: 2026-11-18
decision-makers: Team 5 backend developer
---

# Add a SwinV2 AI-image classifier, tuned for few false alarms

## Context and Problem Statement

`/api/check-image` reads Content Credentials and AI labels (ADR 0005), but X,
Facebook and YouTube strip them, so almost every social media picture gets
"We can't tell". Which classifier can look at the pixels within Render's free
plan (512 MB, 0.1 CPU), and how do we use it without misleading older adults?

## Decision Drivers

* A real photo called "AI" does real harm: keep false alarms very low.
* Never call a picture real on the model's word alone.
* Fit in 512 MB together with the rest of the backend.
* Open license that allows our use.

## Considered Options

Measured on 500 OpenFakeTiny test pictures (250 real, 250 AI from 16 recent
generators, Reddit pictures and Reddit video frames), each as is and as a
social media copy. Full method and numbers: `backend/evaluation/image_detectors/`.

| Model | Size | Peak memory | AUC (original / social) |
|---|---|---|---|
| `onnx-community/ai-image-detect-distilled-ONNX` (ViT, int8, MIT) | 15 MB | 98 MB | 0.64 / 0.64 |
| `onnx-community/ai-image-detection-ONNX` (ViT, CIFAKE, int8, Apache-2.0) | 87 MB | 230 MB | 0.55 / 0.56 |
| `SoldadoXara/ai-image-detector-deploy-ONNX` (SwinV2, uint8, Apache-2.0) | 199 MB | about 1.4 GB default; see below for the API | 0.93 / 0.92 |

## Decision Outcome

Chosen option: **SwinV2**, the only one clearly better than guessing on modern
AI pictures.

* "likely_ai" only at a score of **0.985** or more, chosen on the tuning part
  for at most 2% false alarms. On the holdout part it catches **66%** of AI
  pictures as is and **54%** as social media copies, and calls **2% / 0%** of
  real photos AI.
* Below that the verdict stays "uncertain". Below **0.5** the clue says no
  clear signs of AI were found, adding that this doesn't prove the picture is
  real. The model never makes a picture "likely_real".
* Content Credentials and AI labels that settle the question win, and then
  the model doesn't run.
* ONNX Runtime runs in low-memory mode, one check at a time: no graph
  optimisations, memory pools or weight pre-packing, and the Docker build
  moves the weights into a separate `.onnx_data` file so they're mapped from
  disk instead of copied. Measured in the whole API (ONNX Runtime 1.32): about
  **225 MB** of its own memory at peak, plus about 240 MB of mapped weights
  the system can drop and re-read; 465 MB in total. Without these steps it
  used about 563 MB and only survived Docker's 512 MB limit by swapping.
* Pictures are decoded at full resolution. Decoding JPEGs at reduced size
  (a speed-up tried first) changed some scores by up to 0.75; it's now only
  used for pictures over about 4,096 px on both sides, to protect memory.
* `tests/test_image_detector_baseline.py` fails if the threshold would raise
  false alarms above the measured numbers.

### Consequences

* Good, because about half to two thirds of AI pictures shared without
  credentials now get a clear answer instead of "We can't tell".
* Good, because about 1 in 50 real photos or fewer is wrongly flagged on the
  test set, and the wording always calls it an estimate.
* Bad, because a check takes about **15 s** on 0.1 CPU (1.4 s on one laptop
  core). The site and extension already say it can take up to a minute.
* Bad, because memory is still fairly tight on 512 MB. The Docker smoke test
  checks it on every pull request.
* Bad, because in its middle range the model is very sensitive: changing
  pixel values by a millionth moved one picture's score between 0.51 and
  0.77. Scores near 0.985 are much steadier (see Confirmation), which is
  why only very high scores count.

### Confirmation

Done on 2026-11-18 with 300 more OpenFakeTiny core test pictures (150 AI,
150 real; 87 also in the first set), each as is and as a social media copy:
the API's own code in low-memory mode against the evaluation's code in
optimised mode.

* Same verdict for 599 of 600 scores. The one difference was an AI picture
  at 0.9848 instead of 0.985 (a missed catch, not a false alarm).
* Scores of 0.95 or more differed by at most 0.007.
* At 0.985 the API caught **103/150** AI pictures (69%) as is and **84/150**
  (56%) as social media copies, and called **1/150** and **0/150** real
  photos AI.

Still to confirm on Render itself: memory and speed under real traffic.

## More Information

* **Results will be worse in real life.** The SwinV2 model card doesn't say
  what it was trained on; if OpenFake pictures were included, these numbers
  are too optimistic. Detectors also lose accuracy on new generators
  (AIGIBench, arXiv 2505.12335).
* **Video frames are weak** (AUC 0.81, 8% caught at this threshold), so video
  checks stay off.
* **Small holdout:** 100 AI and 112 real pictures. Each real photo is about one
  point of false-alarm rate.
* OpenFakeTiny is CC BY-NC 4.0, so its pictures are not in the repo; only a
  manifest and scores are.
* Re-measure every few months with fresh pictures from new AI tools.
