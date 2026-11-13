import Link from "next/link";
import { sections } from "@/lib/sitemap";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-black/10">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 sm:grid-cols-2 lg:grid-cols-5">
        {sections.map((section) => (
          <div key={section.href}>
            <Link href={section.href} className="font-semibold hover:underline">
              {section.title}
            </Link>
            <ul className="mt-2 space-y-1 text-sm">
              {section.children.map((page) => (
                <li key={page.href}>
                  <Link href={page.href} className="hover:underline">
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
