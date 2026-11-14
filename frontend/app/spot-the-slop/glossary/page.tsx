import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { glossary } from "@/lib/content/glossary";

export const metadata: Metadata = { title: "AI terms glossary" };

export default function Page() {
  return (
    <main className="flex-1 py-12">
      <Container>
        <nav aria-label="Breadcrumb" className="text-body-sm text-ink-muted">
          <Link href="/spot-the-slop#glossary" className="hover:text-ink hover:underline">
            Learn to spot the slop
          </Link>
        </nav>
        <h1 className="mt-4 font-heading text-h2 font-bold md:text-h1">AI terms glossary</h1>
        <p className="mt-4 max-w-2xl text-body-lg text-ink-muted">
          The words you&apos;ll see on this site and in the news.
        </p>
        <dl className="mt-10 max-w-3xl border-t border-line">
          {glossary.map((item) => (
            <div key={item.term} id={item.term.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="border-b border-line py-6">
              <dt className="font-heading text-h5 font-bold">{item.term}</dt>
              <dd className="mt-2 text-body text-ink-muted">{item.definition}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </main>
  );
}
