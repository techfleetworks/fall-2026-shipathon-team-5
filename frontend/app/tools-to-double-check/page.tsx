import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import ToolCard from "@/components/ToolCard";
import { findSection } from "@/lib/sitemap";
import { toolSections } from "@/lib/content/tools";

export const metadata: Metadata = { title: "Tools to double-check" };

// Same pattern as the Learn to spot the slop page: title, jump buttons, then
// sections that alternate between white and light grey backgrounds.
export default function Page() {
  const section = findSection("/tools-to-double-check");

  return (
    <main className="flex-1">
      {/* Page title and jump links */}
      <section className="pt-16 pb-12">
        <Container>
          <h1 className="font-heading text-h2 font-bold md:text-h1">{section.title}</h1>
          <p className="mt-4 max-w-2xl text-body-lg text-ink-muted">{section.description}</p>
          <nav aria-label="On this page" className="mt-8">
            <ul className="flex flex-wrap gap-2">
              {toolSections.map((part) => (
                <li key={part.id}>
                  <a
                    href={`#${part.id}`}
                    className="flex min-h-11 items-center rounded-control border border-line bg-surface px-4 text-label font-semibold hover:border-primary hover:bg-primary hover:text-on-primary"
                  >
                    {part.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </section>

      {toolSections.map((part, i) => (
        <section
          key={part.id}
          id={part.id}
          // 1st, 3rd... sections are white; 2nd, 4th... show the page's light grey.
          className={`scroll-mt-20 py-16 ${i % 2 === 0 ? "bg-surface" : ""}`}
        >
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-heading text-h3 font-bold md:text-h2">{part.title}</h2>
                <p className="mt-3 max-w-2xl text-body-lg text-ink-muted">{part.intro}</p>
              </div>
              <ButtonLink href={part.guideHref} variant="outline-teal">
                {part.guideLabel}
              </ButtonLink>
            </div>
            {part.cards && (
              <ul
                className={`mt-8 grid gap-6 ${
                  part.cards.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
                }`}
              >
                {part.cards.map((card, j) => (
                  <li key={`${card.title}-${j}`}>
                    <ToolCard card={card} onGrey={i % 2 === 1} showImage={!part.hideImages} />
                  </li>
                ))}
              </ul>
            )}
            {part.bullets && (
              <ul className="mt-8 max-w-3xl space-y-4">
                {part.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3 text-body-lg">
                    <span aria-hidden="true" className="mt-2.5 size-2.5 shrink-0 rounded-full bg-primary" />
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </Container>
        </section>
      ))}
    </main>
  );
}
