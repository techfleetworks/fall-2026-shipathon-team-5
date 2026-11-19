import { useEffect, useState } from 'react';
import { GUIDE_LINKS, canSearch, googleLensUrl, tinEyeUrl } from '@/utils/links';
import { lastCheck } from '@/utils/storage';
import type { CheckImageResult, CheckState } from '@/utils/types';
import { displayFor } from '@/utils/verdicts';

// The Veritas side panel (Firefox: sidebar). Shows the latest check: the page it was on,
// the verdict, what we found, what we checked against, and what to do before sharing.

export default function App() {
  const [state, setState] = useState<CheckState | null>(null);

  useEffect(() => {
    lastCheck.getValue().then(setState);
    // Update live while a check is running.
    return lastCheck.watch(setState);
  }, []);

  return (
    <main>
      <header className="top">
        <svg className="logo" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          <rect width="100" height="100" rx="28" fill="#41DCC6" />
          <path
            d="M28.5 34 L50 71.5 L71.5 34"
            fill="none"
            stroke="#16171A"
            strokeWidth="10.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="73.3" cy="26.8" r="8.5" fill="#16171A" />
        </svg>
        <h1>Veritas</h1>
      </header>
      {state?.pageUrl && <p className="scanned">Checked on: {shortUrl(state.pageUrl)}</p>}
      {state ? <Result state={state} /> : <Empty />}
      <p className="footnote">No checker is perfect. Always check where a picture came from.</p>
    </main>
  );
}

function Empty() {
  return (
    <section className="card">
      <h2 className="card-title">Check a picture</h2>
      <ol className="steps">
        <li>
          Right-click any picture and choose <strong>Veritas › Check this image</strong>.
        </li>
        <li>
          On X, Facebook or YouTube, point at a photo and click the <strong>Check</strong> button.
        </li>
        <li>The answer appears on the picture, and the details show up here.</li>
      </ol>
    </section>
  );
}

function Result({ state }: { state: CheckState }) {
  if (state.status === 'checking') {
    return (
      <section className="card" aria-live="polite">
        <div className="summary">
          <div className="ring ring-checking" aria-hidden="true">
            <span className="spinner" />
          </div>
          <div>
            <p className="caption">Checking this picture…</p>
            <p className="hint">The first check can take up to a minute while the server wakes up.</p>
          </div>
        </div>
        {state.srcUrl && <img className="thumb" src={state.srcUrl} alt="The picture being checked" />}
      </section>
    );
  }
  if (state.status === 'error') {
    return (
      <section className="card" role="alert">
        <p className="message">{state.message}</p>
      </section>
    );
  }
  return <Done srcUrl={state.srcUrl} result={state.result} />;
}

function Done({ srcUrl, result }: { srcUrl: string; result: CheckImageResult }) {
  const shown = displayFor(result.verdict);
  const percent = result.ai_likelihood != null ? Math.round(result.ai_likelihood * 100) : null;
  const icon = shown.tone === 'ai' ? '✕' : shown.tone === 'ok' ? '✓' : '!';

  return (
    <>
      <section className="card" aria-live="polite">
        <div className="summary">
          <Ring percent={percent} tone={shown.tone} />
          <div>
            <p className="caption">{percent != null ? 'AI likelihood' : 'Result'}</p>
            <p className={`pill ${shown.tone}`}>
              <span aria-hidden="true">{icon}</span> {shown.text}
            </p>
          </div>
        </div>
        <p className="message">{result.message}</p>
        {srcUrl && <img className="thumb" src={srcUrl} alt="The picture you checked" />}
      </section>

      <div className="section-head">
        <h2>What we found</h2>
        <span className="count">
          {result.signals.length} {result.signals.length === 1 ? 'signal' : 'signals'}
        </span>
      </div>
      {result.signals.length > 0 ? (
        <ul className="signals">
          {result.signals.map((s) => (
            <li key={s.label} className="signal">
              <span className="signal-icon" aria-hidden="true">
                i
              </span>
              <div>
                <strong>{s.label}</strong>
                <p>{s.explanation}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="hint">Nothing in the picture's file says how it was made.</p>
      )}

      <h2>Checked against</h2>
      <ul className="chips">
        <li>Content Credentials (C2PA)</li>
        <li>AI labels in the file</li>
        {result.platformLabel && <li>The site's own AI label</li>}
      </ul>

      <h2>Before you share</h2>
      <ul className="actions">
        {canSearch(srcUrl) && (
          <>
            <li>
              <a className="button" href={tinEyeUrl(srcUrl)} target="_blank" rel="noreferrer">
                Find the original source
              </a>
            </li>
            <li>
              <a className="button" href={googleLensUrl(srcUrl)} target="_blank" rel="noreferrer">
                Reverse image search
              </a>
            </li>
          </>
        )}
        <li>
          <a className="button" href={GUIDE_LINKS.imageChecklist} target="_blank" rel="noreferrer">
            What should I look for?
          </a>
        </li>
      </ul>
    </>
  );
}

/** Circle showing the AI likelihood, or "?" when there's no evidence either way. */
function Ring({ percent, tone }: { percent: number | null; tone: string }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" aria-hidden="true">
      <svg viewBox="0 0 80 80" width="80" height="80">
        <circle cx="40" cy="40" r={r} className="ring-track" />
        {percent != null && (
          <circle
            cx="40"
            cy="40"
            r={r}
            className={`ring-value ${tone}`}
            strokeDasharray={`${(percent / 100) * c} ${c}`}
            transform="rotate(-90 40 40)"
          />
        )}
      </svg>
      <span className="ring-number">{percent != null ? `${percent}%` : '?'}</span>
    </div>
  );
}

function shortUrl(url: string) {
  try {
    const u = new URL(url);
    return (u.host + u.pathname).replace(/\/$/, '');
  } catch {
    return url;
  }
}
