import type { ToolCardContent } from "@/lib/content/tools";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

// Card on the "Tools to double-check" page. Image is a placeholder for now.
// `onGrey`: the card sits on a light grey section, so it uses a white background.
export default function ToolCard({ card, onGrey = false }: { card: ToolCardContent; onGrey?: boolean }) {
  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-card border border-line ${onGrey ? "bg-surface" : "bg-canvas"}`}
    >
      <ImagePlaceholder label={card.title} className="aspect-[2/1] rounded-none" />
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-heading text-h5 font-bold">{card.title}</h3>
        <p className="mt-2 text-body-sm text-ink-muted">{card.text}</p>
        {card.link && (
          <div className="mt-auto pt-6">
            <a
              href={card.link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-control border border-line bg-surface px-5 text-label font-semibold hover:border-primary hover:bg-primary hover:text-on-primary"
            >
              {card.link.label}
              <span aria-hidden="true">↗</span>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
