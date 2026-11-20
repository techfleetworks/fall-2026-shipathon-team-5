# Backend: Veritas API

Python + FastAPI. Why we chose it: [ADR 0001](../docs/adr/0001-use-python-fastapi-for-the-backend.md).

## Run it locally (Windows)

Needs Python 3.11 or newer.

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
| POST | `/api/check-image` | form upload, field `file` (JPG/PNG/WEBP, max 10 MB) | `verdict`, `ai_likelihood` (or null), `content_credentials`, `signals`, `message` | Works: reads Content Credentials (C2PA), AI labels and camera details, and runs the SwinV2 AI-image detector |
| POST | `/api/check-text` | JSON `{"text": "..."}` (20–10,000 characters) | `risk`, `red_flags` (with `start`/`end` positions to highlight), `message` | Works, weighted rules (English, US and UK scams). Measured in `evaluation/` |
| GET | `/api/quiz` | nothing | list of quiz pictures with answers and explanations | **Placeholder data** |

Errors return `{"detail": "<plain-language message for the visitor>"}` with
status 413 (picture too large), 415 (not a picture), 422 (message too short
or too long) or 429 (too many checks; wait a minute).

## How the picture check works

The checker reads what the picture says about itself:

* **Content Credentials (C2PA):** a signed record of how the picture was made.
  `content_credentials.status` says whether the signer is on the official
  C2PA trust list (`trusted`), the older interim list (`trusted_legacy`), not
  recognised (`untrusted_signer`), or whether the record no longer matches the
  picture (`invalid`). `source` says what the record claims: `ai_generated`,
  `ai_modified`, `camera`, `computer_made` or `unknown`.
* **IPTC labels:** unsigned "made with AI" tags some tools add.

When a picture has neither, which is common because social media sites
remove them, the verdict is `uncertain` and `ai_likelihood` is `null`, unless
the AI-image classifier is turned on (below). The front end should then point people to reverse
image search and the checklists. A camera claim from an unrecognised signer is
never reported as real, because anyone can sign a picture.

The reader never contacts the internet while reading an upload. The trust
lists are kept in `app/trust/` (see the README there for updating them). Why:
[ADR 0005](../docs/adr/0005-read-content-credentials-for-picture-checks.md).

### AI-image classifier

`app/services/classifier.py` runs the SwinV2 AI-image detector with ONNX
Runtime when `APP_CLASSIFIER_MODEL_DIR` points at its folder (the ONNX file,
`config.json` and `preprocessor_config.json` from
`SoldadoXara/ai-image-detector-deploy-ONNX`). The Docker image includes it and
turns it on; when you run the API without Docker, it's off unless you set
that variable. Why this model and these thresholds:
[ADR 0006](../docs/adr/0006-swinv2-ai-image-classifier.md); measurements in
`evaluation/image_detectors/`.

* It only runs when the picture's own data doesn't settle the question; a
  signed record always wins.
* A score at or above `APP_CLASSIFIER_HIGH_THRESHOLD` (0.985) makes the
  verdict `likely_ai`, with the score as `ai_likelihood`. On the test set
  that catches about 54–66% of AI pictures and flags about 2% of real photos
  or fewer.
* It takes about 15–20 s per check on the free plan's 0.1 CPU, and the API
  uses about 225 MB of its own memory plus about 240 MB of model weights
  mapped from disk.
* Anything lower stays `uncertain` with `ai_likelihood` `null`, plus a clue
  saying whether the detector wasn't sure or found no clear signs of AI. The
  model never makes a picture `likely_real`.
* If the model fails on a picture, the check answers from the picture's own
  data as before.

### Camera details

When nothing else settles the question, the check also reads the EXIF camera
details phones and cameras add (device, date taken, exposure). They're shown
as a reassuring clue ("usually means a real photo, but these details can be
copied"), and the verdict stays `uncertain`. They aren't signed, so they never
make an answer "likely real". Likewise, when the detector finds no signs of AI
at all (score at or below `APP_CLASSIFIER_NO_SIGNS_THRESHOLD`), that's shown as
a stronger reassuring clue, and the verdict still stays `uncertain`. See
[ADR 0007](../docs/adr/0007-camera-details-as-a-clue.md).

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
docker run --rm -p 8000:8000 --memory=512m --cpus=0.1 team5-backend
```

The build downloads the AI-image classifier (about 200 MB) and checks it
against the pinned hash in the `Dockerfile`. `--memory` and `--cpus` give you
Render's free plan, so a picture check takes about 15 s; leave `--cpus` out to
go faster. Then open http://localhost:8000/docs. A GitHub workflow
(`.github/workflows/backend-docker.yml`) builds the image on every pull
request and checks it answers, that the classifier runs, and that memory
stays under 450 MB.

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

It deploys from `main` automatically once GitHub's checks pass, the same
branch the live Vercel site is built from. Work merged into `develop` goes live
when `develop` is merged into `main`.

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
kept in memory. Visitors are told apart by `APP_CLIENT_IP_HEADER` when it's
set (on Render: `True-Client-IP`, which Cloudflare sets and visitors can't
fake), otherwise by the connection's address. `X-Forwarded-For` is never
used, because visitors can add fake entries to it. Why and trade-offs: [ADR 0002](../docs/adr/0002-in-memory-rate-limiting.md).

## Automatic checks on GitHub

Every pull request that touches `backend/` runs the tests on Python 3.11, 3.12 and
3.14 and a `pip-audit` scan for known security vulnerabilities
(`.github/workflows/backend-tests.yml`). Dependabot opens weekly pull requests
to update dependencies (`.github/dependabot.yml`).

## Privacy

Pictures and messages are checked in memory and never saved by the app, and
their content is never logged. Uploads over 1 MB are briefly buffered by the
framework in a temporary file that's deleted when the request ends.

## Next steps

1. Read Content Credentials from video too, and judge video frames so the extension's video checks can be switched on.
2. Add an ML scam-message classifier on top of the rules.
3. Install the team's standards checks from the enterprise-software-AI-skills repo (`.claude/skills/bootstrap`).
