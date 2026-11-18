import Link from "next/link";
import Container from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { checklists } from "@/lib/content/checklists";
import Image from "next/image";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

const steps = [
  {
    title: "Check",
    text: "Download the free browser extension to check an image, with the reasons and sources behind it.",
    href: "/use-veritas",
  },
  {
    title: "Learn",
    text: "Short guides on AI images, voice clones, and how to trace a claim back to its source.",
    href: "/spot-the-slop",
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
    href: "/spot-the-slop/reverse-image-search",
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
        {/* The picture column is a little wider than the text so the screenshot reads well. */}
        <Container className="grid items-center gap-12 py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:py-28">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-card bg-surface px-2 py-1 text-caption font-medium text-ink">
              <span aria-hidden="true">★</span> Free · No sign-up
            </p>
            <h1 className="mt-4 font-heading text-h2 font-bold sm:text-h1 lg:text-display">
              Can you spot the slop?
            </h1>
            <p className="mt-6 max-w-xl text-body-lg text-inverse-muted">
              AI images and inauthentic videos are everywhere.
              <br />
              The Veritas browser extension and mobile app help you verify AI-generated content as
              you browse social media.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/use-veritas">Use Veritas</ButtonLink>
              <ButtonLink href="/spot-the-slop" variant="dark">
                Start learning
              </ButtonLink>
            </div>
          </div>

          {/* The Veritas browser extension and mobile app. A plain picture: no zoom. Hidden on phones. */}
          <Image
            src="/images/veritas/veritas-extension-mobile.webp"
            alt="Veritas checking a news article in the browser, where the photo is labeled Likely AI-generated and the side panel lists the findings, next to the Veritas mobile app's home screen."
            width={1800}
            height={962}
            preload
            sizes="(min-width: 1024px) 700px, 100vw"
            className="hidden h-auto w-full md:block"
          />
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

    </main>
  );
}
