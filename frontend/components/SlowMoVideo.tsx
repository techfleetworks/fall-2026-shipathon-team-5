"use client";

import { useRef, useState } from "react";

const SPEEDS = [0.25, 0.5, 1];

// Video with buttons to slow it down, since deepfake glitches are easier to see slowed.
export default function SlowMoVideo({ title, src, poster }: { title: string; src: string; poster: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [speed, setSpeed] = useState(1);

  const changeSpeed = (s: number) => {
    setSpeed(s);
    if (videoRef.current) videoRef.current.playbackRate = s;
  };

  return (
    <figure className="rounded-card border border-line bg-surface p-6">
      <figcaption className="font-semibold">{title}</figcaption>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls
        playsInline
        preload="metadata"
        className="mt-4 aspect-video w-full rounded-image bg-deep"
        onPlay={(e) => (e.currentTarget.playbackRate = speed)}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Playback speed">
        <span className="mr-2 text-body-sm text-ink-muted">Speed:</span>
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={speed === s}
            onClick={() => changeSpeed(s)}
            className={`inline-flex min-h-11 min-w-14 items-center justify-center rounded-control border px-3 text-label font-semibold ${
              speed === s
                ? "border-primary bg-primary text-on-primary"
                : "border-line bg-surface hover:border-primary hover:bg-primary hover:text-on-primary"
            }`}
          >
            {s === 1 ? "Normal" : `${s}×`}
          </button>
        ))}
      </div>
    </figure>
  );
}
