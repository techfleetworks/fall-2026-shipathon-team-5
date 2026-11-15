import Link from "next/link";
import { termId } from "@/lib/content/glossary";

// "AI terms on this page": chips that link to each term on the glossary page.
export default function TermsBox({ terms }: { terms: string[] }) {
  return (
    <div className="rounded-card border border-line bg-surface p-5 lg:sticky lg:top-6">
      <h2 className="text-label font-semibold">AI terms on this page</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {terms.map((term) => (
          <li key={term}>
            <Link
              href={`/spot-the-slop/glossary#${termId(term)}`}
              className="inline-flex min-h-9 items-center gap-2 rounded-card bg-subtle px-3 text-body-sm font-medium hover:bg-line"
            >
              <span aria-hidden="true" className="size-2.5 rounded-full bg-ink" />
              {term}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
