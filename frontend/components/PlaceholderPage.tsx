import Link from "next/link";
import { findPage } from "@/lib/sitemap";
import Container from "@/components/ui/Container";
import SectionTabs from "@/components/SectionTabs";

// Lesson page shell, based on the Figma checklist page:
// breadcrumb, section tabs, title, intro, then a main column and a sidebar.
// Replace "Content coming soon" with each page's real content.
export default function PlaceholderPage({ href }: { href: string }) {
  const { page, section } = findPage(href);
  const index = section.children.findIndex((p) => p.href === href);
  const next = section.children[index + 1];

  return (
    <main className="flex-1 py-12">
      <Container>
        <nav aria-label="Breadcrumb" className="text-body-sm text-ink-muted">
          <ol className="flex flex-wrap gap-2">
            <li>
              <Link href={section.href} className="hover:text-ink hover:underline">
                {section.title}
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li aria-current="page">{page.shortTitle ?? page.title}</li>
          </ol>
        </nav>

        <div className="mt-6">
          <SectionTabs section={section} />
        </div>

        <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,760px)_minmax(0,360px)] lg:justify-between">
          <article>
            <p className="text-label font-semibold">
              {section.title} {section.number}.{index + 1}
            </p>
            <h1 className="mt-3 font-heading text-h2 font-bold md:text-h1">{page.title}</h1>
            <p className="mt-6 text-body-lg text-ink-muted">Content coming soon.</p>
          </article>

          <aside className="flex flex-col gap-4">
            <div className="rounded-card border border-line bg-surface p-5">
              <h2 className="text-label font-semibold">On this page</h2>
              <p className="mt-2 text-body-sm text-ink-muted">Section links go here.</p>
            </div>
            {next && (
              <Link
                href={next.href}
                className="block rounded-card bg-primary-soft p-5 hover:bg-subtle"
              >
                <span className="text-caption font-medium text-ink-muted">Next up</span>
                <span className="mt-1 block font-heading text-h5 font-bold">{next.title}</span>
              </Link>
            )}
          </aside>
        </div>
      </Container>
    </main>
  );
}
