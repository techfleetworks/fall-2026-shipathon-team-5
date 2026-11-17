import { removeCard, renderCard } from '@/utils/card';
import {
  bestImageUrl,
  currentPlatform,
  findPlatformLabel,
  isCheckableImage,
  MIN_MEDIA_SIZE,
} from '@/utils/platforms';
import { RESULT_MESSAGE, type ResultMessage, type SocialRequest } from '@/utils/types';

// Adds a "Check" button over images and videos on X, Facebook and YouTube.
// Right-click doesn't work well there: Facebook covers photos with invisible layers,
// YouTube replaces the right-click menu, and videos stream in pieces with no file to save.

const FRAME_COUNT = 5;
const FRAME_GAP_MS = 800;
const FRAME_MAX_SIDE = 1280;

export default defineContentScript({
  matches: ['https://x.com/*', 'https://*.facebook.com/*', 'https://*.youtube.com/*'],
  runAt: 'document_idle',
  main() {
    (window as unknown as { __veritasSocial?: boolean }).__veritasSocial = true;
    const platform = currentPlatform();
    let target: HTMLImageElement | HTMLVideoElement | null = null;
    let checking: Element | null = null;

    // --- The floating button ------------------------------------------------
    const host = document.createElement('veritas-button');
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        button { position: absolute; z-index: 2147483646; display: none; align-items: center; gap: 6px;
          padding: 6px 12px; border: 0; border-radius: 999px; background: #111; color: #fff;
          font: 600 14px/1 system-ui, sans-serif; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,.3); }
        button:focus-visible { outline: 3px solid #6fd6c3; outline-offset: 2px; }
        .v { display: grid; place-items: center; width: 18px; height: 18px; border-radius: 4px; background: #6fd6c3; color: #111; }
      </style>
      <button type="button" aria-label="Check with Veritas"><span class="v">V</span>Check</button>`;
    const button = shadow.querySelector('button')!;
    document.documentElement.append(host);

    function placeButton(el: Element) {
      const r = el.getBoundingClientRect();
      button.style.top = `${r.top + window.scrollY + 10}px`;
      button.style.left = `${r.left + window.scrollX + 10}px`;
      button.style.display = 'flex';
    }

    // --- Find media under the pointer ---------------------------------------
    // elementsFromPoint sees through the invisible layers sites put over photos.
    function mediaAt(x: number, y: number): HTMLImageElement | HTMLVideoElement | null {
      for (const el of document.elementsFromPoint(x, y)) {
        if (el === host) return target; // pointer is on our button: keep the current target
        if (el instanceof HTMLVideoElement) {
          const r = el.getBoundingClientRect();
          if (r.width >= MIN_MEDIA_SIZE && r.height >= MIN_MEDIA_SIZE) return el;
        }
        if (el instanceof HTMLImageElement && isCheckableImage(el, platform)) return el;
      }
      return null;
    }

    let frame = 0;
    document.addEventListener(
      'pointermove',
      (e) => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          const found = mediaAt(e.clientX, e.clientY);
          if (found) {
            target = found;
            placeButton(found);
          } else {
            target = null;
            button.style.display = 'none';
          }
        });
      },
      { passive: true },
    );
    // Feeds scroll without page loads, so hide the button rather than leave it floating.
    window.addEventListener('scroll', () => (button.style.display = 'none'), { passive: true });

    // --- Run a check -------------------------------------------------------
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation(); // don't open the post underneath
      const media = target;
      if (!media) return;
      checking = media;
      button.style.display = 'none';
      const label = findPlatformLabel(media, platform);

      if (media instanceof HTMLImageElement) {
        send({ type: 'veritas:check-image', srcUrl: bestImageUrl(media, platform), label });
        return;
      }

      renderCard({ status: 'checking', srcUrl: '', startedAt: Date.now() }, media);
      try {
        const frames = await grabFrames(media);
        send({ type: 'veritas:check-frames', frames, label });
      } catch (err) {
        renderCard({ status: 'error', srcUrl: '', message: (err as Error).message }, media);
      }
    });

    // Results come back from the background worker.
    browser.runtime.onMessage.addListener((msg: ResultMessage) => {
      if (msg?.type === RESULT_MESSAGE) renderCard(msg.state, checking);
    });

    // A new page in a single-page app: clear the old card.
    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        removeCard();
      }
    }).observe(document.body, { childList: true, subtree: true });
  },
});

function send(msg: SocialRequest) {
  void browser.runtime.sendMessage(msg);
}

/**
 * Grab a few still frames while the video plays. If it's paused, take just the current frame.
 * Doesn't seek or pause, so the viewer isn't interrupted.
 */
async function grabFrames(video: HTMLVideoElement): Promise<string[]> {
  if (video.readyState < 2) throw new Error('Play the video for a moment, then check again.');
  const count = video.paused ? 1 : FRAME_COUNT;
  const frames: string[] = [];
  for (let i = 0; i < count; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, FRAME_GAP_MS));
    frames.push(await grabOneFrame(video));
  }
  return frames;
}

async function grabOneFrame(video: HTMLVideoElement): Promise<string> {
  const scale = Math.min(1, FRAME_MAX_SIDE / Math.max(video.videoWidth, video.videoHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height);
  try {
    return canvas.toDataURL('image/jpeg', 0.85);
  } catch {
    // The site blocked reading the video's pixels. Fall back to a screenshot of that area.
    const r = video.getBoundingClientRect();
    const shot: string | undefined = await browser.runtime.sendMessage({
      type: 'veritas:capture-tab',
      rect: { x: r.left, y: r.top, width: r.width, height: r.height },
      dpr: window.devicePixelRatio,
    } satisfies SocialRequest);
    if (!shot) throw new Error("This video can't be checked. Try pausing on a clear frame.");
    return shot;
  }
}
