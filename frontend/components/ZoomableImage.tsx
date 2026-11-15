"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  alt: string;
  caption?: string;
  position?: string; // object-position for the cropped preview
  sizes?: string;
};

const MIN = 1;
const MAX = 4;
const clamp = (n: number) => Math.min(MAX, Math.max(MIN, n));

// A cropped preview that opens the full photo in a pop-up. In the pop-up you can
// zoom (buttons, + / - keys, scroll wheel or double-click) and drag to look around.
export default function ZoomableImage({ src, alt, caption, position, sizes }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const zoomTo = useCallback((next: number) => {
    const s = clamp(next);
    setScale(s);
    if (s === 1) setOffset({ x: 0, y: 0 });
  }, []);

  const reset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  // Scroll-wheel zoom. Added by hand so it can stop the page from scrolling.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScale((s) => {
        const next = clamp(s * (e.deltaY < 0 ? 1.15 : 1 / 1.15));
        if (next === 1) setOffset({ x: 0, y: 0 });
        return next;
      });
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "+" || e.key === "=") zoomTo(scale + 0.5);
    if (e.key === "-") zoomTo(scale - 0.5);
    if (e.key === "0") reset();
  };

  const controlClass =
    "flex min-h-11 min-w-11 items-center justify-center rounded-control bg-deep-raised px-3 text-label font-semibold text-inverse hover:bg-[#33363c] disabled:opacity-40";

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="group relative block aspect-[2/1] w-full cursor-zoom-in bg-deep"
        aria-label={`Enlarge photo: ${alt}`}
      >
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes ?? "(min-width: 768px) 400px, 100vw"}
          className="object-cover"
          style={{ objectPosition: position ?? "center" }}
        />
        <span
          aria-hidden="true"
          className="absolute bottom-2 right-2 rounded-control bg-deep/80 px-2 py-1 text-caption font-medium text-inverse opacity-90 group-hover:opacity-100"
        >
          Click to zoom
        </span>
      </button>

      <dialog
        ref={dialogRef}
        onClose={reset}
        onKeyDown={onKeyDown}
        aria-label={caption ?? alt}
        className="fixed inset-0 m-0 h-dvh max-h-none w-dvw max-w-none border-0 bg-deep p-0 text-inverse backdrop:bg-black/70"
      >
        <div className="flex h-full flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-body-sm text-inverse-muted">{caption ?? alt}</p>
            <div className="flex gap-2">
              <button type="button" className={controlClass} onClick={() => zoomTo(scale - 0.5)} disabled={scale <= MIN} aria-label="Zoom out">
                −
              </button>
              <button type="button" className={controlClass} onClick={() => zoomTo(scale + 0.5)} disabled={scale >= MAX} aria-label="Zoom in">
                +
              </button>
              <button type="button" className={controlClass} onClick={reset} disabled={scale === 1}>
                Reset
              </button>
              <button type="button" className={controlClass} onClick={() => dialogRef.current?.close()}>
                Close
              </button>
            </div>
          </div>

          {/* The photo. Drag to move around when zoomed in; double-click to zoom. */}
          <div
            ref={stageRef}
            className={`relative flex-1 touch-none overflow-hidden ${scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
            onDoubleClick={() => (scale > 1 ? reset() : zoomTo(2.5))}
            onPointerDown={(e) => {
              if (scale === 1) return;
              drag.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!drag.current) return;
              setOffset({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y });
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
          >
            <div
              className="absolute inset-4 transition-transform duration-75"
              style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
            >
              <Image src={src} alt={alt} fill sizes="100vw" quality={90} className="object-contain" draggable={false} />
            </div>
          </div>

          <p className="p-3 text-center text-caption text-inverse-muted">
            Scroll or use + and − to zoom. Drag to look around. Press Esc to close.
          </p>
        </div>
      </dialog>
    </>
  );
}
