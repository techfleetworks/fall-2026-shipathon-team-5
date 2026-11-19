import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Image from "next/image";
import PictureChecker from "@/components/PictureChecker";
import { findSection } from "@/lib/sitemap";
import { useVeritasIntro, veritasFeatures } from "@/lib/content/useVeritas";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Use Veritas to verify" };

// Feature sections alternate: picture right / text left, then the reverse, with
// backgrounds alternating white and light grey. "Check a picture now" comes last.
export default function Page() {
  const section = findSection("/use-veritas");

  return (
    <main className="flex-1">
      <section className="pt-16 pb-12">
        <Container>
          <h1 className="font-heading text-h2 font-bold md:text-h1">{section.title}</h1>
          <p className="mt-4 max-w-2xl text-body-lg text-ink-muted">{useVeritasIntro}</p>
        </Container>
      </section>

      {veritasFeatures.map((feature, i) => {
        const imageFirst = i % 2 === 1; // 2nd, 4th... put the picture on the left
        return (
          <section
            key={feature.id}
            id={feature.id}
            className={`scroll-mt-20 py-10 md:py-12 ${i % 2 === 0 ? "bg-surface" : ""}`}
          >
            <Container className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
              <Image
                src={feature.image.src}
                alt={feature.image.alt}
                width={feature.image.width}
                height={feature.image.height}
                sizes="(min-width: 768px) 600px, 100vw"
                className={`h-auto w-full rounded-image ${imageFirst ? "md:order-first" : "md:order-last"}`}
              />
              <div>
                <h2 className="font-heading text-h3 font-bold md:text-h2">{feature.title}</h2>
                <p className="mt-4 text-body-lg text-ink-muted">{feature.intro}</p>
                <ul className="mt-6 space-y-3">
                  {feature.points.map((point) => (
                    <li key={point} className="flex gap-3 text-body-lg">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-authentic-soft text-body-sm font-bold text-authentic-text"
                      >
                        ✓
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
                {feature.action && (
                  // Placeholder until there's a link: points at this section, so it goes nowhere.
                  <ButtonLink
                    href={feature.action.href ?? `#${feature.id}`}
                    newTab={feature.action.href?.startsWith("http") ?? false}
                    className="mt-8"
                  >
                    {feature.action.label}
                  </ButtonLink>
                )}
              </div>
            </Container>
          </section>
        );
      })}

      <section
        id="check-a-picture"
        aria-labelledby="check-a-picture-title"
        // Continues the white / grey alternation after the feature sections.
        className={`scroll-mt-20 py-16 md:py-20 ${veritasFeatures.length % 2 === 0 ? "bg-surface" : ""}`}
      >
        <Container>
          <h2 id="check-a-picture-title" className="font-heading text-h3 font-bold md:text-h2">
            Check a picture now
          </h2>
          <p className="mt-4 max-w-2xl text-body-lg text-ink-muted">
            Not sure about a picture you&rsquo;ve seen? Save it, then check it here. We&rsquo;ll tell
            you what we found and how sure we can be.
          </p>
          <div className="mt-8">
            <PictureChecker />
          </div>
        </Container>
      </section>
    </main>
  );
}
