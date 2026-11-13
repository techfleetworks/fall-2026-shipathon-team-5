import Link from "next/link";
import { sections } from "@/lib/sitemap";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-5xl font-bold">Is it real, or is it AI?</h1>
      <p className="mt-4 max-w-2xl text-lg">
        Learn to spot AI-generated content and check it before you believe or share it.
      </p>
      <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <li key={section.href}>
            <Link
              href={section.href}
              className="block h-full rounded-lg border border-black/10 p-6 hover:bg-black/5"
            >
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="mt-2">{section.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
