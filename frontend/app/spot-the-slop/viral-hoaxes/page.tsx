import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import HoaxCard from "@/components/HoaxCard";
import { hoaxes } from "@/lib/content/hoaxes";

export const metadata: Metadata = { title: "Real-life AI hoaxes that went viral" };

export default function Page() {
  return (
    <main className="flex-1 py-12">
      <Container>
        <nav aria-label="Breadcrumb" className="text-body-sm text-ink-muted">
          <Link href="/spot-the-slop#viral-hoaxes" className="hover:text-ink hover:underline">
            Learn to spot the slop
          </Link>
        </nav>
        <h1 className="mt-4 font-heading text-h2 font-bold md:text-h1">
          Real-life AI hoaxes that went viral
        </h1>
        <p className="mt-4 max-w-2xl text-body-lg text-ink-muted">
          What happened, and the clue that would have caught it.
        </p>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {hoaxes.map((hoax) => (
            <li key={hoax.title}>
              <HoaxCard hoax={hoax} />
            </li>
          ))}
        </ul>
      </Container>
    </main>
  );
}
