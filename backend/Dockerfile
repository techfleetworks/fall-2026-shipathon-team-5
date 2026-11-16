# Backend API image. Build from the backend folder:
#   docker build -t team5-backend .
#   docker run --rm -p 8000:8000 team5-backend
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install dependencies first so they're cached between code changes.
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app ./app

# Run as a normal user, not root.
RUN useradd --create-home --uid 10001 appuser
USER appuser

# Hosts like Render set PORT. FORWARDED_ALLOW_IPS tells uvicorn which proxy to
# trust for the visitor's real IP address, which the rate limit relies on.
# "*" is only safe when the container can't be reached except through the
# host's proxy, as on Render. Locally it has no effect.
ENV PORT=8000 \
    FORWARDED_ALLOW_IPS="*"
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
    CMD python -c "import os, urllib.request; urllib.request.urlopen(f'http://127.0.0.1:{os.environ[\"PORT\"]}/api/health')"

CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port \"$PORT\" --proxy-headers --forwarded-allow-ips \"$FORWARDED_ALLOW_IPS\""]
