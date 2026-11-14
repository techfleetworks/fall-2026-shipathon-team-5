import Image from "next/image";
import type { Hoax } from "@/lib/content/hoaxes";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

export default function HoaxCard({ hoax }: { hoax: Hoax }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card border border-line bg-canvas">
      {hoax.image ? (
        <div className="relative aspect-[2/1] bg-deep">
          <Image
            src={hoax.image.src}
            alt={hoax.image.alt}
            fill
            sizes="(min-width: 768px) 400px, 100vw"
            className="object-cover"
            style={{ objectPosition: hoax.image.position ?? "center" }}
          />
        </div>
      ) : (
        <ImagePlaceholder label={hoax.title} dark className="aspect-[2/1] rounded-none" />
      )}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-caption font-medium text-ink-muted">{hoax.year}</p>
        <h3 className="mt-1 font-heading text-h5 font-bold">{hoax.title}</h3>
        <p className="mt-2 mb-4 text-body-sm text-ink-muted">{hoax.description}</p>
        {/* mt-auto keeps the tell boxes lined up at the bottom of each card */}
        <p className="mt-auto rounded-card bg-primary-soft p-3 text-body-sm">
          <strong className="font-semibold">The tell:</strong> {hoax.tell}
        </p>
      </div>
    </article>
  );
}
