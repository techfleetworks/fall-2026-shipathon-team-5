# Veritas browser extension

On **X, Facebook and YouTube**, point at a photo or video and click the **Check** button that appears.
On other sites, right-click an image and choose **Check with Veritas**.
Built with [WXT](https://wxt.dev) + React + TypeScript. One codebase builds for Chrome (and Edge, Brave, Arc) and Firefox.

## Run it

```bash
cd extension
npm install
cp .env.example .env.local      # set WXT_USE_MOCK=true to work without the backend
npm run dev                     # opens Chrome with the extension loaded, reloads on save
npm run dev:firefox             # same, in Firefox
```

Start the backend first (`uvicorn app.main:app --reload` in `backend/`) unless you use mock mode.

## Try it

1. Open X, Facebook or YouTube and point at a photo, a video, or a YouTube thumbnail.
2. Click **Check**. For videos, let it play: Veritas grabs 5 frames over about 4 seconds (1 if paused).
3. A result card appears on the media. Click the Veritas toolbar icon for the full breakdown.
4. If Facebook shows "AI info" or YouTube shows "Altered or synthetic content", that label is shown as the top signal.

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
| `utils/api.ts` | Calls `POST /api/check-image` and `POST /api/check-frames`, plus mock results |
| `utils/types.ts` | The API response contract. Keep in sync with `backend/app/schemas.py` |
| `utils/storage.ts` | Last result, kept in session storage (cleared when the browser closes) |

## Build for the stores

```bash
npm run zip            # .output/veritas-extension-0.1.0-chrome.zip  → Chrome Web Store
npm run zip:firefox    # .output/...-firefox.zip + sources zip       → addons.mozilla.org
```

Before publishing, change the Firefox ID in `wxt.config.ts` and set `WXT_API_URL` to the Vercel URL, then rebuild.
The API URL is baked in at build time, and it also sets the extension's host permission.

Images over 4 MB are shrunk before upload because Vercel rejects request bodies over 4.5 MB. Shrinking removes C2PA data, so the backend is told via the `resized` field.
Never put API keys in the extension. Anyone can unzip it and read them; keys live on the backend.
