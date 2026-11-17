import type { CheckState } from './types';

// The result card drawn on top of the page, next to the checked image or video.
// Shared by the right-click flow (content.ts) and the social-site buttons (social.content.ts).

let host: HTMLElement | null = null;

export function renderCard(state: CheckState, anchor?: Element | null) {
  if (!host) {
    host = document.createElement('veritas-result');
    // Shadow DOM keeps the page's CSS from breaking our card, and ours from breaking the page.
    host.attachShadow({ mode: 'open' });
    document.body.append(host);
  }
  const root = host.shadowRoot!;
  const rect = anchor?.getBoundingClientRect();
  const top = (rect ? rect.top + window.scrollY : window.scrollY) + 12;
  const left = (rect ? rect.left + window.scrollX : window.scrollX) + 12;

  root.innerHTML = `
    <style>
      .card { position: absolute; top: ${top}px; left: ${left}px; z-index: 2147483647;
        width: 300px; padding: 14px 16px; border-radius: 10px; background: #fff; color: #111;
        font: 15px/1.45 system-ui, sans-serif; box-shadow: 0 4px 24px rgba(0,0,0,.18); }
      .pill { display: inline-block; padding: 2px 10px; border-radius: 999px; font-weight: 600; font-size: 14px; }
      .ai { background: #fde7e7; color: #b42318; } .ok { background: #e3f4ea; color: #1f7a4d; }
      .unclear { background: #fff3d6; color: #8a5a00; }
      button { margin-top: 10px; border: 1px solid #ccc; background: #fff; border-radius: 6px;
        padding: 6px 12px; font: inherit; color: #111; cursor: pointer; }
      .note { margin-top: 8px; font-size: 13px; color: #555; }
    </style>
    <div class="card" role="dialog" aria-live="polite" aria-label="Veritas result">
      ${body(state)}
      <div class="note">Veritas estimates likelihood, not certainty.</div>
      <button type="button" id="close">Close</button>
    </div>`;

  root.getElementById('close')?.addEventListener('click', removeCard);
}

export function removeCard() {
  host?.remove();
  host = null;
}

function body(state: CheckState): string {
  if (state.status === 'checking') return '<div>Checking…</div>';
  if (state.status === 'error') return `<div>${escapeHtml(state.message)}</div>`;

  const { verdict, likelihood, framesChecked } = state.result;
  const pct = likelihood == null ? '' : ` · ${Math.round(likelihood * 100)}%`;
  const label: Record<string, [string, string]> = {
    verified_ai: ['ai', 'Made with AI (signed or labeled)'],
    likely_ai: ['ai', `Likely AI-generated${pct}`],
    unclear: ['unclear', `Unclear${pct}`],
    likely_real: ['ok', `Likely not AI${pct}`],
    verified_real: ['ok', 'Camera-signed Content Credentials'],
  };
  const [cls, text] = label[verdict] ?? ['unclear', 'Unclear'];
  const frames = framesChecked ? `<div class="note">Based on ${framesChecked} video frames.</div>` : '';
  return `<span class="pill ${cls}">${escapeHtml(text)}</span>${frames}
    <div class="note">Click the Veritas icon in your toolbar to see why.</div>`;
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
