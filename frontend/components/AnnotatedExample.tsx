import type { Annotation } from "@/lib/content/platformGuides";

// Placeholder for the annotated example: a phone-shaped image area with numbered
// teal markers, and the matching notes beside it. When a real screenshot is ready,
// swap the grey phone for an <Image> and keep the markers on top of it.
export default function AnnotatedExample({ annotations }: { annotations: Annotation[] }) {
  return (
    <figure className="grid items-center gap-8 rounded-card border border-line bg-surface p-6 md:grid-cols-[minmax(0,300px)_1fr]">
      <div
        role="img"
        aria-label="Example post (placeholder image)"
        className="relative mx-auto aspect-[9/16] w-full max-w-[300px] overflow-hidden rounded-[28px] bg-deep"
      >
        <span className="absolute inset-0 flex items-center justify-center text-body-sm text-inverse-muted">
          Example image coming soon
        </span>
        {annotations.map((a, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-surface bg-primary text-label font-semibold text-on-primary"
            style={{ left: `${a.x}%`, top: `${a.y}%` }}
          >
            {i + 1}
          </span>
        ))}
      </div>

      <figcaption>
        <ol className="space-y-5">
          {annotations.map((a, i) => (
            <li key={i} className="flex gap-3">
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-label font-semibold text-on-primary"
              >
                {i + 1}
              </span>
              <div>
                <p className="font-semibold">{a.title}</p>
                <p className="text-body-sm text-ink-muted">{a.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}
