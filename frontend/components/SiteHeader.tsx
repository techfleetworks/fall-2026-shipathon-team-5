import Link from "next/link";
import { sections } from "@/lib/sitemap";

export default function SiteHeader() {
  return (
    <header className="border-b border-black/10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-xl font-bold">
          Veritas
        </Link>
        <nav aria-label="Main">
          <ul className="flex flex-wrap gap-6">
            {sections.map((section) => (
              <li key={section.href}>
                <Link href={section.href} className="hover:underline">
                  {section.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
