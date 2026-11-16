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
    // Bring the whole quiz into view (picture, answer and result), then move
    // keyboard and screen reader focus to the result without scrolling again.
    requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ block: "start" });
      feedbackRef.current?.focus({ preventScroll: true });
    });
  };

  const next = () => {
    if (step + 1 >= total) setDone(true);
    else {
      setStep((s) => s + 1);
      setPicked(null);
    }
    requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ block: "start" });
      topRef.current?.focus({ preventScroll: true });
    });
  };

  const restart = () => {
    setOrder(shuffle(startOrder));
    setStep(0);
    setPicked(null);
    setScore(0);
    setDone(false);
    requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ block: "start" });
      topRef.current?.focus({ preventScroll: true });
    });
  };

  // Style for the Real / AI-generated buttons, depending on what was picked.
  const answerClass = (option: QuizAnswer) => {
    const base =
      "flex min-h-12 items-center justify-center gap-2 rounded-control border-2 px-3 text-body font-semibold transition-colors";
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
      <div
        ref={topRef}
        tabIndex={-1}
        // scroll-mt leaves room for the sticky header on phones
        className="flex scroll-mt-20 items-center gap-2 outline-none lg:scroll-mt-4"
      >
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
        <section className="mt-4 rounded-card border border-line bg-surface p-6 md:p-8">
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
          {/* The picture shrinks on shorter screens so the answer and result fit
              without scrolling. "contain" keeps the whole photo visible. */}
          <div className="mt-4 overflow-hidden rounded-image">
            <ZoomableImage
              key={q.image}
              src={q.image}
              alt={q.alt}
              caption={`Image ${step + 1} of ${total}`}
              aspectClass="h-[min(calc((100vw-3rem)*2/3),calc(100dvh-27rem))] min-h-32 md:h-[min(calc((100vw-3rem)*2/3),calc(100dvh-25rem),600px)]"
              fit="contain"
              sizes="(min-width: 1024px) 900px, 100vw"
            />
          </div>

          <fieldset className="mt-3">
            <legend className="sr-only">Is this image real or AI-generated?</legend>
            <div className="grid grid-cols-2 gap-3">
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
            <section className="mt-3 rounded-card border border-line bg-surface p-4 md:p-5">
              <h2
                ref={feedbackRef}
                tabIndex={-1}
                className={`font-heading text-body font-bold outline-none sm:text-body-lg md:text-h5 ${
                  isCorrect ? "text-authentic-text" : "text-misleading-text"
                }`}
              >
                {isCorrect ? q.correct : q.incorrect}
              </h2>
              {/* The explanation only shows after a wrong answer. */}
              {!isCorrect && <p className="mt-1 text-body-sm text-ink-muted md:text-body">{q.explanation}</p>}
              <div className="mt-3">
                <Button onClick={next}>{step + 1 >= total ? "See your score" : "Next image"}</Button>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
