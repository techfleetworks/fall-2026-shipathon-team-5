import { WEBSITE_URL } from './verdicts';

// Outside tools for "find where this picture came from". These open in a new tab
// only when someone clicks them, and send the picture's web address (not the file).

/** TinEye, sorted oldest first: the best way to find the original. */
export function tinEyeUrl(srcUrl: string) {
  return `https://tineye.com/search?url=${encodeURIComponent(srcUrl)}&sort=crawl_date&order=asc`;
}

/** Google Lens: finds matching and similar pictures across the web. */
export function googleLensUrl(srcUrl: string) {
  return `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(srcUrl)}`;
}

/** Only real web addresses can be searched; pasted or generated pictures can't. */
export function canSearch(srcUrl: string) {
  return /^https?:\/\//.test(srcUrl);
}

export const GUIDE_LINKS = {
  reverseSearch: `${WEBSITE_URL}/tools-to-double-check/reverse-image-search`,
  imageChecklist: `${WEBSITE_URL}/spot-the-slop/images-and-visuals`,
};
