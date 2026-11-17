import type { Verdict } from './types';

// How each backend verdict is shown, in one place so the card, the popup and
// the toolbar badge always agree. "uncertain" must never look like "real":
// older visitors may read a green tick as "safe to share".
export const VERDICT_DISPLAY: Record<Verdict, { text: string; tone: 'ai' | 'unclear' | 'ok'; badge: string; badgeColor: string }> = {
  likely_ai: { text: 'Likely made with AI', tone: 'ai', badge: 'AI', badgeColor: '#b42318' },
  uncertain: { text: "We can't tell", tone: 'unclear', badge: '?', badgeColor: '#8a5a00' },
  likely_real: { text: 'Likely a real photo', tone: 'ok', badge: 'OK', badgeColor: '#1f7a4d' },
};

/** Anything unexpected from the server is shown as "can't tell", never as real. */
export function displayFor(verdict: string) {
  return VERDICT_DISPLAY[verdict as Verdict] ?? VERDICT_DISPLAY.uncertain;
}

// The Veritas website, for "what to do next" links.
export const WEBSITE_URL = 'https://fall-2026-shipathon-team-5.vercel.app';
export const NEXT_STEPS = [
  { label: 'Search for where it came from', href: `${WEBSITE_URL}/tools-to-double-check/reverse-image-search` },
  { label: 'Clues to look for in pictures', href: `${WEBSITE_URL}/spot-the-slop/images-and-visuals` },
];
