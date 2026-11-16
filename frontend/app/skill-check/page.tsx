import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Quiz from "@/components/Quiz";
import { findSection } from "@/lib/sitemap";

export const metadata: Metadata = { title: "Quiz your skills" };

export default function Page() {
  const section = findSection("/skill-check");
  return (
    <main className="flex-1 py-12">
      <Container>
        <div className="mx-auto max-w-[900px]">
          <h1 className="font-heading text-h2 font-bold md:text-h1">
            {section.title}
          </h1>
          <p className="mt-4 text-body-lg text-ink-muted">
            {section.description}
          </p>
          <div className="mt-10">
            <Quiz />
          </div>
        </div>
      </Container>
    </main>
  );
}
