import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Quiz from "@/components/Quiz";
import { findSection } from "@/lib/sitemap";

export const metadata: Metadata = { title: "Quiz your skills" };

export default function Page() {
  const section = findSection("/quiz-your-skills");
  return (
    <main className="flex-1 py-6 md:py-8">
      <Container>
        <div className="mx-auto max-w-[900px]">
          <h1 className="font-heading text-h3 font-bold md:text-h2">
            {section.title}
          </h1>
          <p className="mt-2 text-body text-ink-muted md:text-body-lg">
            {section.description}
          </p>
          <div className="mt-5">
            <Quiz />
          </div>
        </div>
      </Container>
    </main>
  );
}
