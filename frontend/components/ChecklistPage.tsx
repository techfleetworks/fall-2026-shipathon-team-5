import Link from "next/link";
import { findPage } from "@/lib/sitemap";
import { checklists } from "@/lib/content/checklists";
import Container from "@/components/ui/Container";
import SectionTabs from "@/components/SectionTabs";
import TermsBox from "@/components/TermsBox";
import ChecklistBox from "@/components/ChecklistBox";
import AudioWaveform from "@/components/AudioWaveform";
import SlowMoVideo from "@/components/SlowMoVideo";
import ZoomableImage from "@/components/ZoomableImage";

// Layout for the three checklist pages: intro, an example (audio, image or video),
// the "Look/Listen/Watch closely" and "Then verify" boxes, and "AI terms on this page".
export default function ChecklistPage({ slug }: { slug: string }) {
  const href = `/spot-the-slop/${slug}`;
  const { page, section } = findPage(href);
  const list = checklists[slug];
  const media = list.media;

  return (
    <main className="flex-1 py-12">
      <Container>
        <nav aria-label="Breadcrumb" className="text-body-sm text-ink-muted">
          <ol className="flex flex-wrap gap-2">
            <li>
              <Link href="/spot-the-slop#checklists" className="hover:text-ink hover:underline">
                {section.title}
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li aria-current="page">{page.shortTitle ?? page.title}</li>
          </ol>
        </nav>

        <div className="mt-6">
          <SectionTabs section={section} page={page} />
        </div>

        <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,760px)_minmax(0,360px)] lg:justify-between">
          <article>
            <p className="text-label font-semibold">Checklist</p>
            <h1 className="mt-3 font-heading text-h2 font-bold md:text-h1">{page.title}</h1>
            <p className="mt-6 text-body-lg text-ink-muted">{list.intro}</p>

            <div className="mt-8">
              {media.type === "audio" && (
                <AudioWaveform title={media.title} src={media.src} peaks={media.peaks} />
              )}
              {media.type === "video" && (
                <SlowMoVideo title={media.title} src={media.src} poster={media.poster} />
              )}
              {media.type === "image" && (
                <figure className="rounded-card border border-line bg-surface p-6">
                  <figcaption className="font-semibold">{media.title}</figcaption>
                  <div className="mt-4 overflow-hidden rounded-image">
                    <ZoomableImage
                      src={media.src}
                      alt={media.alt}
                      caption={media.title}
                      aspectClass="aspect-[4/3]"
                      sizes="(min-width: 1024px) 760px, 100vw"
                    />
                  </div>
                </figure>
              )}
            </div>

            <div className="mt-6 space-y-6">
              <ChecklistBox title={list.closely.title} items={list.closely.items} />
              <ChecklistBox title="Then verify" items={list.verify} />
            </div>
          </article>

          <aside>
            <TermsBox terms={list.terms} />
          </aside>
        </div>
      </Container>
    </main>
  );
}
