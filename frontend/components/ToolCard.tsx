import type { ToolCardContent } from "@/lib/content/tools";
import Image from "next/image";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

export default function ToolCard({
  card,
  onGrey = false,
  showImage = true,
}: {
  card: ToolCardContent;
  onGrey?: boolean;
  showImage?: boolean;
}) {
  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-card border border-line ${onGrey ? "bg-surface" : "bg-canvas"}`}
    >
      {showImage &&
        (card.image ? (
          <div className="relative aspect-[2/1] bg-subtle">
            <Image
              src={card.image.src}
              alt={card.image.alt}
              fill
              sizes="(min-width: 768px) 600px, 100vw"
              className={card.image.fit === "contain" ? "object-contain py-3" : "object-cover object-top"}
            />
          </div>
        ) : (
          <ImagePlaceholder label={card.title} className="aspect-[2/1] rounded-none" />
        ))}
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
