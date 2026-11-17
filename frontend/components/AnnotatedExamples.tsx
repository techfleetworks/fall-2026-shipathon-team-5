import ZoomableImage from "@/components/ZoomableImage";
import { exampleImage, type Note, type PlatformExamples } from "@/lib/content/platformExamples";

function Notes({ notes, columns = false }: { notes: Note[]; columns?: boolean }) {
  return (
    <ol className={columns ? "grid gap-5 sm:grid-cols-2" : "space-y-5"}>
      {notes.map((n, i) => (
        <li key={i} className="flex gap-3">
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-label font-semibold text-on-primary"
          >
            {i + 1}
          </span>
          <div>
            <p className="font-semibold">{n.title}</p>
            <p className="text-body-sm text-ink-muted">{n.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

// Two annotated boxes for a platform guide: the browser view (picture on top,
// notes below) and the phone view (phone, notes, then the Veritas quick check).
// Every picture opens full size with "Click to zoom".
export default function AnnotatedExamples({ slug, examples }: { slug: string; examples: PlatformExamples }) {
  const { browser, mobile } = examples;
  return (
    <div className="space-y-6">
      <figure className="rounded-card border border-line bg-surface p-6">
        <figcaption className="mb-4 font-semibold">In a web browser</figcaption>
        <div className="overflow-hidden rounded-image border border-line">
          <ZoomableImage
            src={exampleImage(slug, "browser")}
            alt={browser.alt}
            caption="In a web browser"
            aspectClass="aspect-[64/45]"
            sizes="(min-width: 1024px) 712px, 100vw"
          />
        </div>
        <div className="mt-6">
          <Notes notes={browser.notes} columns />
        </div>
      </figure>

      <figure className="rounded-card border border-line bg-surface p-6">
        <figcaption className="mb-4 font-semibold">On your phone</figcaption>
        <div className="grid items-center gap-8 sm:grid-cols-[minmax(0,200px)_1fr] md:grid-cols-[minmax(0,190px)_1fr_minmax(0,190px)]">
          <div className="mx-auto w-full max-w-[200px] overflow-hidden rounded-[24px]">
            <ZoomableImage
              src={exampleImage(slug, "mobile")}
              alt={mobile.alt}
              caption="On your phone"
              aspectClass="aspect-[8/17]"
              sizes="200px"
            />
          </div>
          <Notes notes={mobile.notes} />
          <div className="mx-auto w-full max-w-[200px] overflow-hidden rounded-[24px] sm:col-span-2 md:col-span-1">
            <p className="sr-only">Then check it with Veritas:</p>
            <ZoomableImage
              src={exampleImage(slug, "mobile-check")}
              alt={mobile.checkAlt}
              caption="Checking it with Veritas"
              aspectClass="aspect-[195/422]"
              sizes="200px"
            />
          </div>
        </div>
      </figure>
    </div>
  );
}
