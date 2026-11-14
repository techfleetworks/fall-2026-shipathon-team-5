import type { Hoax } from "@/lib/content/hoaxes";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

export default function HoaxCard({ hoax }: { hoax: Hoax }) {
  return (
    <article className="h-full overflow-hidden rounded-card border border-line bg-canvas">
      <ImagePlaceholder label={hoax.title} dark className="aspect-[2/1] rounded-none" />
      <div className="p-5">
        <p className="text-caption font-medium text-ink-muted">{hoax.year}</p>
        <h3 className="mt-1 font-heading text-h5 font-bold">{hoax.title}</h3>
        <p className="mt-3 rounded-card bg-primary-soft p-3 text-body-sm">
          <strong className="font-semibold">The tell:</strong> {hoax.tell}
        </p>
      </div>
    </article>
  );
}
