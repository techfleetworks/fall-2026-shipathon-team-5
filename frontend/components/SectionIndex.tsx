import Link from "next/link";
import { findSection } from "@/lib/sitemap";

// Landing page for a top-level section: title, intro and a card per sub-page.
export default function SectionIndex({ href }: { href: string }) {
  const section = findSection(href);
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-4xl font-bold">{section.title}</h1>
      <p className="mt-4 text-lg">{section.description}</p>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2">
        {section.children.map((page) => (
          <li key={page.href}>
            <Link
              href={page.href}
              className="block rounded-lg border border-black/10 p-6 hover:bg-black/5"
            >
              {page.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
