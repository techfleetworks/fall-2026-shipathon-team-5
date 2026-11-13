import Link from "next/link";
import { findPage } from "@/lib/sitemap";

// Temporary page body. Replace it page by page as real content and designs land.
export default function PlaceholderPage({ href }: { href: string }) {
  const { page, section } = findPage(href);
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link href={section.href} className="hover:underline">
          {section.title}
        </Link>
      </nav>
      <h1 className="mt-2 text-4xl font-bold">{page.title}</h1>
      <p className="mt-6 text-lg">Content coming soon.</p>
    </main>
  );
}
