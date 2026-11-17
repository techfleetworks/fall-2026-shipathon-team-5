# Veritas browser extension

On **X, Facebook and YouTube**, point at a photo (or a YouTube thumbnail) and click the **Check** button that appears.
On other sites, right-click an image and choose **Check with Veritas**.
Built with [WXT](https://wxt.dev) + React + TypeScript. One codebase builds for Chrome (and Edge, Brave, Arc) and Firefox.

## Run it

```bash
cd extension
npm install
cp .env.example .env.local      # uses the live backend; set WXT_USE_MOCK=true to work without one
npm run dev                     # opens Chrome with the extension loaded, reloads on save
npm run dev:firefox             # same, in Firefox
```

By default it talks to the live backend on Render. To use a backend on your computer instead, run
`uvicorn app.main:app --reload` in `backend/` and set `WXT_API_URL=http://localhost:8000` in `.env.local`.

### Load it in Chrome yourself

`npm run build`, then open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked**
and choose `extension/.output/chrome-mv3`.

## Try it

1. Open X, Facebook or YouTube and point at a photo or a YouTube thumbnail.
2. Click **Check**. The first check can take up to a minute while the free server wakes up.
3. A result card appears on the picture, and the toolbar icon shows **AI**, **?** (we can't tell) or **OK**.
   Click the icon for what was found and what to do before sharing.
4. If Facebook shows its "AI info" badge or YouTube shows "Altered or synthetic content", that label is
   shown as the first clue, and a "can't tell" result becomes "likely made with AI".

**Videos:** checks are switched off for now (`VIDEO_CHECKS` in `social.content.ts`). Frames grabbed from a
video never carry Content Credentials, so until the backend has an AI-image classifier the answer would
always be "we can't tell". The frame-grabbing code is kept for then.

On other sites, right-click an image and choose **Check with Veritas**. The first time, the browser asks to let Veritas read images on all sites.

## Where things live

| File | What it does |
| --- | --- |
| `wxt.config.ts` | Builds `manifest.json`: name, permissions, Firefox ID |
| `entrypoints/background.ts` | Right-click menu, downloads the image, calls the API, stores the result |
| `entrypoints/social.content.ts` | Hover **Check** button on X, Facebook and YouTube; grabs video frames |
| `utils/platforms.ts` | Per-site details: which images count, best image URL, platform AI labels. **Fix selectors here when a site changes.** |
| `entrypoints/content.ts` | Right-click flow on other sites (injected only after a click) |
| `utils/card.ts` | The result card drawn on the page |
| `entrypoints/popup/` | React panel opened from the toolbar icon |
| `utils/api.ts` | Calls `POST /api/check-image`, plus mock results (`/api/check-frames` isn't built yet) |
| `utils/types.ts` | The API response contract. Keep in sync with `backend/app/schemas.py` |
| `utils/verdicts.ts` | How each verdict looks (card, popup, badge) and the website links. "Can't tell" never looks like "real" |
| `utils/storage.ts` | Last result, kept in session storage (cleared when the browser closes) |

## Build for the stores

```bash
npm run zip            # .output/veritas-extension-0.1.0-chrome.zip  → Chrome Web Store
npm run zip:firefox    # .output/...-firefox.zip + sources zip       → addons.mozilla.org
```

Before publishing, change the Firefox ID in `wxt.config.ts`. The API URL (the Render backend by default) is baked
in at build time, and it also sets the extension's host permission.

Pictures are sent as they are, so their Content Credentials survive. Only pictures over the backend's 10 MB limit,
or in formats it can't read (GIF, AVIF...), are converted to JPEG first. Converting removes Content Credentials,
so the result then says so.

Never put API keys in the extension. Anyone can unzip it and read them; keys live on the backend.

## Before publishing to the stores

* **Privacy policy:** the stores require one. Say that the picture someone chooses to check is sent to the Veritas
  server, checked, and not kept, and that nothing is collected otherwise.
* **The "all websites" permission:** the right-click menu asks for it the first time, and the browser's wording
  ("read and change all your data on all websites") can alarm people. Explain on the website why it's asked for.
