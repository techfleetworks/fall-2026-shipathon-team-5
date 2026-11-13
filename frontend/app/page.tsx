import Link from "next/link";
import Container from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import VerdictBadge from "@/components/ui/VerdictBadge";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

// Home page, following the Figma home layout. Links point at sitemap #4 pages.
// Images are grey placeholders until real ones are added to /public.

const steps = [
  {
    title: "Check",
    text: "Download the free browser extension to check an image, with the reasons and sources behind it.",
    href: "/check-before-you-believe",
  },
  {
    title: "Learn",
    text: "Short guides on AI images, voice clones and how to trace a claim back to its source.",
    href: "/spot-the-slop",
  },
  {
    title: "Practice",
    text: "A Real or AI? challenge, so the skill sticks.",
    href: "/skill-check",
  },
];

const guides = [
  {
    title: "Spotting AI-generated images",
    meta: "5 min · 8 checks",
    href: "/spot-the-slop/images-and-visuals",
  },
  {
    title: "Spotting voice clones",
    meta: "4 min · 3 steps",
    href: "/spot-the-slop/audio-and-voice",
  },
  {
    title: "How to do a reverse image search",
    meta: "4 min · 4 steps",
    href: "/check-before-you-believe/reverse-image-search",
  },
];

const hoaxes = [
  {
    year: "2011 · Edited photo",
    title: "The shark on the flooded highway",
    tell: "Reverse image search finds the shark in an older photo.",
  },
  {
    year: "2023 · AI image",
    title: "The Pope in a white puffer coat",
    tell: "The hands, glasses and chain warp up close.",
  },
  {
    year: "2024 · Voice clone ad",
    title: "The celebrity cookware giveaway",
    tell: "The brand's own site had no giveaway.",
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
              <span aria-hidden="true">★</span> Free · 3 minutes · no sign-up
            </p>
            <h1 className="mt-4 font-heading text-h2 font-bold sm:text-h1 lg:text-display">
              Can you spot the fake?
            </h1>
            <p className="mt-6 max-w-xl text-body-lg text-inverse-muted">
              AI images, cloned voices and made-up quotes are everywhere. Veritas helps you check
              what you see and teaches you to spot fakes on your own.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/skill-check/real-or-ai">Take the 3-image skill check</ButtonLink>
              <ButtonLink href="/check-before-you-believe" variant="dark">
                Verify content
              </ButtonLink>
            </div>
          </div>

          {/* Preview of the Real or AI? quiz. Hidden on phones. */}
          <div className="mx-auto hidden w-full max-w-md md:block">
            <div className="flex justify-between text-body-sm">
              <span className="font-semibold">Real or AI?</span>
              <span className="text-inverse-muted">Round 1 of 3</span>
            </div>
            <ImagePlaceholder label="Festival photo" dark className="mt-3 aspect-[3/2] w-full" />
            <div className="mt-3 grid grid-cols-2 gap-2" aria-hidden="true">
              <span className="flex min-h-11 items-center justify-center rounded-control bg-deep-raised text-label font-semibold">
                Real
              </span>
              <span className="flex min-h-11 items-center justify-center rounded-control bg-deep-raised text-label font-semibold">
                AI-generated
              </span>
            </div>
            <div className="mt-3">
              <VerdictBadge verdict="misleading" />
            </div>
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
            <ButtonLink href="/spot-the-slop" variant="outline">
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
                  <ImagePlaceholder label={guide.title} className="aspect-[3/2] rounded-none" />
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
                href="/check-before-you-believe/using-veritas"
                variant="outline"
                className="mt-6"
              >
                How it works
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      {/* Fakes that fooled millions */}
      <section className="bg-surface py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-h3 font-bold md:text-h2">
                Fakes that fooled millions
              </h2>
              <p className="mt-3 text-body-lg text-ink-muted">
                What happened, and the clue that would have caught it.
              </p>
            </div>
            <ButtonLink href="/understand-ai/viral-hoaxes" variant="outline">
              See all viral hoaxes
            </ButtonLink>
          </div>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {hoaxes.map((hoax) => (
              <li
                key={hoax.title}
                className="overflow-hidden rounded-card border border-line bg-canvas"
              >
                <ImagePlaceholder label={hoax.title} dark className="aspect-[2/1] rounded-none" />
                <div className="p-5">
                  <p className="text-caption font-medium text-ink-muted">{hoax.year}</p>
                  <h3 className="mt-1 font-heading text-h5 font-bold">{hoax.title}</h3>
                  <p className="mt-3 rounded-card bg-primary-soft p-3 text-body-sm">
                    <strong className="font-semibold">The tell:</strong> {hoax.tell}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </main>
  );
}
