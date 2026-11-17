import { useEffect, useState } from 'react';
import { lastCheck } from '@/utils/storage';
import type { CheckState, Signal } from '@/utils/types';

export default function App() {
  const [state, setState] = useState<CheckState | null>(null);

  useEffect(() => {
    lastCheck.getValue().then(setState);
    // Update live while a check is running.
    return lastCheck.watch(setState);
  }, []);

  return (
    <main>
      <header>
        <span className="logo" aria-hidden>V</span>
        <h1>Veritas</h1>
      </header>
      {state ? <Result state={state} /> : <Empty />}
      <p className="footnote">Veritas estimates likelihood, not certainty. Always check the source.</p>
    </main>
  );
}

function Empty() {
  return (
    <section className="card">
      <h2>Check an image</h2>
      <p>On X, Facebook or YouTube, point at a photo or video and click the <strong>Check</strong> button.</p>
      <p>On other sites, right-click a picture and choose <strong>Check with Veritas</strong>.</p>
    </section>
  );
}

function Result({ state }: { state: CheckState }) {
  if (state.status === 'checking') return <section className="card">Checking this image…</section>;
  if (state.status === 'error') return <section className="card" role="alert">{state.message}</section>;

  const { result } = state;
  const pct = result.likelihood == null ? null : Math.round(result.likelihood * 100);
  return (
    <>
      <section className="card">
        {state.srcUrl && <img className="thumb" src={state.srcUrl} alt="What you checked" />}
        <p className={`pill ${result.verdict}`}>{VERDICT_TEXT[result.verdict]}</p>
        {pct != null && <p>AI likelihood: <strong>{pct}%</strong></p>}
        {result.framesChecked && <p>Based on {result.framesChecked} frames from the video.</p>}
        {result.source === 'c2pa' && <p>This image carries signed Content Credentials.</p>}
      </section>
      <h2>What we found</h2>
      <ul className="signals">
        {result.signals.map((s, i) => <SignalRow key={i} signal={s} />)}
      </ul>
    </>
  );
}

function SignalRow({ signal }: { signal: Signal }) {
  const icon = { bad: '✕', warn: '!', good: '✓' }[signal.level];
  return (
    <li className={`signal ${signal.level}`}>
      <span className="icon" aria-hidden>{icon}</span>
      <div>
        <strong>{signal.title}</strong>
        <p>{signal.detail}</p>
      </div>
    </li>
  );
}

const VERDICT_TEXT: Record<string, string> = {
  verified_ai: 'Made with AI (signed or labeled)',
  likely_ai: 'Likely AI-generated',
  unclear: 'Unclear',
  likely_real: 'Likely not AI',
  verified_real: 'Signed by a camera',
};
