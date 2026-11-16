"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { sections } from "@/lib/sitemap";
import Logo from "@/components/Logo";
import Container from "@/components/ui/Container";

// Dark header from the Figma "Web Components" frame.
// The current section is white, semibold and underlined; the rest are muted.
export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const links = sections.map((section) => {
    const active = isActive(section.href);
    return (
      <li key={section.href}>
        <Link
          href={section.href}
          aria-current={active ? "page" : undefined}
          onClick={() => setOpen(false)}
          className={`relative flex min-h-11 items-center text-label ${
            active
              ? "font-semibold text-inverse after:absolute after:bottom-1 after:left-1/2 after:h-0.5 after:w-4 after:-translate-x-1/2 after:bg-inverse"
              : "text-inverse-muted hover:text-inverse"
          }`}
        >
          {section.title}
        </Link>
      </li>
    );
  });

  return (
    <header className="sticky top-0 z-40 bg-deep lg:static">
      <Container className="flex min-h-18 items-center justify-between gap-6">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex gap-7">{links}</ul>
        </nav>

        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-control text-inverse hover:bg-deep-raised lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </Container>

      {open && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-deep-raised lg:hidden">
          <Container>
            <ul className="flex flex-col py-2">{links}</ul>
          </Container>
        </nav>
      )}
    </header>
  );
}
