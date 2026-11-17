import Link from "next/link";
import { findPage } from "@/lib/sitemap";
import { platformGuides } from "@/lib/content/platformGuides";
import { termId } from "@/lib/content/glossary";
import Container from "@/components/ui/Container";
import SectionTabs from "@/components/SectionTabs";
import AnnotatedExample from "@/components/AnnotatedExample";

// Layout for each "AI on your feed" guide: title, annotated example, the four
// checks (with teal dots, not numbers) and an "AI terms on this page" box.
export default function PlatformGuidePage({ slug }: { slug: string }) {
  const href = `/spot-the-slop/ai-on-your-feed/${slug}`;
  const { page, section } = findPage(href);
  const guide = platformGuides[slug];

  return (
    <main className="flex-1 py-12">
      <Container>
        <nav aria-label="Breadcrumb" className="text-body-sm text-ink-muted">
          <ol className="flex flex-wrap gap-2">
            <li>
              <Link href="/spot-the-slop#ai-on-your-feed" className="hover:text-ink hover:underline">
                {section.title}
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li aria-current="page">{page.shortTitle ?? page.title}</li>
          </ol>
        </nav>

        <div className="mt-6">
          <SectionTabs section={section} page={page} />
        </div>

        <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,760px)_minmax(0,360px)] lg:justify-between">
          <article>
            <p className="text-label font-semibold">AI on your feed</p>
            <h1 className="mt-3 font-heading text-h2 font-bold md:text-h1">{guide.title}</h1>

            <div className="mt-8">
              <AnnotatedExample annotations={guide.annotations} example={guide.example} />
            </div>

            <ul className="mt-10 space-y-8">
              {guide.checks.map((check) => (
                <li key={check.title}>
                  <h2 className="flex items-center gap-3 font-heading text-h4 font-bold">
                    <span aria-hidden="true" className="size-3 shrink-0 rounded-full bg-primary" />
                    {check.title}
                  </h2>
                  <p className="mt-2 text-body-lg">
                    {check.text}
                    {check.link && (
                      <>
                        {" "}
                        <a
                          href={check.link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold underline underline-offset-2 hover:text-ink-muted"
                        >
                          {check.link.label}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      </>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </article>

          <aside>
            <div className="rounded-card border border-line bg-surface p-5 lg:sticky lg:top-6">
              <h2 className="text-label font-semibold">AI terms on this page</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {guide.terms.map((term) => (
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
          </aside>
        </div>
      </Container>
    </main>
  );
}
