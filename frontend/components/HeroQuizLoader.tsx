"use client";

import dynamic from "next/dynamic";

// Loads the hero quiz in the browser only, so the random images don't clash with
// the server-rendered page. A dark box holds the space while it loads.
const HeroQuiz = dynamic(() => import("@/components/HeroQuiz"), {
  ssr: false,
  loading: () => (
    <div>
      <div className="h-[22px]" />
      <div className="mt-3 aspect-[3/2] rounded-image bg-deep-raised" />
      <div className="mt-3 h-11" />
      <div className="mt-3 h-11" />
    </div>
  ),
});

export default function HeroQuizLoader() {
  return <HeroQuiz />;
}
