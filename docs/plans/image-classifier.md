# Plan: AI-image classifier on the free Render plan

Status: in progress. Written 2026-11-18. Branch: `backend/image-classifier`.

## Progress

Last updated 2026-11-18.

* **Done, without the models (Hugging Face was blocked where this was built):**
  * Step 1 tools: `evaluation/download_candidate_models.py` (pins each model's
    revision and SHA-256s in `models/<name>/SOURCE.json`) and
    `evaluation/image_testset.py` (`sample` builds the manifest, `download`
    fetches and checks the pictures, `social` makes the social media versions).
  * Step 2 tool: `evaluation/benchmark_image_classifiers.py` (catches, false
    alarms, thresholds for 1/2/5% false alarms, memory, speed; one process per
    model). How to run it at 0.1 CPU / 512 MB is in `evaluation/README.md`.
  * Step 4: `app/services/classifier.py` and its use in `image_check.py`. Off
    unless `APP_CLASSIFIER_MODEL_DIR` is set. Thresholds are placeholders
    (0.9 / 0.5).
  * Step 6, first part: unit tests and Gherkin scenarios with a tiny fake ONNX
    model (`tests/fake_model.py`, `tests/test_classifier.py`,
    `tests/test_image_evaluation.py`).
* **Next:** on a machine that can reach Hugging Face, run the commands in
  `evaluation/README.md` (check OpenFakeTiny's license and column names
  first), commit `evaluation/image_testset.csv` and the numbers, then do
  steps 3, 5, the rest of 6, and 7.

## Why

`/api/check-image` only reads Content Credentials and IPTC "made with AI" labels.
X, Facebook and YouTube strip those on upload, so for almost every social media
picture the answer is "We can't tell", even for obvious AI pictures. A
classifier that looks at the pixels is needed. See ADR 0005.

## Constraints

* **Render free plan:** 512 MB memory (the backend already uses about 150 MB) and 0.1 CPU.
  So: a small model, quantized (int8/uint8), run with ONNX Runtime (`onnxruntime`
  installs from PyPI). No PyTorch in the image.
* **Speed:** expect roughly 3–10 s per check on 0.1 CPU. The site and extension
  already tell people it can take up to a minute.
* **Older users:** a real photo called "AI" does real harm. Tune for few false
  alarms and answer "We can't tell" when the model isn't confident.
* **Honesty:** research finds detectors lose a lot of accuracy on real social
  media pictures and new generators (AIGIBench, arXiv 2505.12335). Results stay
  worded as estimates, next to the existing clues.

## Candidates (all on Hugging Face, checked 2026-11-18)

| Model | Architecture | Quantized ONNX size | License | Notes |
|---|---|---|---|---|
| `onnx-community/ai-image-detect-distilled-ONNX` (from `jacoballessio/ai-image-detect-distilled`) | ViT (distilled) | 15 MB (int8) | MIT | Tiny and fast; check accuracy on modern generators |
| `SoldadoXara/ai-image-detector-deploy-ONNX` (from `haywoodsloan/ai-image-detector-deploy`) | SwinV2 | 199 MB (uint8) | Apache-2.0 | Upstream updated Aug 2026; may be tight on memory, so measure it |
| `onnx-community/ai-image-detection-ONNX` (from `capcheck/ai-image-detection`) | ViT | 87 MB (int8) | Apache-2.0 | Trained on CIFAKE (small, older Stable Diffusion images); likely weak on modern pictures. A baseline |

Excluded: non-commercial licenses (SMOGY, cc-by-nc), models over about 400 MB
(SigLIP 372 MB unquantized, SigLIP+DINOv2 2.1 GB, CLIP ViT-L/14 based UnivFD).

## Test set

* **Source:** `ComplexDataLab/OpenFakeTiny` on Hugging Face (a few thousand
  images, modern generators; the full OpenFake is CC BY-NC 4.0, so check
  OpenFakeTiny's terms). Plus real photos from a permissively licensed set.
* **Size:** about 300 pictures: 150 real, 150 AI from several generators.
* **Social media versions:** also test each picture after the kind of
  processing social sites do (resize to 1080 px wide, JPEG quality 70–85), since
  that's what users will check.
* **Keep a held-out part** that nobody tunes on, like the scam checker.
* **Don't commit the pictures** (licenses and repo size). Commit a manifest
  (dataset, file id, label, generator) and a script that downloads them.

## Steps

1. Download the three candidates and the test set (needs `huggingface.co`,
   `cdn-lfs.huggingface.co` and `cas-bridge.xethub.hf.co` allowed).
2. Measure for each, on original and "social media" versions:
   * AI pictures caught
   * real photos wrongly called AI
   * peak memory
   * seconds per picture with the CPU limited to 0.1 core
3. Pick the best one that fits in memory. Choose two thresholds on the tuning
   part so that real photos are rarely called AI:
   * above the high threshold → "likely_ai"
   * below the low threshold → stays "uncertain" (never "likely_real" from the
     model alone, since the model can't prove a photo is real)
   * in between → "uncertain"
4. ✅ Add `backend/app/services/classifier.py` (ONNX Runtime, load once, run in the
   thread pool). Combine with Content Credentials: a signed record beats the model.
5. Ship the model file in the Docker image: download it at build time and check
   it against a pinned SHA-256. Don't download it at run time.
6. Tests:
   * unit tests with a tiny fake model
   * a guard test on the test set's numbers, like `tests/test_scam_evaluation.py`
   * the Docker smoke test checks memory stays under 450 MB
7. Write ADR 0006 with the measured numbers, and update `backend/README.md`.
8. Then turn video checks back on in the extension (`VIDEO_CHECKS` in
   `extension/entrypoints/social.content.ts`) and add `/api/check-frames`.
