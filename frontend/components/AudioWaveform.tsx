"use client";

import { useRef, useState } from "react";

const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// Audio player drawn as a waveform. Bars that have played turn red.
// Click or drag on the waveform (or use the arrow keys on it) to jump around.
export default function AudioWaveform({
  title,
  src,
  peaks,
}: {
  title: string;
  src: string;
  peaks: number[];
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const progress = duration ? time / duration : 0;

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play();
    else audio.pause();
  };

  return (
    <figure className="rounded-card border border-line bg-surface p-6">
      <figcaption className="font-semibold">{title}</figcaption>

      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />

      <div className="relative mt-5">
        <div aria-hidden="true" className="flex h-20 items-center gap-[3px]">
          {peaks.map((p, i) => (
            <span
              key={i}
              className={`flex-1 rounded-full transition-colors ${
                (i + 0.5) / peaks.length <= progress ? "bg-misleading" : "bg-line"
              }`}
              style={{ height: `${Math.max(12, p * 100)}%` }}
            />
          ))}
        </div>
        {/* Invisible slider over the bars, so the waveform can be clicked, dragged or used with arrow keys */}
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={time}
          onChange={(e) => {
            const t = Number(e.target.value);
            if (audioRef.current) audioRef.current.currentTime = t;
            setTime(t);
          }}
          aria-label="Position in the recording"
          aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          className="inline-flex min-h-11 items-center rounded-control border border-line bg-surface px-5 text-label font-semibold hover:border-primary hover:bg-primary hover:text-on-primary"
        >
          {playing ? "Pause" : "Play recording"}
        </button>
        <span className="text-body-sm text-ink-muted tabular-nums">
          {formatTime(time)} / {formatTime(duration)}
        </span>
      </div>
    </figure>
  );
}
