import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionTabs from "@/components/SectionTabs";
import TermsBox from "@/components/TermsBox";
import ToolCard from "@/components/ToolCard";
import { findPage } from "@/lib/sitemap";
import { toolSections } from "@/lib/content/tools";
import { orgGroups, orgTerms } from "@/lib/content/educationalOrgs";

export const metadata: Metadata = { title: "Educational orgs and initiatives" };

const HREF = "/tools-to-double-check/educational-orgs";

export default function Page() {
  const { page, section } = findPage(HREF);
  const intro = toolSections.find((s) => s.guideHref === HREF)?.intro;

  return (
    <main className="flex-1 py-12">
      <Container>
        <nav aria-label="Breadcrumb" className="text-body-sm text-ink-muted">
          <ol className="flex flex-wrap gap-2">
            <li>
              <Link href={`${section.href}#educational-orgs`} className="hover:text-ink hover:underline">
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
            <h1 className="font-heading text-h2 font-bold md:text-h1">{page.title}</h1>
            {intro && <p className="mt-6 text-body-lg text-ink-muted">{intro}</p>}

            {orgGroups.map((group) => (
              <section key={group.title} className="mt-12">
                <h2 className="font-heading text-h4 font-bold">{group.title}</h2>
                <ul className="mt-6 grid gap-6 md:grid-cols-2">
                  {group.orgs.map((org) => (
                    <li key={org.title}>
                      <ToolCard card={org} onGrey showImage={false} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </article>

          <aside>
            <TermsBox terms={orgTerms} />
          </aside>
        </div>
      </Container>
    </main>
  );
}
