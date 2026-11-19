# Backend API image. Build from the backend folder:
#   docker build -t team5-backend .
#   docker run --rm -p 8000:8000 team5-backend
# Stage 1: download the AI-image classifier (SwinV2, ADR 0006), check it
# against pinned hashes, and store its weights in a separate file so they can
# be mapped from disk (see docker/fetch_model.py). Nothing is downloaded at
# run time. To change the model, re-measure it first
# (evaluation/image_detectors/).
FROM python:3.12-slim AS model
ENV PIP_NO_CACHE_DIR=1 PIP_DISABLE_PIP_VERSION_CHECK=1
RUN pip install "onnx==1.23.2"
ARG MODEL_REPO=SoldadoXara/ai-image-detector-deploy-ONNX
ARG MODEL_REVISION=0df8696b5db0ab5bd72baeab571fec55d65128e7
ARG MODEL_FILE=onnx/model_uint8.onnx
ARG MODEL_SHA256=d82dad26ccecdd63d425188ccbbd5be4767b719ab801d549b9683e0123290937
COPY docker/fetch_model.py /fetch_model.py
RUN python /fetch_model.py "$MODEL_REPO" "$MODEL_REVISION" "$MODEL_FILE" "$MODEL_SHA256" /model

# Stage 2: the API.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install dependencies first so they're cached between code changes.
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY --from=model /model /app/models/swinv2
ENV APP_CLASSIFIER_MODEL_DIR=/app/models/swinv2 \
    APP_CLASSIFIER_MODEL_FILE=model_uint8.onnx

COPY app ./app

# Run as a normal user, not root.
RUN useradd --create-home --uid 10001 appuser
USER appuser

# Hosts like Render set PORT. Forwarded-address headers are deliberately not
# trusted (visitors can fake them); see app/rate_limit.py.
ENV PORT=8000
EXPOSE 8000

# Loading the classifier takes a while on a slow CPU, hence the long start period.
HEALTHCHECK --interval=30s --timeout=3s --start-period=120s \
    CMD python -c "import os, urllib.request; urllib.request.urlopen(f'http://127.0.0.1:{os.environ[\"PORT\"]}/api/health')"

CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port \"$PORT\" --no-proxy-headers"]
