"use client";

import { useRef, useState } from "react";
import { quizQuestions, startOrder, type QuizAnswer } from "@/lib/content/quiz";
import ZoomableImage from "@/components/ZoomableImage";
import { Button, ButtonLink } from "@/components/ui/Button";

const shuffle = (list: number[]) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const LABELS: Record<QuizAnswer, string> = { real: "Real", ai: "AI-generated" };

export default function Quiz() {
  const [order, setOrder] = useState(startOrder);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<QuizAnswer | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const feedbackRef = useRef<HTMLHeadingElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const total = order.length;
  const q = quizQuestions[order[step]];
  const isCorrect = picked === q.answer;

  const choose = (answer: QuizAnswer) => {
    if (picked) return;
    setPicked(answer);
    if (answer === q.answer) setScore((s) => s + 1);
    // Move keyboard and screen reader focus to the result.
    requestAnimationFrame(() => feedbackRef.current?.focus());
  };

  const next = () => {
    if (step + 1 >= total) setDone(true);
    else {
      setStep((s) => s + 1);
      setPicked(null);
    }
    requestAnimationFrame(() => topRef.current?.focus());
  };

  const restart = () => {
    setOrder(shuffle(startOrder));
    setStep(0);
    setPicked(null);
    setScore(0);
    setDone(false);
    requestAnimationFrame(() => topRef.current?.focus());
  };

  // Style for the Real / AI-generated buttons, depending on what was picked.
  const answerClass = (option: QuizAnswer) => {
    const base =
      "flex min-h-16 items-center justify-center gap-2 rounded-control border-2 px-4 text-body-lg font-semibold transition-colors";
    if (!picked) return `${base} border-line bg-surface hover:border-primary hover:bg-primary hover:text-on-primary`;
    if (option === picked)
      return `${base} text-inverse ${isCorrect ? "border-authentic-text bg-authentic-text" : "border-misleading-text bg-misleading-text"}`;
    if (option === q.answer) return `${base} border-authentic-text bg-surface text-authentic-text`;
    return `${base} border-line bg-surface text-ink-muted`;
  };

  const answerIcon = (option: QuizAnswer) => {
    if (!picked) return null;
    if (option === picked) return <span aria-hidden="true">{isCorrect ? "✓" : "✕"}</span>;
    if (option === q.answer) return <span aria-hidden="true">✓</span>;
    return null;
  };

  return (
    <div>
      {/* Progress: one bar per image */}
      <div ref={topRef} tabIndex={-1} className="flex items-center gap-2 outline-none">
        <div className="flex flex-1 gap-1.5" aria-hidden="true">
          {order.map((_, i) => (
            <span
              key={i}
              className={`h-2 flex-1 rounded-full ${
                done || i < step || (i === step && picked) ? "bg-ink" : "bg-line"
              }`}
            />
          ))}
        </div>
        <p className="shrink-0 text-body-sm font-medium text-ink-muted">
          {done ? "Finished" : `Image ${step + 1} of ${total}${picked ? " · Answer" : ""}`}
        </p>
      </div>

      {done ? (
        <section className="mt-8 rounded-card border border-line bg-surface p-8">
          <h2 className="font-heading text-h3 font-bold">
            You got {score} of {total} right.
          </h2>
          <p className="mt-3 text-body-lg text-ink-muted">
            {score === total
              ? "Perfect score. You have a sharp eye."
              : score >= total * 0.7
                ? "Nice work. Keep practising to catch the trickier ones."
                : "AI images are getting harder to spot. The checklists can help you know what to look for."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={restart}>Play again</Button>
            <ButtonLink href="/spot-the-slop#checklists" variant="outline-teal">
              See the checklists
            </ButtonLink>
          </div>
        </section>
      ) : (
        <>
          <div className="mt-8 overflow-hidden rounded-image">
            <ZoomableImage
              key={q.image}
              src={q.image}
              alt={q.alt}
              caption={`Image ${step + 1} of ${total}`}
              aspectClass="aspect-[3/2]"
              sizes="(min-width: 1024px) 900px, 100vw"
            />
          </div>

          <fieldset className="mt-6">
            <legend className="sr-only">Is this image real or AI-generated?</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {(["real", "ai"] as QuizAnswer[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => choose(option)}
                  disabled={picked !== null}
                  aria-pressed={picked === option}
                  className={answerClass(option)}
                >
                  {answerIcon(option)}
                  {LABELS[option]}
                  {picked === option && " (your answer)"}
                </button>
              ))}
            </div>
          </fieldset>

          {picked && (
            <section className="mt-6 rounded-card border border-line bg-surface p-6">
              <h2
                ref={feedbackRef}
                tabIndex={-1}
                className={`font-heading text-h5 font-bold outline-none ${
                  isCorrect ? "text-authentic-text" : "text-misleading-text"
                }`}
              >
                {isCorrect ? q.correct : q.incorrect}
              </h2>
              {/* The explanation only shows after a wrong answer. */}
              {!isCorrect && <p className="mt-2 text-body text-ink-muted">{q.explanation}</p>}
              <div className="mt-5">
                <Button onClick={next}>{step + 1 >= total ? "See your score" : "Next image"}</Button>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
