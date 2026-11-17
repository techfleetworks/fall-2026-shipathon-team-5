import Image from "next/image";
import { exampleResults } from "@/lib/content/reverseSearch";

// A drawn example of reverse image search results (not a real search).
export default function ReverseSearchExample() {
  const { photo, fileName, results, takeaway } = exampleResults;
  const thumb = (
    <Image src={photo} alt="" width={72} height={40} className="h-8 w-14 shrink-0 rounded-image object-cover sm:h-10 sm:w-[72px]" />
  );

  return (
    <figure className="rounded-card border border-line bg-surface p-5 md:p-6">
      <figcaption className="font-semibold">What the results tell you</figcaption>

      {/* The photo being searched */}
      <div className="mt-4 flex items-center gap-3 rounded-card bg-canvas px-4 py-3 text-body-sm text-ink-muted">
        {thumb}
        <span>
          {fileName} <span aria-hidden="true">·</span> sorted by oldest
        </span>
      </div>

      <ol className="mt-3 space-y-3" aria-label="Search results, oldest first">
        {results.map((r) => (
          <li
            key={r.when}
            className={`flex items-center gap-3 rounded-card px-3 py-3 sm:gap-4 sm:px-4 ${r.oldest ? "bg-authentic-soft" : "bg-canvas"}`}
          >
            {thumb}
            <div className="min-w-0 flex-1">
              {/* On phones the badge sits above the text so it doesn't squeeze it */}
              {r.oldest && (
                <span className="mb-1 inline-block rounded-card bg-authentic-text px-2 py-0.5 text-caption font-semibold text-inverse sm:hidden">
                  Oldest match
                </span>
              )}
              <p className="text-body-sm text-ink-muted">
                {r.when} <span aria-hidden="true">·</span> {r.where}
              </p>
              <p className="font-medium">{r.what}</p>
            </div>
            {r.oldest && (
              <span className="hidden shrink-0 rounded-card bg-authentic-text px-2 py-1 text-caption font-semibold text-inverse sm:inline-block">
                Oldest match
              </span>
            )}
          </li>
        ))}
      </ol>

      <p className="mt-4 text-body-sm text-ink-muted">{takeaway}</p>
    </figure>
  );
}
