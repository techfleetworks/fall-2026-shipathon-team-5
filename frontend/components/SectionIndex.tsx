import Link from "next/link";
import { findSection } from "@/lib/sitemap";
import Container from "@/components/ui/Container";

// Landing page for a top-level section: title, intro and a card per sub-page.
export default function SectionIndex({ href }: { href: string }) {
  const section = findSection(href);
  return (
    <main className="flex-1 py-16">
      <Container>
        <h1 className="font-heading text-h2 font-bold md:text-h1">{section.title}</h1>
        <p className="mt-4 max-w-2xl text-body-lg text-ink-muted">{section.description}</p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {section.children.map((page, i) => (
            <li key={page.href}>
              <Link
                href={page.href}
                className="block h-full rounded-card border border-line bg-surface p-6 hover:border-ink"
              >
                <span className="text-caption font-medium text-ink-muted">
                </span>
                <span className="mt-1 block font-heading text-h4 font-bold">{page.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </main>
  );
}
