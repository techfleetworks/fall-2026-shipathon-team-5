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
| POST | `/api/check-text` | JSON `{"text": "..."}` (20–10,000 characters) | `risk`, `red_flags` (with `start`/`end` positions to highlight), `message` | Works, weighted rules (English, US and UK scams). Measured in `evaluation/` |
| GET | `/api/quiz` | nothing | list of quiz pictures with answers and explanations | **Placeholder data** |

Errors return `{"detail": "<plain-language message for the visitor>"}` with
status 413 (picture too large), 415 (not a picture), 422 (message too short
or too long) or 429 (too many checks; wait a minute).

## Scam warning types

Each item in `red_flags` has a `type` the front end can use for an icon or
label: `urgency`, `payment`, `link`, `secrecy`, `credentials`, `prize`,
`new_contact`, `unrealistic_offer`, `remote_access`. A low-risk result can
still include flags, which are things worth a second look rather than warnings.
How the risk level is worked out: [ADR 0003](../docs/adr/0003-weighted-scam-warning-signs.md).

## Run it with Docker (optional)

```powershell
cd backend
docker build -t team5-backend .
docker run --rm -p 8000:8000 team5-backend
```

Then open http://localhost:8000/docs. A GitHub workflow
(`.github/workflows/backend-docker.yml`) builds the image and checks it answers
on every pull request.

## Deploy to Render

`render.yaml` in the repo root describes the service.

1. Sign in to [Render](https://render.com) with GitHub and give it access to
   this repository. You may need someone with admin rights on `techfleetworks`
   to approve that.
2. Choose **New → Blueprint**, pick this repository, and confirm.
3. When asked, set:
   * `APP_ALLOWED_ORIGINS`: the front end's address as a JSON list, for example
     `["https://your-site.vercel.app"]`
   * `APP_ALLOWED_ORIGIN_REGEX`: optional, to also allow Vercel preview links,
     for example `https://your-project-.*\.vercel\.app`. Leave blank otherwise.
4. Render builds the Docker image and gives you an address like
   `https://team5-backend.onrender.com`. Check `/api/health` returns `{"status":"ok"}`.

It deploys from `develop` automatically once GitHub's checks pass. Change
`branch` in `render.yaml` to `main` for launch.

**Free plan:** the service goes to sleep when unused, so the first check after a
quiet spell can take up to a minute. The front end should show a friendly
"checking…" message rather than appearing broken.

## Connecting the front end

The front end needs the backend address in an environment variable, for
example `NEXT_PUBLIC_API_URL`:

* Locally, in `frontend/.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:8000`
* On Vercel: Project → Settings → Environment Variables, set to the Render address

Example call:

```ts
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/check-text`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text }),
});
const data = await res.json();
// res.ok -> data.risk, data.red_flags (with start/end to highlight), data.message
// otherwise -> data.detail is a plain-language message to show the visitor
```

## Rate limiting

Each visitor (by IP address) can run 10 checks per minute across
`/api/check-image` and `/api/check-text`, set with `APP_RATE_LIMIT`. Counts are
kept in memory. Behind a hosting proxy, uvicorn must trust the proxy's
forwarded address or every visitor shares one limit; the Dockerfile does this
with `--proxy-headers` and `FORWARDED_ALLOW_IPS`. Why and trade-offs: [ADR 0002](../docs/adr/0002-in-memory-rate-limiting.md).

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
