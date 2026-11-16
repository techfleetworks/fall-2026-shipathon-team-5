import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import GlossaryBrowser from "@/components/GlossaryBrowser";
import { glossary } from "@/lib/content/glossary";

export const metadata: Metadata = { title: "AI terms glossary" };

// A to Z, so new terms can be added anywhere in lib/content/glossary.ts.
const sortedTerms = [...glossary].sort((a, b) => a.term.localeCompare(b.term));

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
        <div className="mt-10">
          <GlossaryBrowser terms={sortedTerms} />
        </div>
      </Container>
    </main>
  );
}
