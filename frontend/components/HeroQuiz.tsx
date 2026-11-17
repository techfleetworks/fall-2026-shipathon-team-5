"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { quizQuestions, type QuizAnswer } from "@/lib/content/quiz";

const ROUNDS = 3;

// Three random questions from the full quiz.
const pickRandom = () =>
  [...quizQuestions.keys()]
    .map((i) => ({ i, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .slice(0, ROUNDS)
    .map(({ i }) => i);

const RESULT: Record<QuizAnswer, { right: string; wrong: string }> = {
  ai: { right: "Correct. This image is AI-generated.", wrong: "Not quite. This image is AI-generated." },
  real: { right: "Correct. This image is a real photo.", wrong: "Not quite. This image is a real photo." },
};

// The short "Real or AI?" game in the home page hero. It only runs in the browser
// (see HeroQuizLoader), so each visitor gets a different set of images.
export default function HeroQuiz() {
  const [picks, setPicks] = useState(pickRandom);
  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState<QuizAnswer | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = quizQuestions[picks[round]];
  const right = answer === q.answer;

  const choose = (a: QuizAnswer) => {
    if (answer) return;
    setAnswer(a);
    if (a === q.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (round + 1 >= ROUNDS) setDone(true);
    else {
      setRound((r) => r + 1);
      setAnswer(null);
    }
  };

  const restart = () => {
    setPicks(pickRandom());
    setRound(0);
    setAnswer(null);
    setScore(0);
    setDone(false);
  };

  const buttonClass = (option: QuizAnswer) => {
    const base =
      "flex min-h-11 items-center justify-center gap-1.5 rounded-control text-label font-semibold transition-colors";
    if (!answer) return `${base} bg-deep-raised hover:bg-primary hover:text-on-primary`;
    if (option === answer) return `${base} text-inverse ${right ? "bg-authentic-text" : "bg-misleading-text"}`;
    return `${base} bg-deep-raised text-inverse-muted`;
  };

  // Every state uses the same frame (header, 3:2 picture area, button row, result row),
  // so the hero keeps the same height from the first image to the score.
  const header = (
    <div className="flex justify-between text-body-sm">
      <span className="font-semibold">Real or AI?</span>
      <span className="text-inverse-muted">{done ? "Finished" : `Round ${round + 1} of ${ROUNDS}`}</span>
    </div>
  );

  if (done) {
    return (
      <div>
        {header}
        <div className="mt-3 flex aspect-[3/2] flex-col justify-center rounded-image bg-deep-raised p-8">
          <p className="font-heading text-h3 font-bold">
            You got {score} of {ROUNDS} right.
          </p>
          <p className="mt-2 text-body text-inverse-muted">Want to go further? The full quiz has 10 images.</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            href="/quiz-your-skills"
            className="flex min-h-11 items-center justify-center rounded-control bg-primary text-label font-semibold text-on-primary"
          >
            Take the full quiz
          </Link>
          <button
            type="button"
            onClick={restart}
            className="flex min-h-11 items-center justify-center rounded-control bg-deep-raised text-label font-semibold hover:bg-[#33363c]"
          >
            Play again
          </button>
        </div>
        <div className="mt-3 h-11" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div>
      {header}
      <div className="relative mt-3 aspect-[3/2] overflow-hidden rounded-image bg-deep-raised">
        <Image src={q.image} alt={q.alt} fill sizes="448px" className="object-cover" priority />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2" role="group" aria-label="Is this image real or AI-generated?">
        {(["real", "ai"] as QuizAnswer[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => choose(option)}
            disabled={answer !== null}
            aria-pressed={answer === option}
            className={buttonClass(option)}
          >
            {answer === option && <span aria-hidden="true">{right ? "✓" : "✕"}</span>}
            {option === "real" ? "Real" : "AI-generated"}
          </button>
        ))}
      </div>

      {/* Result: green when right, red when wrong. Always word + icon, never colour alone. */}
      <div className="mt-3 flex h-11 items-center justify-between gap-3" aria-live="polite">
        {answer && (
          <>
            <span
              className={`inline-flex min-w-0 items-center gap-1.5 rounded-card px-2 py-1 text-caption font-semibold ${
                right ? "bg-authentic-soft text-authentic-text" : "bg-misleading-soft text-misleading-text"
              }`}
            >
              <span aria-hidden="true">{right ? "✓" : "✕"}</span>
              {right ? RESULT[q.answer].right : RESULT[q.answer].wrong}
            </span>
            <button
              type="button"
              onClick={next}
              className="inline-flex min-h-11 shrink-0 items-center rounded-control bg-primary px-4 text-label font-semibold text-on-primary"
            >
              {round + 1 >= ROUNDS ? "See your score" : "Next image"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
