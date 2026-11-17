import type { Platform, PlatformLabel } from './types';

// One small adapter per site. Social sites change their page code often, so keep
// every site-specific detail here, where it's easy to find and fix.

/** Images smaller than this (avatars, emoji, icons) don't get a Check button. */
export const MIN_MEDIA_SIZE = 150;

export function currentPlatform(host = location.hostname): Platform {
  if (host === 'x.com' || host.endsWith('.x.com') || host.endsWith('twitter.com')) return 'x';
  if (host.endsWith('facebook.com')) return 'facebook';
  if (host.endsWith('youtube.com')) return 'youtube';
  return 'other';
}

/** Ask for the biggest version of the image the CDN offers, so the detector sees detail. */
export function bestImageUrl(img: HTMLImageElement, platform: Platform): string {
  const src = img.currentSrc || img.src;
  try {
    const url = new URL(src);
    // X serves images like https://pbs.twimg.com/media/ABC?format=jpg&name=small
    if (platform === 'x' && url.hostname === 'pbs.twimg.com' && url.searchParams.has('name')) {
      url.searchParams.set('name', 'large');
      return url.toString();
    }
    // YouTube thumbnails: ask for the high-resolution version.
    if (platform === 'youtube' && url.hostname === 'i.ytimg.com') {
      return src.replace(/\/(default|mqdefault|hqdefault|sddefault)(_live)?\.jpg/, '/hqdefault.jpg');
    }
  } catch {
    // Not a normal URL (data: or blob:). Use as is.
  }
  return src;
}

/** Skip things that aren't real content: profile pictures, emoji, ads chrome. */
export function isCheckableImage(img: HTMLImageElement, platform: Platform): boolean {
  const r = img.getBoundingClientRect();
  if (r.width < MIN_MEDIA_SIZE || r.height < MIN_MEDIA_SIZE) return false;
  const src = img.currentSrc || img.src;
  if (!src || src.startsWith('data:image/svg')) return false;
  if (platform === 'x') return src.includes('pbs.twimg.com/media') || src.includes('pbs.twimg.com/amplify_video_thumb');
  if (platform === 'facebook') return /fbcdn\.net/.test(src);
  if (platform === 'youtube') return src.includes('i.ytimg.com/vi');
  return true;
}

/**
 * Look for a label the platform itself puts on AI content. It's stronger evidence than a
 * detector guess, so it becomes a signal in the result. Text-based on purpose: class names
 * on these sites change weekly; the visible words change rarely.
 */
export function findPlatformLabel(media: Element, platform: Platform): PlatformLabel | null {
  if (platform === 'youtube') {
    // Shown in the description area of a watch page or Short.
    const text = document.querySelector('ytd-watch-metadata, ytd-reel-video-renderer[is-active]')?.textContent ?? '';
    const m = text.match(/Altered or synthetic content/i);
    return m ? { platform, text: m[0] } : null;
  }
  if (platform === 'facebook') {
    const post = media.closest('[role="article"]') ?? media.closest('[role="dialog"]');
    const m = post?.textContent?.match(/\bAI info\b/);
    return m ? { platform, text: m[0] } : null;
  }
  // X has no standard AI label as of this build. Community Notes could be a later signal.
  return null;
}

export const PLATFORM_NAME: Record<Platform, string> = {
  x: 'X',
  facebook: 'Facebook',
  youtube: 'YouTube',
  other: 'This site',
};
