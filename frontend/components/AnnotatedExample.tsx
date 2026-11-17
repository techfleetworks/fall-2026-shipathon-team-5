import Image from "next/image";
import type { Annotation } from "@/lib/content/platformGuides";

// The annotated example: a phone screenshot with numbered teal markers, and the
// matching notes beside it. With `example`, the screenshot (markers already drawn
// on it) is shown; without it, a grey placeholder phone with markers on top.
export default function AnnotatedExample({
  annotations,
  example,
}: {
  annotations: Annotation[];
  example?: { src: string; alt: string };
}) {
  return (
    <figure className="grid items-center gap-8 rounded-card border border-line bg-surface p-6 md:grid-cols-[minmax(0,300px)_1fr]">
      {example ? (
        <Image
          src={example.src}
          alt={example.alt}
          width={390}
          height={844}
          sizes="300px"
          className="mx-auto h-auto w-full max-w-[300px]"
        />
      ) : (
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
              style={{ left: `${a.x ?? 50}%`, top: `${a.y ?? 50}%` }}
            >
              {i + 1}
            </span>
          ))}
        </div>
      )}

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
