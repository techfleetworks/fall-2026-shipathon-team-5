import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import HoaxCard from "@/components/HoaxCard";
import PlatformCard from "@/components/PlatformCard";
import ChecklistCard from "@/components/ChecklistCard";
import { findSection } from "@/lib/sitemap";
import { featuredHoaxes, hoaxSizers } from "@/lib/content/hoaxes";
import { glossary } from "@/lib/content/glossary";
import { platforms } from "@/lib/content/platforms";
import { checklists } from "@/lib/content/checklists";
import { reverseSearchSummary } from "@/lib/content/reverseSearch";

export const metadata: Metadata = { title: "Learn to spot the slop" };

// The five parts of this page. "id" is the #anchor other pages link to.
const parts = [
  { id: "checklists", label: "Checklists" },
  { id: "ai-on-your-feed", label: "AI on your feed" },
  { id: "reverse-image-search", label: "Reverse image search" },
  { id: "viral-hoaxes", label: "Real-life AI hoaxes" },
  { id: "glossary", label: "AI terms glossary" },
];

const featuredSizers = hoaxSizers(featuredHoaxes);

export default function Page() {
  const section = findSection("/spot-the-slop");
  const checklistPages = section.children.filter((p) => p.group === "checklists");

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
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {checklistPages.map((page) => (
              <li key={page.href}>
                <ChecklistCard
                  href={page.href}
                  checklist={checklists[page.href.replace("/spot-the-slop/", "")]}
                />
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
          {/* auto-rows-fr makes every row, and so every card, the same height */}
          <ul className="mt-8 grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {platforms.map((platform) => (
              <li key={platform.slug}>
                <PlatformCard platform={platform} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* How to do a reverse image search (moved from Tools to double-check) */}
      <section id="reverse-image-search" className="scroll-mt-20 bg-surface py-16">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-h3 font-bold md:text-h2">
                How to do a reverse image search
              </h2>
              <p className="mt-3 max-w-2xl text-body-lg text-ink-muted">{reverseSearchSummary.intro}</p>
            </div>
            <ButtonLink href="/spot-the-slop/reverse-image-search" variant="outline-teal">
              Read the step-by-step guide
            </ButtonLink>
          </div>
          <ul className="mt-8 max-w-3xl space-y-4">
            {reverseSearchSummary.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3 text-body-lg">
                <span aria-hidden="true" className="mt-2.5 size-2.5 shrink-0 rounded-full bg-primary" />
                {bullet}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Real-life AI hoaxes (moved from the home page) */}
      <section id="viral-hoaxes" className="scroll-mt-20 py-16">
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
            <ButtonLink href="/spot-the-slop/viral-hoaxes" variant="outline-teal">
              See all hoaxes
            </ButtonLink>
          </div>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {featuredHoaxes.map((hoax) => (
              <li key={hoax.title}>
                <HoaxCard hoax={hoax} sizers={featuredSizers} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* AI terms glossary */}
      <section id="glossary" className="scroll-mt-20 bg-surface py-16">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-h3 font-bold md:text-h2">AI terms glossary</h2>
              <p className="mt-3 text-body-lg text-ink-muted">
                  Words commonly used on this site and elsewhere.
              </p>
            </div>
            <ButtonLink href="/spot-the-slop/glossary" variant="outline-teal">
              See all terms
            </ButtonLink>
          </div>
          <dl className="mt-8 grid gap-4 md:grid-cols-2">
            {glossary.slice(0, 4).map((item) => (
              <div key={item.term} className="rounded-card border border-line bg-canvas p-6">
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
