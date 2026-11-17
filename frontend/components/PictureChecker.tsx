"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import VerdictBadge from "@/components/ui/VerdictBadge";
import {
  ACCEPTED_TYPES,
  CheckError,
  MAX_BYTES,
  checkImage,
  type ImageCheckResult,
} from "@/lib/api";

// Upload a picture and show what Veritas found, in plain language.
// The backend's verdicts map onto the site's three verdict badges.
const VERDICTS = {
  likely_ai: { badge: "misleading", label: "Likely made with AI" },
  uncertain: { badge: "uncertain", label: "We can't tell" },
  likely_real: { badge: "authentic", label: "Likely a real photo" },
} as const;

type State =
  | { step: "idle" }
  | { step: "checking"; slow: boolean }
  | { step: "done"; result: ImageCheckResult }
  | { step: "error"; message: string };

export default function PictureChecker() {
  const inputId = useId();
  const hintId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const controller = useRef<AbortController | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [state, setState] = useState<State>({ step: "idle" });

  // Free the preview image's memory when it changes or the page closes.
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  // Stop a check that's still running if the visitor leaves the page.
  useEffect(() => () => controller.current?.abort(), []);

  // Move keyboard and screen reader focus to the answer when it arrives.
  useEffect(() => {
    if (state.step === "done") resultRef.current?.focus();
    if (state.step === "error") errorRef.current?.focus();
  }, [state.step]);

  function choose(chosen: File | undefined) {
    controller.current?.abort();
    setState({ step: "idle" });
    if (!chosen) return;
    if (!ACCEPTED_TYPES.includes(chosen.type)) {
      setFile(null);
      setPreview(null);
      setState({ step: "error", message: "Please choose a picture in JPG, PNG or WEBP format." });
      return;
    }
    if (chosen.size > MAX_BYTES) {
      setFile(null);
      setPreview(null);
      setState({ step: "error", message: "This picture is too large. Please choose one under 10 MB." });
      return;
    }
    setFile(chosen);
    setPreview(URL.createObjectURL(chosen));
  }

  async function check() {
    if (!file) return;
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setState({ step: "checking", slow: false });
    // After a few seconds, explain that the first check can be slow.
    const slowTimer = setTimeout(
      () => setState((s) => (s.step === "checking" ? { step: "checking", slow: true } : s)),
      6000
    );
    try {
      const result = await checkImage(file, current.signal);
      setState({ step: "done", result });
    } catch (error) {
      if (current.signal.aborted) return;
      setState({
        step: "error",
        message: error instanceof CheckError ? error.message : "Something went wrong. Please try again.",
      });
    } finally {
      clearTimeout(slowTimer);
    }
  }

  function startOver() {
    controller.current?.abort();
    setFile(null);
    setPreview(null);
    setState({ step: "idle" });
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.focus();
  }

  const checking = state.step === "checking";

  return (
    <div className="rounded-card border border-line bg-surface p-6 md:p-8">
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <label htmlFor={inputId} className="block font-heading text-h5 font-bold">
            1. Choose a picture
          </label>
          <p id={hintId} className="mt-2 text-body text-ink-muted">
            A photo or screenshot saved on your device: JPG, PNG or WEBP, up to 10 MB.
          </p>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            aria-describedby={hintId}
            disabled={checking}
            onChange={(e) => choose(e.target.files?.[0])}
            className="mt-4 block w-full text-body file:mr-4 file:min-h-11 file:cursor-pointer file:rounded-control file:border file:border-line file:bg-canvas file:px-5 file:text-label file:font-semibold file:text-ink hover:file:bg-subtle"
          />

          <p className="mt-8 font-heading text-h5 font-bold">2. Check it</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {state.step !== "done" && (
              <Button onClick={check} disabled={!file || checking} className="disabled:cursor-not-allowed disabled:opacity-50">
                {checking ? "Checking…" : "Check this picture"}
              </Button>
            )}
            {(file || state.step !== "idle") && (
              <Button variant="outline" onClick={startOver}>
                {state.step === "done" ? "Check another picture" : "Start over"}
              </Button>
            )}
          </div>
          <p className="mt-4 text-body-sm text-ink-muted">
            We check your picture and don&rsquo;t keep it.
          </p>
        </div>

        <div>
          {preview ? (
            // A local preview of the visitor's own file, so a plain <img> is right here.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="The picture you chose"
              className="max-h-80 w-full rounded-image border border-line bg-canvas object-contain"
            />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-image border border-dashed border-line bg-canvas p-6 text-center text-body text-ink-muted">
              Your picture will appear here.
            </div>
          )}
        </div>
      </div>

      {/* Announced by screen readers as it changes. */}
      <div aria-live="polite" className="mt-8">
        {state.step === "checking" && (
          <p className="text-body-lg">
            Checking your picture…
            {state.slow && (
              <span className="mt-1 block text-body text-ink-muted">
                The first check can take up to a minute while the checker wakes up. Thanks for waiting.
              </span>
            )}
          </p>
        )}
      </div>

      {state.step === "error" && (
        <p
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="mt-2 rounded-card bg-misleading-soft p-4 text-body-lg text-misleading-text outline-none"
        >
          {state.message}
        </p>
      )}

      {state.step === "done" && <Result result={state.result} headingRef={resultRef} />}
    </div>
  );
}

function Result({
  result,
  headingRef,
}: {
  result: ImageCheckResult;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const verdict = VERDICTS[result.verdict];
  return (
    <section aria-labelledby="picture-result" className="mt-2 border-t border-line pt-8">
      <VerdictBadge verdict={verdict.badge}>{verdict.label}</VerdictBadge>
      <h3
        id="picture-result"
        ref={headingRef}
        tabIndex={-1}
        className="mt-3 font-heading text-h4 font-bold outline-none"
      >
        {result.message}
      </h3>

      <h4 className="mt-8 text-label font-semibold uppercase tracking-wide text-ink-muted">
        What we found
      </h4>
      <ul className="mt-3 space-y-4">
        {result.signals.map((s) => (
          <li key={s.label} className="rounded-card bg-canvas p-4">
            <p className="text-body-lg font-semibold">{s.label}</p>
            <p className="mt-1 text-body text-ink-muted">{s.explanation}</p>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-body">
        No checker is perfect. Before you share, also{" "}
        <Link href="/tools-to-double-check/reverse-image-search" className="font-semibold underline">
          search for where the picture came from
        </Link>{" "}
        and look for the clues in our{" "}
        <Link href="/spot-the-slop/images-and-visuals" className="font-semibold underline">
          images checklist
        </Link>
        .
      </p>
    </section>
  );
}
