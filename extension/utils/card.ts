import type { CheckState, SocialRequest } from './types';
import { displayFor } from './verdicts';

// The label drawn on the checked picture: a dashed outline around it and a tag in the
// top-left corner ("Likely made with AI · 90%"), with "Why?" to open the side panel.
// Shared by the right-click flow (content.ts) and the social-site buttons (social.content.ts).
// If the picture can't be found on the page, the tag shows in the top-right corner instead.

const TONE_COLOR = { ai: '#b4232a', unclear: '#8a5a00', ok: '#0b7a4f', neutral: '#16171a' } as const;

let host: HTMLElement | null = null;
let anchorEl: Element | null = null;
let resizeObserver: ResizeObserver | null = null;

export function renderCard(state: CheckState, anchor?: Element | null) {
  if (!host) {
    host = document.createElement('veritas-result');
    // Shadow DOM keeps the page's CSS from breaking our label, and ours from breaking the page.
    host.attachShadow({ mode: 'open' });
    document.documentElement.append(host);
    window.addEventListener('resize', place);
  }
  if (anchor !== undefined && anchor !== anchorEl) {
    resizeObserver?.disconnect();
    anchorEl = anchor;
    if (anchor) {
      resizeObserver = new ResizeObserver(place);
      resizeObserver.observe(anchor);
    }
  }

  const { tone, text, detail } = describe(state);
  const color = TONE_COLOR[tone];
  const root = host.shadowRoot!;
  root.innerHTML = `
    <style>
      :host { all: initial; }
      .frame { position: absolute; z-index: 2147483646; box-sizing: border-box; pointer-events: none;
        border: 3px dashed ${color}; border-radius: 2px; }
      .tag { position: absolute; z-index: 2147483647; display: flex; align-items: center; gap: 6px;
        max-width: min(420px, 90vw); font: 600 14px/1.3 system-ui, -apple-system, "Segoe UI", sans-serif; }
      .tag.floating { position: fixed; top: 16px; right: 16px; }
      .label { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 4px;
        background: ${color}; color: #fff; box-shadow: 0 2px 10px rgba(0,0,0,.25); }
      .detail { font-weight: 400; }
      .spin { width: 12px; height: 12px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff;
        border-radius: 50%; animation: spin 1s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
      @media (prefers-reduced-motion: reduce) { .spin { animation: none; } }
      button { min-height: 32px; padding: 0 10px; border: 0; border-radius: 6px; background: #fff;
        color: #16171a; font: inherit; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,.25); }
      button:hover { background: #41dcc6; }
      button:focus-visible { outline: 3px solid #41dcc6; outline-offset: 2px; }
      .close { width: 32px; padding: 0; font-size: 18px; line-height: 1; }
    </style>
    <div class="frame" ${anchorEl ? '' : 'hidden'}></div>
    <div class="tag ${anchorEl ? '' : 'floating'}" role="status" aria-live="polite">
      <span class="label">
        ${state.status === 'checking' ? '<span class="spin" aria-hidden="true"></span>' : ''}
        <span>${escapeHtml(text)}${detail ? ` <span class="detail">${escapeHtml(detail)}</span>` : ''}</span>
      </span>
      ${state.status === 'done' ? '<button type="button" id="why">Why?</button>' : ''}
      <button type="button" class="close" id="close" aria-label="Remove the Veritas label">×</button>
    </div>`;

  root.getElementById('close')?.addEventListener('click', removeCard);
  root.getElementById('why')?.addEventListener('click', () => {
    void browser.runtime.sendMessage({ type: 'veritas:open-panel' } satisfies SocialRequest);
  });
  place();
}

export function removeCard() {
  resizeObserver?.disconnect();
  resizeObserver = null;
  window.removeEventListener('resize', place);
  host?.remove();
  host = null;
  anchorEl = null;
}

/** Keep the outline and tag on the picture. Page coordinates, so scrolling needs no work. */
function place() {
  const root = host?.shadowRoot;
  if (!root || !anchorEl) return;
  const r = anchorEl.getBoundingClientRect();
  const top = r.top + window.scrollY;
  const left = r.left + window.scrollX;
  const frame = root.querySelector<HTMLElement>('.frame');
  const tag = root.querySelector<HTMLElement>('.tag');
  if (frame) Object.assign(frame.style, { top: `${top}px`, left: `${left}px`, width: `${r.width}px`, height: `${r.height}px` });
  if (tag) Object.assign(tag.style, { top: `${top + 12}px`, left: `${left + 12}px` });
}

function describe(state: CheckState): { tone: keyof typeof TONE_COLOR; text: string; detail?: string } {
  if (state.status === 'checking') return { tone: 'neutral', text: 'Veritas is checking…' };
  if (state.status === 'error') return { tone: 'neutral', text: state.message };
  const shown = displayFor(state.result.verdict);
  const likelihood = state.result.ai_likelihood;
  // Only show a percentage with an AI verdict, where it reads naturally ("90% likely AI").
  const detail =
    state.result.verdict === 'likely_ai' && likelihood != null ? `· ${Math.round(likelihood * 100)}%` : undefined;
  return { tone: shown.tone, text: shown.text, detail };
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
