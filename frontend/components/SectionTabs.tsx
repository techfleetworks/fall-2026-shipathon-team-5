"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { pageGroups, type PageLink, type Section } from "@/lib/sitemap";

// The "← All checklists | Audio | Images | Video" bar from the Figma components.
// Shows the pages in the same group as the current page. Active tab is aqua.
export default function SectionTabs({ section, page }: { section: Section; page: PageLink }) {
  const pathname = usePathname();
  if (!page.group) return null;

  const group = pageGroups[page.group];
  const siblings = section.children.filter((p) => p.group === page.group);

  return (
    <nav
      aria-label={`${group.title} pages`}
      className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-card border border-line bg-surface p-1"
    >
      <Link
        href={group.backHref}
        className="flex min-h-11 items-center rounded-control px-3 text-label font-semibold hover:bg-subtle"
      >
        ← {group.backLabel}
      </Link>
      <span aria-hidden="true" className="mx-1 h-6 w-px bg-line" />
      {siblings.map((p) => {
        const active = pathname === p.href;
        return (
          <Link
            key={p.href}
            href={p.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center rounded-control px-3 text-label ${
              active ? "bg-primary font-semibold text-on-primary" : "text-ink-muted hover:bg-subtle"
            }`}
          >
            {p.shortTitle ?? p.title}
          </Link>
        );
      })}
    </nav>
  );
}
