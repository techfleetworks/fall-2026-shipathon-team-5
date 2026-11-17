import { CheckError, checkFrames, checkImage, dataUrlToBlob, downloadImage, fitForUpload } from '@/utils/api';
import { PLATFORM_NAME } from '@/utils/platforms';
import { GUIDE_LINKS, canSearch, googleLensUrl, tinEyeUrl } from '@/utils/links';
import { openPanel, openPanelFromToolbar } from '@/utils/panel';
import { lastCheck } from '@/utils/storage';
import { displayFor } from '@/utils/verdicts';
import {
  RESULT_MESSAGE,
  type CheckImageResult,
  type CheckState,
  type PlatformLabel,
  type ResultMessage,
  type SocialRequest,
} from '@/utils/types';

// The right-click menu. With more than one item, the browser groups them under
// "Veritas" with our icon, so this shows as Veritas > Check this image, and so on.
const MENU = {
  check: 'veritas-check-image',
  original: 'veritas-find-original',
  reverse: 'veritas-reverse-search',
  lookFor: 'veritas-what-to-look-for',
} as const;

export default defineBackground(() => {
  // The toolbar icon opens the side panel (Firefox: the sidebar).
  openPanelFromToolbar();

  // Menus persist across restarts, so create them once on install/update.
  browser.runtime.onInstalled.addListener(() => {
    void browser.contextMenus.removeAll().then(() => {
      const items: [string, string][] = [
        [MENU.check, 'Check this image'],
        [MENU.original, 'Find the original source'],
        [MENU.reverse, 'Reverse image search'],
        [MENU.lookFor, 'What should I look for?'],
      ];
      for (const [id, title] of items) browser.contextMenus.create({ id, title, contexts: ['image'] });
    });
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    const srcUrl = info.srcUrl;
    if (!srcUrl) return;

    // The search items just open a new tab next to this one.
    const openTab = (url: string) => void browser.tabs.create({ url, index: tab ? tab.index + 1 : undefined });
    if (info.menuItemId === MENU.original) return openTab(canSearch(srcUrl) ? tinEyeUrl(srcUrl) : GUIDE_LINKS.reverseSearch);
    if (info.menuItemId === MENU.reverse) return openTab(canSearch(srcUrl) ? googleLensUrl(srcUrl) : GUIDE_LINKS.reverseSearch);
    if (info.menuItemId === MENU.lookFor) return openTab(GUIDE_LINKS.imageChecklist);
    if (info.menuItemId !== MENU.check || tab?.id == null) return;

    // These must be called right away, inside the click, or the browser rejects them.
    void openPanel(tab);
    // Resolves true with no prompt when the user has already allowed it.
    const permission = browser.permissions.request({ origins: ['<all_urls>'] });
    const tabId = tab.id;
    const pageUrl = tab.url;

    void (async () => {
      await injectCard(tabId);
      await permission.catch(() => false); // If they say no, same-site images still work via activeTab.
      await runImageCheck(tabId, srcUrl, null, pageUrl);
    })();
  });

  // Hover-button flow on X, Facebook and YouTube (see social.content.ts).
  browser.runtime.onMessage.addListener((msg: SocialRequest, sender, sendResponse) => {
    const tabId = sender.tab?.id;
    if (tabId == null) return;

    if (msg.type === 'veritas:open-panel') {
      void openPanel(sender.tab);
    } else if (msg.type === 'veritas:check-image') {
      void openPanel(sender.tab);
      void runImageCheck(tabId, msg.srcUrl, msg.label, sender.tab?.url);
    } else if (msg.type === 'veritas:check-frames') {
      void runFramesCheck(tabId, msg.frames, msg.label, sender.tab?.url);
    } else if (msg.type === 'veritas:capture-tab') {
      captureArea(sender.tab!.windowId!, msg.rect, msg.dpr).then(sendResponse, () => sendResponse(undefined));
      return true; // keeps sendResponse open for the async reply
    }
  });
});

async function runImageCheck(tabId: number, srcUrl: string, label: PlatformLabel | null, pageUrl?: string) {
  await publish(tabId, { status: 'checking', srcUrl, pageUrl, startedAt: Date.now() });
  try {
    const original = await downloadImage(srcUrl);
    const { blob, resized } = await fitForUpload(original);
    const result = withLabel(await checkImage(blob, resized), label);
    await finish(tabId, srcUrl, result, pageUrl);
  } catch (err) {
    await fail(tabId, srcUrl, err, pageUrl);
  }
}

async function runFramesCheck(tabId: number, frames: string[], label: PlatformLabel | null, pageUrl?: string) {
  const thumb = frames[0] ?? '';
  await publish(tabId, { status: 'checking', srcUrl: thumb, pageUrl, startedAt: Date.now() });
  try {
    const blobs = await Promise.all(frames.map(dataUrlToBlob));
    const result = withLabel(await checkFrames(blobs), label);
    await finish(tabId, thumb, result, pageUrl);
  } catch (err) {
    await fail(tabId, thumb, err, pageUrl);
  }
}

/**
 * A label the site itself puts on the post outranks "we can't tell": the site
 * has information we don't. It doesn't override a signed record, which is
 * stronger, so it's added as the first clue either way.
 */
function withLabel(result: CheckImageResult, label: PlatformLabel | null): CheckImageResult {
  if (!label) return result;
  const site = PLATFORM_NAME[label.platform];
  const signal = {
    label: `Labeled by ${site}`,
    explanation: `${site} shows "${label.text}" on this post. That means ${site} believes it was made or changed with AI.`,
  };
  const labelled = { ...result, platformLabel: label, signals: [signal, ...result.signals] };
  if (result.verdict !== 'uncertain') return labelled;
  return {
    ...labelled,
    verdict: 'likely_ai',
    message: `${site} has labeled this post as made or changed with AI.`,
  };
}

async function finish(tabId: number, srcUrl: string, result: CheckImageResult, pageUrl?: string) {
  await publish(tabId, { status: 'done', srcUrl, pageUrl, result, finishedAt: Date.now() });
  const shown = displayFor(result.verdict);
  await setBadge(tabId, shown.badge, shown.badgeColor);
}

async function fail(tabId: number, srcUrl: string, err: unknown, pageUrl?: string) {
  const message = err instanceof CheckError ? err.message : 'Something went wrong. Please try again.';
  console.error('[Veritas]', err);
  await publish(tabId, { status: 'error', srcUrl, pageUrl, message });
}

/**
 * Screenshot the visible tab and crop it to the video. Only used when a site blocks reading
 * video pixels directly. Needs the optional <all_urls> permission; returns undefined without it.
 */
async function captureArea(
  windowId: number,
  rect: { x: number; y: number; width: number; height: number },
  dpr: number,
): Promise<string | undefined> {
  if (!(await browser.permissions.contains({ origins: ['<all_urls>'] }))) return undefined;
  const shot = await browser.tabs.captureVisibleTab(windowId, { format: 'jpeg', quality: 90 });
  const bitmap = await createImageBitmap(await dataUrlToBlob(shot));
  const canvas = new OffscreenCanvas(Math.round(rect.width * dpr), Math.round(rect.height * dpr));
  canvas.getContext('2d')!.drawImage(
    bitmap,
    rect.x * dpr, rect.y * dpr, rect.width * dpr, rect.height * dpr,
    0, 0, canvas.width, canvas.height,
  );
  bitmap.close();
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 });
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return `data:image/jpeg;base64,${btoa(binary)}`;
}

/** Inject the right-click card script. activeTab allows this after a menu click. */
async function injectCard(tabId: number) {
  try {
    await browser.scripting.executeScript({ target: { tabId }, files: ['/content-scripts/content.js'] });
  } catch (err) {
    // Some pages (browser settings, the web store) block all extensions. The side panel still works.
    console.warn('[Veritas] Could not inject into this page', err);
  }
}

/** Save the state for the side panel and tell the page's content script. */
async function publish(tabId: number, state: CheckState) {
  await lastCheck.setValue(state);
  const msg: ResultMessage = { type: RESULT_MESSAGE, state };
  await browser.tabs.sendMessage(tabId, msg).catch(() => {});
}

async function setBadge(tabId: number, text: string, color: string) {
  await browser.action.setBadgeText({ tabId, text });
  await browser.action.setBadgeBackgroundColor({ tabId, color });
}
