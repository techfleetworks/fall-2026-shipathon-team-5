import type { CheckImageResult } from './types';

export const API_URL: string = import.meta.env.WXT_API_URL ?? 'http://localhost:8000';
const USE_MOCK = import.meta.env.WXT_USE_MOCK === 'true';

/** Vercel Functions reject request bodies over 4.5 MB. Stay under it with room for the form wrapper. */
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
/** Refuse to even try past this. */
const MAX_DOWNLOAD_BYTES = 25 * 1024 * 1024;
/** Longest side after shrinking. Detectors don't need more. */
const MAX_SIDE = 2048;

export class CheckError extends Error {}

/** Download the image the user right-clicked. Runs in the background worker. */
export async function downloadImage(srcUrl: string): Promise<Blob> {
  if (srcUrl.startsWith('data:')) {
    return (await fetch(srcUrl)).blob();
  }
  let res: Response;
  try {
    // credentials: 'include' lets us read images the user can see because they're logged in.
    res = await fetch(srcUrl, { credentials: 'include' });
  } catch {
    throw new CheckError(
      "Couldn't download this image. Allow Veritas to read images on other sites and try again.",
    );
  }
  if (!res.ok) throw new CheckError(`Couldn't download this image (HTTP ${res.status}).`);
  const blob = await res.blob();
  if (blob.size > MAX_DOWNLOAD_BYTES) throw new CheckError('This image is too large to check.');
  if (!blob.type.startsWith('image/')) throw new CheckError("This file isn't an image we can check.");
  return blob;
}

/**
 * Send the original when it fits, because re-encoding strips C2PA Content Credentials.
 * Only shrink images that are over Vercel's upload limit.
 */
export async function fitForUpload(image: Blob): Promise<{ blob: Blob; resized: boolean }> {
  if (image.size <= MAX_UPLOAD_BYTES) return { blob: image, resized: false };

  const bitmap = await createImageBitmap(image);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = new OffscreenCanvas(Math.round(bitmap.width * scale), Math.round(bitmap.height * scale));
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  for (const quality of [0.92, 0.8, 0.65]) {
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality });
    if (blob.size <= MAX_UPLOAD_BYTES) return { blob, resized: true };
  }
  throw new CheckError('This image is too large to check.');
}

/** Send the image to POST /api/check-image. */
export async function checkImage(image: Blob, resized = false): Promise<CheckImageResult> {
  if (USE_MOCK) return mockResult();

  const form = new FormData();
  form.append('file', image, 'image');
  // Tells the backend that C2PA data may have been lost in resizing.
  form.append('resized', String(resized));

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/check-image`, { method: 'POST', body: form });
  } catch {
    throw new CheckError("Couldn't reach the Veritas server. Check your connection and try again.");
  }

  if (!res.ok) {
    // The backend returns {"detail": "..."} for 413 / 415 / 422 / 429.
    const body = await res.json().catch(() => ({}));
    if (res.status === 429) throw new CheckError("You've checked a lot of images. Wait a minute and try again.");
    throw new CheckError(typeof body.detail === 'string' ? body.detail : `Check failed (HTTP ${res.status}).`);
  }
  return (await res.json()) as CheckImageResult;
}

/** Vercel's 4.5 MB body limit applies to all frames together. */
const MAX_FRAMES_BYTES = 4 * 1024 * 1024;

/** Send several video frames to POST /api/check-frames. The backend checks each and combines them. */
export async function checkFrames(frames: Blob[]): Promise<CheckImageResult> {
  if (USE_MOCK) return { ...(await mockResult()), framesChecked: frames.length };

  // Drop frames from the end until the request fits.
  const kept = [...frames];
  while (kept.length > 1 && kept.reduce((n, f) => n + f.size, 0) > MAX_FRAMES_BYTES) kept.pop();

  const form = new FormData();
  kept.forEach((f, i) => form.append('files', f, `frame-${i}.jpg`));

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/check-frames`, { method: 'POST', body: form });
  } catch {
    throw new CheckError("Couldn't reach the Veritas server. Check your connection and try again.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (res.status === 429) throw new CheckError("You've checked a lot of videos. Wait a minute and try again.");
    throw new CheckError(typeof body.detail === 'string' ? body.detail : `Check failed (HTTP ${res.status}).`);
  }
  return (await res.json()) as CheckImageResult;
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return (await fetch(dataUrl)).blob();
}

/** Lets designers and the content script work without the backend running. */
async function mockResult(): Promise<CheckImageResult> {
  await new Promise((r) => setTimeout(r, 800));
  return {
    verdict: 'likely_ai',
    likelihood: 0.92,
    source: 'mock',
    signals: [
      { level: 'bad', title: 'No camera data', detail: 'The file has no camera or editing history.' },
      { level: 'warn', title: 'Detector score: 92%', detail: 'Patterns match images made by AI tools.' },
      { level: 'good', title: 'No signs of editing', detail: 'Nothing was pasted in or retouched.' },
    ],
  };
}
