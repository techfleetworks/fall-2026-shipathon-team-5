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
| `SoldadoXara/ai-image-detector-deploy-ONNX` (SwinV2, uint8, Apache-2.0) | 199 MB | 382 MB in low-memory mode (1.4 GB default) | 0.93 / 0.92 |

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
* ONNX Runtime runs in low-memory mode (no graph optimisations, no memory
  pools), one check at a time.
* `tests/test_image_detector_baseline.py` fails if the threshold would raise
  false alarms above the measured numbers.

### Consequences

* Good, because about half to two thirds of AI pictures shared without
  credentials now get a clear answer instead of "We can't tell".
* Good, because about 1 in 50 real photos or fewer is wrongly flagged on the
  test set, and the wording always calls it an estimate.
* Bad, because a check takes about **15 s** on 0.1 CPU (1.4 s on one laptop
  core). The site and extension already say it can take up to a minute.
* Bad, because memory is tight: 382 MB for the model plus the rest of the
  backend is close to 512 MB. The Docker smoke test must check it.
* Bad, because the threshold was chosen with optimisations on; low-memory
  mode moves scores by up to 0.01, and one real tuning photo scores 0.976.
  Re-check the false alarms in low-memory mode before turning it on.

### Confirmation

Before turning the classifier on in production: re-score the test set in
low-memory mode with the backend's own preprocessing, confirm the Docker
image stays under 450 MB, and run the guard tests.

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
