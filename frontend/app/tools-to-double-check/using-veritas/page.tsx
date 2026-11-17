import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Image from "next/image";
import PictureChecker from "@/components/PictureChecker";
import { findPage } from "@/lib/sitemap";
import { usingVeritasIntro, veritasFeatures } from "@/lib/content/usingVeritas";

export const metadata: Metadata = { title: "Using Veritas to verify" };

const HREF = "/tools-to-double-check/using-veritas";

// Feature sections alternate: picture left / text right, then the reverse,
// with backgrounds alternating white and light grey.
export default function Page() {
  const { page, section } = findPage(HREF);

  return (
    <main className="flex-1">
      <section className="pt-12 pb-8">
        <Container>
          <nav aria-label="Breadcrumb" className="text-body-sm text-ink-muted">
            <ol className="flex flex-wrap gap-2">
              <li>
                <Link href={`${section.href}#using-veritas`} className="hover:text-ink hover:underline">
                  {section.title}
                </Link>
              </li>
              <li aria-hidden="true">›</li>
              <li aria-current="page">{page.title}</li>
            </ol>
          </nav>
          <h1 className="mt-6 font-heading text-h2 font-bold md:text-h1">{page.title}</h1>
          <p className="mt-4 max-w-2xl text-body-lg text-ink-muted">{usingVeritasIntro}</p>
        </Container>
      </section>

      <section id="check-a-picture" aria-labelledby="check-a-picture-title" className="scroll-mt-20 pb-16 md:pb-20">
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
              </div>
            </Container>
          </section>
        );
      })}
    </main>
  );
}
