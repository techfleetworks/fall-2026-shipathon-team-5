import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionTabs from "@/components/SectionTabs";
import ReverseSearchExample from "@/components/ReverseSearchExample";
import { findPage } from "@/lib/sitemap";
import TermsBox from "@/components/TermsBox";
import {
  howToSections,
  reverseSearchIntro,
  reverseSearchScenario,
  reverseSearchTerms,
} from "@/lib/content/reverseSearch";

export const metadata: Metadata = { title: "How to do a reverse image search" };

const HREF = "/tools-to-double-check/reverse-image-search";

const linkClass =
  "font-semibold underline underline-offset-2 hover:text-ink-muted";

export default function Page() {
  const { page, section } = findPage(HREF);

  return (
    <main className="flex-1 py-12">
      <Container>
        <nav aria-label="Breadcrumb" className="text-body-sm text-ink-muted">
          <ol className="flex flex-wrap gap-2">
            <li>
              <Link
                href={`${section.href}#reverse-image-search`}
                className="hover:text-ink hover:underline"
              >
                {section.title}
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li aria-current="page">{page.title}</li>
          </ol>
        </nav>

        <div className="mt-6">
          <SectionTabs section={section} page={page} />
        </div>

        <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,760px)_minmax(0,360px)] lg:justify-between">
          <article>
            <h1 className="font-heading text-h2 font-bold md:text-h1">
              {page.title}
            </h1>
            <p className="mt-6 text-body-lg text-ink-muted">
              {reverseSearchIntro}
            </p>
            <p className="mt-6 text-body-lg">{reverseSearchScenario}</p>

            <div className="mt-6">
              <ReverseSearchExample />
            </div>

            {howToSections.map((part) => {
              const List = part.numbered ? "ol" : "ul";
              return (
                <section key={part.title} className="mt-12">
                  <h2 className="flex items-center gap-3 font-heading text-h4 font-bold">
                    <span
                      aria-hidden="true"
                      className="size-3 shrink-0 rounded-full bg-primary"
                    />
                    {part.title}
                  </h2>
                  {part.intro && (
                    <p className="mt-3 text-body-lg">{part.intro}</p>
                  )}
                  <List className="mt-4 space-y-3">
                    {part.steps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-body-lg">
                        {part.numbered ? (
                          <span
                            aria-hidden="true"
                            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-label font-semibold text-on-primary"
                          >
                            {i + 1}
                          </span>
                        ) : (
                          <span
                            aria-hidden="true"
                            className="mt-2.5 size-2 shrink-0 rounded-full bg-ink"
                          />
                        )}
                        <span>
                          {step.lead && (
                            <strong className="font-semibold">
                              {step.lead}
                            </strong>
                          )}{" "}
                          {step.text}
                          {step.link && (
                            <>
                              {" "}
                              <a
                                href={step.link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={linkClass}
                              >
                                {step.link.label}
                                <span className="sr-only">
                                  {" "}
                                  (opens in a new tab)
                                </span>
                              </a>
                            </>
                          )}
                        </span>
                      </li>
                    ))}
                  </List>
                </section>
              );
            })}
          </article>

          <aside>
            <TermsBox terms={reverseSearchTerms} />
          </aside>
        </div>
      </Container>
    </main>
  );
}
