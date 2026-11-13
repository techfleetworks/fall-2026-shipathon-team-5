"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Section } from "@/lib/sitemap";

// The "← All checklists | 1.1 Audio | 1.2 Images ..." bar from the Figma components.
// Active tab is aqua with black text.
export default function SectionTabs({ section }: { section: Section }) {
  const pathname = usePathname();
  if (section.children.length < 2) return null;

  return (
    <nav
      aria-label={`${section.title} pages`}
      className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-card border border-line bg-surface p-1"
    >
      <Link
        href={section.href}
        className="flex min-h-11 items-center rounded-control px-3 text-label font-semibold hover:bg-subtle"
      >
        ← All {section.title}
      </Link>
      <span aria-hidden="true" className="mx-1 h-6 w-px bg-line" />
      {section.children.map((page, i) => {
        const active = pathname === page.href;
        return (
          <Link
            key={page.href}
            href={page.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center rounded-control px-3 text-label ${
              active ? "bg-primary font-semibold text-on-primary" : "text-ink-muted hover:bg-subtle"
            }`}
          >
            {section.number}.{i + 1} {page.shortTitle ?? page.title}
          </Link>
        );
      })}
    </nav>
  );
}
