# Backend: AI Image & Scam Checker API

Python + FastAPI. Why we chose it: [ADR 0001](../docs/adr/0001-use-python-fastapi-for-the-backend.md).

## Run it locally (Windows)

Needs Python 3.10 or newer.

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements-dev.txt
copy .env.example .env
uvicorn app.main:app --reload
```

Open http://localhost:8000/docs to see and try every endpoint.

On macOS/Linux, use `source .venv/bin/activate` and `cp` instead.

## Run the tests

```powershell
python -m pytest
```

This runs the unit tests in `tests/` and the Gherkin scenarios in `features/`.

## Endpoints (the contract with the front end)

The exact shapes live in `app/schemas.py` and at `/docs`. Agree on changes with
the front end before making them.

| Method | Path | Sends | Returns | Status |
|---|---|---|---|---|
| GET | `/api/health` | nothing | `{"status": "ok"}` | Works |
| POST | `/api/check-image` | form upload, field `file` (JPG/PNG/WEBP, max 10 MB) | `ai_likelihood`, `verdict`, `content_credentials`, `signals`, `message` | **Placeholder results** (`is_example: true`); upload checks are real |
| POST | `/api/check-text` | JSON `{"text": "..."}` (20–10,000 characters) | `risk`, `red_flags` (with `start`/`end` positions to highlight), `message` | Works, rule-based (English, tuned for US and UK scams) |
| GET | `/api/quiz` | nothing | list of quiz pictures with answers and explanations | **Placeholder data** |

Errors return `{"detail": "<plain-language message for the visitor>"}` with
status 413 (picture too large), 415 (not a picture), 422 (message too short
or too long) or 429 (too many checks; wait a minute).

## Rate limiting

Each visitor (by IP address) can run 10 checks per minute across
`/api/check-image` and `/api/check-text`, set with `APP_RATE_LIMIT`. Counts are
kept in memory. When deploying behind a hosting proxy, start uvicorn with
`--proxy-headers --forwarded-allow-ips="<proxy address>"`, or every visitor
will share one limit. Why and trade-offs: [ADR 0002](../docs/adr/0002-in-memory-rate-limiting.md).

## Automatic checks on GitHub

Every pull request that touches `backend/` runs the tests on Python 3.10 and
3.12 and a `pip-audit` scan for known security vulnerabilities
(`.github/workflows/backend-tests.yml`). Dependabot opens weekly pull requests
to update dependencies (`.github/dependabot.yml`).

## Privacy

Pictures and messages are checked in memory and never saved by the app, and
their content is never logged. Uploads over 1 MB are briefly buffered by the
framework in a temporary file that's deleted when the request ends.

## Next steps

1. Read C2PA content credentials from uploaded pictures.
2. Add a pretrained AI-image classifier (weights go in `models/`, which git ignores).
3. Add an ML scam-message classifier on top of the rules.
4. Install the team's standards checks from the enterprise-software-AI-skills repo (`.claude/skills/bootstrap`).
