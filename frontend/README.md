# Veritas website

The educational website for Veritas includes: checklists, platform guides, viral hoaxes, a glossary, a "Real or AI?" quiz, and a **Check a picture** tool that calls the Veritas API.

For the project overview, the browser extension and the backend, see the [root README](../README.md).

- **Live:** https://fall-2026-shipathon-team-5.vercel.app
- **Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4

## Run it

Needs **Node.js 22 or 24**. The project uses **npm** only (CI runs `npm ci` against `package-lock.json`).

```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```

You don't need to run the backend. If `NEXT_PUBLIC_API_URL` isn't set, the site uses the live backend on Render.

To use a backend on your computer instead, start it (see [`backend/README.md`](../backend/README.md)), then:

```bash
cp .env.example .env.local     # sets NEXT_PUBLIC_API_URL=http://localhost:8000
```

Never commit `.env.local`.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generates route types (`next typegen`), then `tsc --noEmit` |

## Where things live

```
frontend/
├── app/                # One folder per route (App Router)
│   ├── layout.tsx      # Fonts, header, footer, skip link
│   └── globals.css     # Design tokens (@theme)
├── components/         # Page building blocks
│   └── ui/             # Button, Container, ImagePlaceholder, VerdictBadge
├── lib/
│   ├── sitemap.ts      # Navigation, section tabs, footer links
│   ├── api.ts          # Client for the Veritas API
│   └── content/        # All page text and data
└── public/
    ├── images/         # about, checklists, guides, hoaxes, platforms, quiz, reverse-search, veritas
    └── media/          # Audio and video examples
```

### Editing text

Page copy lives in `lib/content/`, not in components, so you can change wording without touching layout:

| File | Powers |
| --- | --- |
| `checklists.ts` | Images, audio and video checklist pages |
| `platforms.ts` | "AI on your feed" cards |
| `platformGuides.ts`, `platformExamples.ts` | Per-platform guide pages and their annotated screenshots |
| `hoaxes.ts` | Viral hoax cards (`featured` picks the ones on the Learn page) |
| `glossary.ts` | Glossary terms (`termId()` builds the `#anchor` links other pages use) |
| `reverseSearch.ts` | Reverse image search guide |
| `quiz.ts` | Quiz questions (pictures in `public/images/quiz/`) |
| `useVeritas.ts` | The Use Veritas page |

### Adding a page

1. Create `app/<route>/page.tsx`.
2. Add it to `sections` in `lib/sitemap.ts` so it appears in the header, section tabs and footer. Pages with the same `group` share a tab bar.
3. If you move or rename a page, add a permanent redirect in `next.config.ts` (see [Links from the extension](#links-from-the-extension)).

## Talking to the backend

The site calls **one** endpoint: `POST /api/check-image`, through `checkImage()` in [`lib/api.ts`](lib/api.ts), used by `components/PictureChecker.tsx`.

- **Address:** `NEXT_PUBLIC_API_URL`, otherwise `https://team5-backend-lnzk.onrender.com`. It's built into the page at build time, so after changing it (locally or in Vercel) rebuild or redeploy.
- **Uploads:** JPEG, PNG or WebP, up to 10 MB, sent as the form field `file`. The site checks type and size before uploading.
- **Wait time:** up to **90 seconds** before giving up. The free Render server can take up to a minute to wake up, and the AI-image detector adds about 15–20 seconds per check. Expect the first check after a quiet spell to be slow; that's normal.
- **Errors:** the backend sends a plain-language `detail` (picture too large, not a picture, too many checks). `checkImage()` throws it as a `CheckError`, and the page shows it as is. The backend allows 10 checks per minute per visitor.
- **CORS:** the backend only accepts requests from addresses in its `APP_ALLOWED_ORIGINS` setting. A new deployment address (a new Vercel domain, for example) needs adding there.

The **quiz doesn't use the API.** It reads `lib/content/quiz.ts`. The backend's `GET /api/quiz` is still placeholder data, and the site doesn't use `/api/check-text`.

### Keep the response type in sync

`ImageCheckResult` in `lib/api.ts` describes the same response as:

- `backend/app/schemas.py` (the source of truth), and
- `extension/utils/types.ts` (the extension's copy).

If the response changes, update all three in the same pull request. Verdicts are `likely_ai`, `uncertain` and `likely_real`. An `uncertain` result must never look like a safe one: no green, and point people to reverse image search and the checklists.

## Links from the extension

The browser extension links to these website pages (see `extension/utils/links.ts` and `verdicts.ts`):

- `/spot-the-slop/images-and-visuals`
- `/tools-to-double-check/reverse-image-search`, the old address, which redirects to `/spot-the-slop/reverse-image-search`

Installed copies of the extension can't be updated instantly, so **don't remove these routes or their redirects.** If you move a page, add a redirect in `next.config.ts` and update the links in the extension.

## Design system

Tokens come from the team's Figma file and live in the `@theme` block of [`app/globals.css`](app/globals.css). Use the Tailwind classes they create (`bg-canvas`, `text-ink-muted`, `text-h3`, `rounded-card`…) rather than raw values.

- **Colors:** light reading surfaces (`canvas`, `surface`, `subtle`, `line`, `ink`, `ink-muted`) and dark framing (`deep`, `deep-raised`, `inverse`, `inverse-muted`). Aqua `primary` (#41DCC6) is for buttons and active tabs only, always with black text (`text-on-primary`).
- **Verdict colors:** `authentic`, `uncertain` and `misleading`, each with `-soft` and `-text` versions. Use them through `ui/VerdictBadge`.
- **Type:** Archivo Narrow Bold for headings (`font-heading font-bold`), Public Sans for body, loaded with `next/font/google` in `layout.tsx`. Sizes run from `text-display` (72 px) to `text-caption` (12 px).
- **Radius:** `rounded-image` 2 px, `rounded-card` 4 px, `rounded-control` 6 px.
- **Buttons:** `Button` and `ButtonLink` in `components/ui/Button.tsx`, variants `primary`, `dark`, `outline` and `outline-teal`.

## Conventions

- **New image, new filename.** Next.js and browsers cache images by name, so a replaced file under the same name may not show up.
- **Keep text in `lib/content/`**, not in components.
- **`AGENTS.md` is created by `next dev`.** It comes back if you delete it, so commit it as is.
- Branch off `develop` as `frontend/<topic>` and open pull requests into `develop`.

## CI and deployment

[`.github/workflows/frontend-tests.yml`](../.github/workflows/frontend-tests.yml) runs on pull requests that touch `frontend/` and on pushes to `main`:

- `npm ci`, lint, type check and build on Node 22 and 24
- `npm audit --omit=dev`

Run `npm run lint`, `npm run typecheck` and `npm run build` before opening a pull request.

The site is hosted on **Vercel** and deploys from **`main`**, like the backend, so both change together when `develop` is merged into `main`. Set `NEXT_PUBLIC_API_URL` in Vercel under **Settings → Environment Variables** (it falls back to the live backend if unset), then redeploy.

The build downloads fonts from Google Fonts, so it needs internet access.
