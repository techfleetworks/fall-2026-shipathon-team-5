# Veritas

**Learn to spot AI fakes before you share them.**

Veritas helps people tell whether the pictures, videos, and posts in their social media feeds were made or changed with AI. It has two parts that work together:

1. **An educational website** with plain-language checklists, social media platform guides, real AI hoaxes that went viral, a glossary, and a "Real or AI?" quiz.
2. **A browser extension** that checks a picture right where you see it (on X, Facebook, YouTube, or any site via right-click) and explains what it found.

Both talk to the same **backend API**, which reads a picture's Content Credentials (C2PA), among other clues, and returns a verdict.

Built by Team 5 for the Tech Fleet Fall 2026 Shipathon.

| | |
| Live website | https://fall-2026-shipathon-team-5.vercel.app |
| License | [MIT](LICENSE) |

---

## Contents

- [Why Veritas](#why-veritas)
- [Repository layout](#repository-layout)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Website (`frontend/`)](#website-frontend)
- [Browser extension (`extension/`)](#browser-extension-extension)
- [Backend API (`backend/`)](#backend-api-backend)
- [How the parts fit together](#how-the-parts-fit-together)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Why Veritas

AI-generated images, audio, and videos now spread quickly on social media, and the people most often targeted by AI-driven hoaxes and scams are often the least familiar with how these tools work. So, we built Veritas to give people the knowledge to spot AI content on their own, along with a tool to double-check when they're unsure.

Design principles that shape the code:

- **Never say "real" when we can't tell.** An "uncertain" result never looks like a safe result: no green, a **?** badge, and clear next steps.
- **Accessible by default.** Verdicts always use a word and an icon, never color alone; tap targets are at least 44 px; text meets 4.5:1 contrast; there is a skip link and full keyboard support.
- **Privacy first.** Only the picture a person chooses to check is sent to the server. Nothing else is collected.

---

## Repository layout

```
.
├── frontend/              # Educational website (Next.js)
├── extension/             # Browser extension (WXT + React), Chrome, and Firefox
├── backend/               # Veritas API (Python + FastAPI)
├── docs/
│   ├── adr/               # Architecture decision records
│   └── plans/             # Design notes for upcoming work
├── .github/workflows/     # CI for each part
├── render.yaml            # Render Blueprint for the backend
└── LICENSE
```

Each part has its own README with more detail: [`frontend/README.md`](frontend/README.md), [`extension/README.md`](extension/README.md), [`backend/README.md`](backend/README.md).

---

## Tech stack

| Area | Technology |
| --- | --- |
| Website | [Next.js](https://nextjs.org) 16 (App Router, Turbopack), React 19, TypeScript |
| Styling | [Tailwind CSS](https://tailwindcss.com) 4 with design tokens in `@theme` |
| Fonts | Archivo Narrow (headings), Public Sans (body) via `next/font/google` |
| Extension | [WXT](https://wxt.dev), React 19, TypeScript, Manifest V3 (Chrome, Edge, Brave, Arc, Firefox) |
| Backend | Python 3.11+, FastAPI, Uvicorn; [c2pa-python](https://github.com/contentauth/c2pa-python) (Content Credentials), Pillow (picture checks, camera details), ONNX Runtime + NumPy (SwinV2 AI-image detector), slowapi (rate limiting), pydantic-settings (configuration) |
| Hosting | Vercel (website), Render with Docker (backend) |
| CI | GitHub Actions: lint, type check, build and `npm audit` per part; backend tests |

---

## Quick start

You need **Node.js 22 or 24** and, for the backend, **Python 3.11+**.

```bash
git clone https://github.com/techfleetworks/fall-2026-shipathon-team-5.git
cd fall-2026-shipathon-team-5
```

Run whichever part you're working on. The website and the extension use the live backend by default, so you don't need to run the backend locally for frontend work.

```bash
# Website → http://localhost:3000
cd frontend
npm install
cp .env.example .env.local     # optional; remove NEXT_PUBLIC_API_URL to use the live backend
npm run dev

# Extension → opens Chrome with the extension loaded
cd extension
npm install
cp .env.example .env.local     # set WXT_USE_MOCK=true to work without any backend
npm run dev                    # or: npm run dev:firefox

# Backend → http://localhost:8000/docs
# See backend/README.md
```

---

## Website (`frontend/`)

A Next.js site that teaches people how to spot AI content and lets them check a picture directly.

### Site map

Navigation is defined once in [`lib/sitemap.ts`](frontend/lib/sitemap.ts) and drives the header, section tabs and footer.

| # | Section | Route | What's there |
| --- | --- | --- | --- |
| – | Home | `/` | Hero with "Use Veritas" and "Learn to spot the slop" buttons, steps and featured guides |
| 1 | Use Veritas to verify | `/use-veritas` | How the extension works, plus the on-page **Check a picture** tool (`#check-a-picture`) |
| 2 | Learn to spot the slop | `/spot-the-slop` | Long page with anchors `#checklists`, `#ai-on-your-feed`, `#viral-hoaxes`, `#glossary` |
| | ↳ Checklists | `/spot-the-slop/images-and-visuals`, `/audio-and-voice`, `/video-and-motion` | What to look for in each kind of media |
| | ↳ AI on your feed | `/spot-the-slop/ai-on-your-feed/{tiktok,youtube,instagram,facebook-messenger,whatsapp,x}` | Where each platform shows AI labels, with annotated examples |
| | ↳ Reverse image search | `/spot-the-slop/reverse-image-search` | Step-by-step guide |
| | ↳ Viral hoaxes | `/spot-the-slop/viral-hoaxes` | Real AI hoaxes with zoomable photos |
| | ↳ Glossary | `/spot-the-slop/glossary` | Searchable A–Z list of AI terms |
| 3 | Quiz your skills | `/quiz-your-skills` | "Real or AI?" picture quiz |
| 4 | About us | `/about` | The team and how AI was used to build the site |

Old URLs (`/check-before-you-believe`, `/tools-to-double-check/*`, `/skill-check/*`) redirect permanently in [`next.config.ts`](frontend/next.config.ts), so links from older extension builds keep working.

### Content lives in data files

Copy is kept out of components so non-developers can edit it safely. To change text, edit the file in `lib/content/`:

| File | Powers |
| --- | --- |
| `checklists.ts` | Images, audio and video checklist pages |
| `platforms.ts` | "AI on your feed" cards (name, description, quick checks, logo) |
| `platformGuides.ts` | Per-platform guide pages (checks, links, annotated example markers) |
| `platformExamples.ts` | Example screenshots for the platform guides |
| `hoaxes.ts` | Viral hoax cards; `featured` picks which appear on the Learn page |
| `glossary.ts` | Glossary terms; `termId()` builds the `#anchor` links other pages use |
| `reverseSearch.ts` | Reverse image search guide steps |
| `quiz.ts` | Quiz questions, answers and explanations (images in `public/images/quiz/`) |
| `useVeritas.ts` | The Use Veritas page (extension and app highlights) |

### Design system

Tokens come from the team's Figma file and live in the `@theme` block of [`app/globals.css`](frontend/app/globals.css). Change a value there and every page updates.

- **Colors:** light reading surfaces (`canvas`, `surface`, `subtle`, `line`, `ink`, `ink-muted`), dark framing (`deep`, `deep-raised`), aqua accent `primary` (#41DCC6, always with black text, for buttons and active tabs only), and verdict colors `authentic`, `uncertain`, `misleading` (each with `-soft` and `-text` variants).
- **Type:** Archivo Narrow Bold for headings, Public Sans for body; scale from `display` (72 px) to `caption` (12 px).
- **Radius:** image 2 px, card 4 px, control 6 px.
- **Buttons:** `primary`, `dark`, `outline`, `outline-teal`.

### Talking to the API

[`lib/api.ts`](frontend/lib/api.ts) exports `checkImage(file)`, which posts to `POST /api/check-image`.

- Base URL from `NEXT_PUBLIC_API_URL`, falling back to the live Render backend. It is built into the page at build time, so redeploy after changing it.
- Accepts JPEG, PNG and WebP up to 10 MB.
- 90-second timeout to allow for the free server waking up.
- Errors are thrown as `CheckError` with a sentence that can be shown to the visitor as is.

### Scripts

Run inside `frontend/`:

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on http://localhost:3000 |
| `npm run build` / `npm start` | Production build and serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generates route types, then `tsc --noEmit` |

### Conventions

- **New image, new filename.** Next.js and browsers cache images by name, so replacing a file under the same name may not show up.
- Add new pages to `lib/sitemap.ts` so they appear in navigation.
- Keep copy in `lib/content/`, not in components.
- `frontend/AGENTS.md` is generated by `next dev`; commit it as is.

---

## Browser extension (`extension/`)

Veritas checks a picture without leaving the page.

- **On X, Facebook and YouTube:** point at a photo or a YouTube thumbnail and click the **Check** button that appears.
- **On any other site:** right-click an image and choose **Veritas › Check this image**. The same menu offers **Find the original source** (TinEye), **Reverse image search** (Google Lens) and **What should I look for?** (the website's checklist).
- **The answer** appears as a label on the picture (for example **Likely AI-generated · 90%**) with a dashed outline. Details open in the side panel (Firefox: sidebar), and the toolbar badge shows **AI**, **?** or **OK**.
- **Platform labels count as clues.** If Facebook shows "AI info" or YouTube shows "Altered or synthetic content", that label is shown first, and a "can't tell" result becomes "likely made with AI".

### How it's built

| File | Role |
| --- | --- |
| `wxt.config.ts` | Generates `manifest.json`: permissions, host permissions, Firefox ID |
| `entrypoints/background.ts` | Right-click menu; downloads the image, calls the API, stores the result |
| `entrypoints/social.content.ts` | Hover **Check** button on X, Facebook and YouTube |
| `entrypoints/content.ts` | Right-click flow on other sites (injected only after a click) |
| `entrypoints/sidepanel/` | React side panel with the full result and "Before you share" steps |
| `utils/platforms.ts` | Per-site selectors and AI-label detection. **Fix selectors here when a site changes its layout.** |
| `utils/card.ts` | The label and outline drawn on the checked picture |
| `utils/api.ts` | `POST /api/check-image`, plus mock results |
| `utils/types.ts` | API response contract; keep in sync with `backend/app/schemas.py` |
| `utils/verdicts.ts` | How each verdict looks, and website links |
| `utils/storage.ts` | Last result in session storage (cleared when the browser closes) |

### Notable behavior

- **Pictures are sent unchanged** so their Content Credentials survive. Only files over 10 MB or in formats the backend can't read (GIF, AVIF…) are converted to JPEG, and the result says credentials may have been lost.
- **Minimal permissions at install.** Access to all sites is requested only the first time someone uses the right-click menu.
- **Video checks are switched off** (`VIDEO_CHECKS` in `social.content.ts`) until the backend can judge video frames. The frame-grabbing code is kept for then.
- **No API keys in the extension.** Anyone can unzip it; keys belong on the backend.

### Environment and scripts

`.env.local` (copy from `.env.example`):

| Variable | Default | Purpose |
| --- | --- | --- |
| `WXT_API_URL` | Live Render backend | API base URL. Also sets the extension's host permission at build time. Use `http://localhost:8000` for a local backend. |
| `WXT_USE_MOCK` | `false` | `true` returns fake results, no backend needed (good for design work) |

| Command | What it does |
| --- | --- |
| `npm run dev` / `npm run dev:firefox` | Opens the browser with the extension loaded, reloads on save |
| `npm run build` / `npm run build:firefox` | Production build in `.output/` |
| `npm run zip` / `npm run zip:firefox` | Store-ready zips |
| `npm run typecheck` | `tsc --noEmit` |

**Load it manually in Chrome:** `npm run build`, open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked** and choose `extension/.output/chrome-mv3`.

**Before publishing to the stores:** change the Firefox ID in `wxt.config.ts`, add a privacy policy, and explain the "all websites" permission on the website. See [`extension/README.md`](extension/README.md).

---

## Backend API (`backend/`)

Python + FastAPI service that checks pictures and text and serves the quiz. Why we chose it: [ADR 0001](docs/adr/0001-use-python-fastapi-for-the-backend.md). Full setup and contract: [`backend/README.md`](backend/README.md).

### Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Health check (used by Render) |
| `POST` | `/api/check-image` | Check a picture (multipart field `file`, max 10 MB) |
| `POST` | `/api/check-text` | Check text for scam warning signs |
| `GET` | `/api/quiz` | Example quiz pictures with answers. **Placeholder data:** the website's quiz reads `frontend/lib/content/quiz.ts` instead |

Interactive docs at `http://localhost:8000/docs` when running locally.

### Response contract (`/api/check-image`)

Used by both `frontend/lib/api.ts` and `extension/utils/types.ts`. **Change all three together** (backend schema, website, extension).

```ts
{
  verdict: "likely_ai" | "uncertain" | "likely_real",
  ai_likelihood: number | null,          // null = no evidence either way
  content_credentials: {
    found: boolean,
    status: "none" | "trusted" | "trusted_legacy" | "untrusted_signer" | "invalid" | "unreadable",
    source: "ai_generated" | "ai_modified" | "camera" | "computer_made" | "unknown",
    signed_by: string | null,
    issuer: string | null,
    generator: string | null,
    signed_at: string | null
  },
  signals: { label: string, explanation: string }[],
  message: string
}
```

### How a picture is judged

- [ADR 0005: Read Content Credentials for picture checks](docs/adr/0005-read-content-credentials-for-picture-checks.md)
- [ADR 0006: SwinV2 AI image classifier](docs/adr/0006-swinv2-ai-image-classifier.md)
- [ADR 0007: Camera details as a clue](docs/adr/0007-camera-details-as-a-clue.md)
- [ADR 0003: Weighted scam warning signs](docs/adr/0003-weighted-scam-warning-signs.md)

### Running locally

Needs Python 3.11 or newer. From the repository root:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
cp .env.example .env             # Windows: copy .env.example .env
uvicorn app.main:app --reload
```

Then open http://localhost:8000/docs to try every endpoint.

Run this way, the AI-image detector is off and pictures are judged only by their own data (Content Credentials, AI labels, camera details). To run the full check, including the detector, use Docker. The image downloads the model and checks it against a pinned hash:

```bash
docker build -t team5-backend .   # still inside backend/
docker run --rm -p 8000:8000 --memory=512m --cpus=0.1 team5-backend
```

`--memory` and `--cpus` copy Render's free plan, so a picture check takes about 15 seconds; leave `--cpus` out to go faster.

### Configuration

| Variable | Purpose |
| --- | --- |
| `APP_ALLOWED_ORIGINS` | JSON list of allowed front-end origins (CORS) |
| `APP_ALLOWED_ORIGIN_REGEX` | Optional pattern for Vercel preview URLs |
| `APP_RATE_LIMIT` | Default `10/minute` per visitor ([ADR 0002](docs/adr/0002-in-memory-rate-limiting.md)) |
| `APP_CLIENT_IP_HEADER` | Header carrying the real visitor IP (`True-Client-IP` on Render) |
| `APP_MAX_IMAGE_BYTES` | Largest picture accepted (default 10 MB) |
| `APP_MIN_TEXT_CHARS`, `APP_MAX_TEXT_CHARS` | Message length accepted by `/api/check-text` (default 20 to 10,000 characters) |
| `APP_CLASSIFIER_MODEL_DIR` | Folder holding the SwinV2 ONNX model. Unset means the detector is off. The Docker image sets it |
| `APP_CLASSIFIER_MODEL_FILE` | ONNX file in that folder (`model_uint8.onnx` in Docker) |
| `APP_CLASSIFIER_HIGH_THRESHOLD` | Score that makes a picture "likely AI" (default 0.985, [ADR 0006](docs/adr/0006-swinv2-ai-image-classifier.md)). Re-measure before changing |
| `APP_CLASSIFIER_LOW_THRESHOLD` | Below this, the detector found "no clear signs of AI" (default 0.5) |
| `APP_CLASSIFIER_NO_SIGNS_THRESHOLD` | At or below this, "no signs of AI at all" (default 0.00035, [ADR 0007](docs/adr/0007-camera-details-as-a-clue.md)). Still never "likely real" |
| `APP_CLASSIFIER_THREADS`, `APP_CLASSIFIER_LOW_MEMORY` | CPU threads (default 1) and low-memory mode (default on), so the model fits Render's 512 MB |

For local runs, copy `backend/.env.example` to `backend/.env`. Never commit `.env`.

### Tests

From `backend/`, `python -m pytest` runs the unit tests in `tests/` and the Gherkin scenarios in `features/`. They cover the API, Content Credentials, the AI-image detector (with a tiny fake model, so nothing is downloaded), camera details and rate limiting. Two baseline tests fail if a change makes the scam checker or the detector's thresholds worse than measured.

`evaluation/` holds the labeled test sets behind the numbers we report:

| Folder | What it measures | How to run |
| --- | --- | --- |
| `evaluation/` | Scam checker on 160 labeled messages, plus 40 held-out ones never used for tuning. Main set: 91% of scams caught, 1% false alarms. Held-out set: 60% caught, 5% false alarms | `python -m evaluation.evaluate_scam_checker` (add `--details` or `--holdout`) |
| `evaluation/image_detectors/` | Three free AI-image detectors on 500 labeled pictures from OpenFakeTiny. SwinV2 scored 0.93 AUC; the others 0.64 and 0.56 | See [its README](backend/evaluation/image_detectors/README.md). The pictures aren't committed (CC BY-NC license); `extract.py` rebuilds them |

Details: [`backend/evaluation/README.md`](backend/evaluation/README.md).

### Privacy and data handling

- **Pictures and messages are checked in memory and never saved.** Uploads over 1 MB are briefly buffered by the framework in a temporary file that's deleted when the request ends.
- **Their content is never logged.** The app logs only that the detector loaded at startup, and an error if it fails on a picture (without the picture). The server's access log records each request's method, path and status.
- **Rate limiting keeps a count per visitor's IP address in memory** for about a minute, then forgets it. Nothing is written to disk.
- **No outside calls while checking.** Content Credentials trust lists and the detector model are built into the server, so a picture never leaves it.

---

## How the parts fit together

```
            ┌──────────────────────────┐        ┌──────────────────────────┐
            │  Website (Next.js)       │        │  Browser extension (WXT) │
            │  Vercel                  │◀──────▶│  Chrome / Firefox        │
            │  Learn · Quiz · Check    │ links  │  Check on the page       │
            └────────────┬─────────────┘        └────────────┬─────────────┘
                         │  POST /api/check-image            │
                         └──────────────┬────────────────────┘
                                        ▼
                         ┌──────────────────────────┐
                         │  Veritas API (FastAPI)   │
                         │  Render (Docker)         │
                         └──────────────────────────┘
```

- The website's **Check a picture** tool and the extension call the same endpoint and share the same response contract.
- The extension's side panel links back to the website's checklists and reverse image search guide for "Before you share" steps.
- The website's **Use Veritas to verify** page introduces the extension.

---

## Deployment

| Part | Where | Deploys from | Notes |
| --- | --- | --- | --- |
| Website | Vercel | `main` | Set `NEXT_PUBLIC_API_URL` under Settings → Environment Variables, then redeploy |
| Backend | Render (Docker, free plan) | `main`, after checks pass | Configured in [`render.yaml`](render.yaml). Sleeps when idle, so the first check can take up to a minute. One-time setup: New → Blueprint, then set `APP_ALLOWED_ORIGINS` (and optionally `APP_ALLOWED_ORIGIN_REGEX`). See [`backend/README.md`](backend/README.md#deploy-to-render) |
| Extension | Chrome Web Store / Firefox Add-ons | Manual | `npm run zip` / `npm run zip:firefox`. Not yet published. |

Because the website and backend both deploy from `main`, changes go live together when `develop` is merged into `main`.

---

## Contributing

### Branches

- `main`: what's live. Only updated by merging `develop`.
- `develop`: integration branch.
- Feature branches off `develop`, named by area: `frontend/<topic>`, `backend/<topic>`, `extension/<topic>`. Open pull requests into `develop`.

### Continuous integration

Each part has its own workflow in `.github/workflows/`, run on pull requests that touch that folder and on pushes to `main`:

| Workflow | Checks |
| --- | --- |
| `frontend-tests.yml` | `npm ci`, lint, type check and build on Node 22 and 24; `npm audit --omit=dev` |
| `extension-tests.yml` | `npm ci`, type check, Chrome and Firefox builds on Node 22 and 24; confirms the build points at the live backend; `npm audit --omit=dev` |
| `backend-tests.yml` | `python -m pytest` on Python 3.11, 3.12 and 3.14; `pip-audit` for known vulnerabilities |
| `backend-docker.yml` | Builds the Docker image, checks that it answers picture and text checks with the detector running, that memory stays under Render's 512 MB, and that it doesn't run as root. Also runs on pushes to `develop` |

### Before opening a pull request

- Run `npm run lint`, `npm run typecheck` and `npm run build` in the folder you changed.
- If you change the API response, update `backend/app/schemas.py`, `frontend/lib/api.ts` and `extension/utils/types.ts` in the same pull request.
- Check new UI against the accessibility rules above (word + icon for verdicts, 44 px targets, 4.5:1 contrast, keyboard access).
- Record significant technical decisions as a new ADR in `docs/adr/`.