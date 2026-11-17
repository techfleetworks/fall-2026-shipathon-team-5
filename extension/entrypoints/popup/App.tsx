import { useEffect, useState } from 'react';
import { lastCheck } from '@/utils/storage';
import type { CheckState } from '@/utils/types';
import { NEXT_STEPS, displayFor } from '@/utils/verdicts';

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
      <p className="footnote">No checker is perfect. Always check where a picture came from.</p>
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
  if (state.status === 'checking') {
    return (
      <section className="card" aria-live="polite">
        Checking this image…
        <p className="hint">The first check can take up to a minute while the server wakes up.</p>
      </section>
    );
  }
  if (state.status === 'error') return <section className="card" role="alert">{state.message}</section>;

  const { result } = state;
  const shown = displayFor(result.verdict);
  return (
    <>
      <section className="card">
        {state.srcUrl && <img className="thumb" src={state.srcUrl} alt="The picture you checked" />}
        <p className={`pill ${shown.tone}`}>{shown.text}</p>
        <p className="message">{result.message}</p>
      </section>
      <h2>What we found</h2>
      <ul className="signals">
        {result.signals.map((s) => (
          <li key={s.label} className="signal">
            <strong>{s.label}</strong>
            <p>{s.explanation}</p>
          </li>
        ))}
      </ul>
      <h2>Before you share</h2>
      <ul className="next">
        {NEXT_STEPS.map((step) => (
          <li key={step.href}>
            <a className="button" href={step.href} target="_blank" rel="noreferrer">
              {step.label}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
