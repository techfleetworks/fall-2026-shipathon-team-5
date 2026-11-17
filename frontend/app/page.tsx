import Link from "next/link";
import Container from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import HeroQuizLoader from "@/components/HeroQuizLoader";
import { checklists } from "@/lib/content/checklists";
import Image from "next/image";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

const steps = [
  {
    title: "Learn",
    text: "Short guides on AI images, voice clones, and how to trace a claim back to its source.",
    href: "/spot-the-slop",
  },
  {
    title: "Check",
    text: "Download the free browser extension to check an image, with the reasons and sources behind it.",
    href: "/tools-to-double-check",
  },
  {
    title: "Practice",
    text: "A Real or AI? challenge, so the skill sticks.",
    href: "/quiz-your-skills",
  }
];

const guides: {
  title: string;
  meta: string;
  href: string;
  image?: { src: string; alt: string };
}[] = [
  {
    title: "Spotting AI-generated images",
    meta: "4 min · 8 checks",
    href: "/spot-the-slop/images-and-visuals",
    image: checklists["images-and-visuals"].cardImage, // same photo as on the Learn page
  },
  {
    title: "Spotting voice clones",
    meta: "3 min · 4 steps",
    href: "/spot-the-slop/audio-and-voice",
    image: checklists["audio-and-voice"].cardImage, // same photo as on the Learn page
  },
  {
    title: "How to do a reverse image search",
    meta: "4 min · 4 steps",
    href: "/tools-to-double-check/reverse-image-search",
    image: {
      src: "/images/reverse-search/reverse-image-home.webp",
      alt: "A 3D search bar with a magnifying glass icon.",
    },
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero (dark) */}
      <section className="bg-deep text-inverse">
        <Container className="grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-card bg-surface px-2 py-1 text-caption font-medium text-ink">
              <span aria-hidden="true">★</span> Free · No sign-up
            </p>
            <h1 className="mt-4 font-heading text-h2 font-bold sm:text-h1 lg:text-display">
              Can you spot the slop?
            </h1>
            <p className="mt-6 max-w-xl text-body-lg text-inverse-muted">
              AI images and inauthentic videos are everywhere. Veritas helps you check
              what you see and teaches you to spot fakes on your own.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/tools-to-double-check/using-veritas#check-a-picture">Check a picture</ButtonLink>
              <ButtonLink href="/spot-the-slop" variant="dark">
                Start learning
              </ButtonLink>
            </div>
          </div>

          {/* Preview of the Real or AI? quiz. Hidden on phones. */}
          <div className="mx-auto hidden w-full max-w-md md:block">
            <HeroQuizLoader />
          </div>
        </Container>
      </section>

      {/* How Veritas works */}
      <section className="py-20">
        <Container>
          <h2 className="font-heading text-h3 font-bold md:text-h2">How Veritas works</h2>
          <dl className="mt-10 border-t border-line">
            {steps.map((step) => (
              <div
                key={step.title}
                className="grid gap-2 border-b border-line py-6 md:grid-cols-[1fr_3fr]"
              >
                <dt className="font-heading text-h5 font-bold">
                  <Link href={step.href} className="hover:underline">
                    {step.title}
                  </Link>
                </dt>
                <dd className="text-body text-ink-muted">{step.text}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* Start with the basics */}
      <section className="bg-surface py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-h3 font-bold md:text-h2">Start with the basics</h2>
              <p className="mt-3 text-body-lg text-ink-muted">
                Short, visual guides. Each one takes about 4 minutes.
              </p>
            </div>
            <ButtonLink href="/spot-the-slop" variant="outline-teal">
              See all guides
            </ButtonLink>
          </div>
          <ul className="mt-10 flex flex-col gap-4">
            {guides.map((guide) => (
              <li key={guide.href}>
                <Link
                  href={guide.href}
                  className="grid overflow-hidden rounded-card border border-line bg-canvas hover:border-ink sm:grid-cols-[240px_1fr]"
                >
                  {guide.image ? (
                    <div className="relative aspect-[3/2] bg-deep">
                      <Image
                        src={guide.image.src}
                        alt={guide.image.alt}
                        fill
                        sizes="(min-width: 640px) 240px, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <ImagePlaceholder label={guide.title} className="aspect-[3/2] rounded-none" />
                  )}
                  <span className="flex flex-col justify-center p-6">
                    <span className="font-heading text-h5 font-bold">{guide.title}</span>
                    <span className="mt-1 text-body-sm text-ink-muted">{guide.meta}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Not sure about something? Verify it (browser extension) */}
      <section className="py-20">
        <Container>
          <h2 className="font-heading text-h3 font-bold md:text-h2">
            Not sure about something? Verify it
          </h2>
          <p className="mt-3 max-w-2xl text-body-lg text-ink-muted">
            A browser extension is in the works. Right-click any image to check it with Veritas.
          </p>
          <div className="mt-10 grid items-center gap-8 rounded-card border border-line bg-surface p-6 md:grid-cols-2">
            <ImagePlaceholder label="Browser extension preview" className="aspect-[16/9]" />
            <div>
              <h3 className="font-heading text-h4 font-bold">Browser extension</h3>
              <p className="mt-2 text-body text-ink-muted">
                Labels AI images and adds context notes right inside your feed and on news sites.
              </p>
              <ButtonLink
                href="/tools-to-double-check/using-veritas"
                variant="outline-teal"
                className="mt-6"
              >
                How it works
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
