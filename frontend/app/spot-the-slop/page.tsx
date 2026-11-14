import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import HoaxCard from "@/components/HoaxCard";
import { findSection } from "@/lib/sitemap";
import { hoaxes } from "@/lib/content/hoaxes";
import { glossary } from "@/lib/content/glossary";

export const metadata: Metadata = { title: "Learn to spot the slop" };

// The four parts of this page. "id" is the #anchor other pages link to.
const parts = [
  { id: "checklists", label: "Checklists" },
  { id: "ai-on-your-feed", label: "AI on your feed" },
  { id: "viral-hoaxes", label: "Real-life AI hoaxes" },
  { id: "glossary", label: "AI terms glossary" },
];

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export default function Page() {
  const section = findSection("/spot-the-slop");
  const checklists = section.children.filter((p) => p.group === "checklists");
  const platforms = section.children.filter((p) => p.group === "platforms");

  return (
    <main className="flex-1">
      {/* Page title and jump links */}
      <section className="pt-16 pb-12">
        <Container>
          <h1 className="font-heading text-h2 font-bold md:text-h1">{section.title}</h1>
          <p className="mt-4 max-w-2xl text-body-lg text-ink-muted">{section.description}</p>
          <nav aria-label="On this page" className="mt-8">
            <ul className="flex flex-wrap gap-2">
              {parts.map((part) => (
                <li key={part.id}>
                  <a
                    href={`#${part.id}`}
                    className="flex min-h-11 items-center rounded-control border border-line bg-surface px-4 text-label font-semibold hover:border-primary hover:bg-primary hover:text-on-primary"
                  >
                    {part.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </section>

      {/* Checklists */}
      <section id="checklists" className="scroll-mt-20 bg-surface py-16">
        <Container>
          <h2 className="font-heading text-h3 font-bold md:text-h2">
            Checklists for spotting AI-generated content
          </h2>
          <p className="mt-3 max-w-2xl text-body-lg text-ink-muted">
            Different media types have different tells.
          </p>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {checklists.map((page) => (
              <li key={page.href}>
                <Link
                  href={page.href}
                  className="block h-full rounded-card border border-line bg-canvas p-6 hover:border-ink"
                >
                  <span className="text-caption font-medium text-ink-muted">Checklist</span>
                  <span className="mt-1 block font-heading text-h4 font-bold">
                    {/* "Checklist: audio and voice" -> "Audio and voice" */}
                    {capitalize(page.title.replace("Checklist: ", ""))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* AI on your feed */}
      <section id="ai-on-your-feed" className="scroll-mt-20 py-16">
        <Container>
          <h2 className="font-heading text-h3 font-bold md:text-h2">
            AI on your feed: What to check before you share
          </h2>
          <p className="mt-3 max-w-2xl text-body-lg text-ink-muted">
            Each app labels AI content differently.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {platforms.map((page) => (
              <li key={page.href}>
                <Link
                  href={page.href}
                  className="flex h-full items-center justify-between gap-4 rounded-card border border-line bg-surface p-6 hover:border-ink"
                >
                  <span className="font-heading text-h5 font-bold">{page.shortTitle}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Real-life AI hoaxes (moved from the home page) */}
      <section id="viral-hoaxes" className="scroll-mt-20 bg-surface py-16">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-h3 font-bold md:text-h2">
                Real-life AI hoaxes that went viral
              </h2>
              <p className="mt-3 text-body-lg text-ink-muted">
                What happened, and the clue that would have caught it.
              </p>
            </div>
            <ButtonLink href="/spot-the-slop/viral-hoaxes" variant="outline">
              See all hoaxes
            </ButtonLink>
          </div>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {hoaxes.slice(0, 3).map((hoax) => (
              <li key={hoax.title}>
                <HoaxCard hoax={hoax} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* AI terms glossary */}
      <section id="glossary" className="scroll-mt-20 py-16">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-h3 font-bold md:text-h2">AI terms glossary</h2>
              <p className="mt-3 text-body-lg text-ink-muted">
                  Words commonly used on this site and elsewhere.
              </p>
            </div>
            <ButtonLink href="/spot-the-slop/glossary" variant="outline">
              See all terms
            </ButtonLink>
          </div>
          <dl className="mt-8 grid gap-4 md:grid-cols-2">
            {glossary.slice(0, 4).map((item) => (
              <div key={item.term} className="rounded-card border border-line bg-surface p-6">
                <dt className="font-heading text-h5 font-bold">{item.term}</dt>
                <dd className="mt-2 text-body text-ink-muted">{item.definition}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>
    </main>
  );
}
