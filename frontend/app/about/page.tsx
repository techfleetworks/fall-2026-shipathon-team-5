import type { Metadata } from "next";
import Container from "@/components/ui/Container";

export const metadata: Metadata = { title: "About Us" };

export default function Page() {
  return (
    <main className="flex-1 py-16">
      <Container>
        <h1 className="font-heading text-h2 font-bold md:text-h1">About us</h1>
        <p className="mt-6 max-w-2xl text-body-lg text-ink-muted">Content coming soon.</p>
      </Container>
    </main>
  );
}
