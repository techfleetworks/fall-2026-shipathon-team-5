import type { Hoax, HoaxSizers } from "@/lib/content/hoaxes";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import ZoomableImage from "@/components/ZoomableImage";

// Shows `text`, while an invisible copy of `sizer` (the longest text in the list)
// sits in the same spot and sets the height. From tablet width up, every card
// gets the same height for this part. On phones the cards stack, so it's skipped.
function Reserve({ text, sizer }: { text: React.ReactNode; sizer?: React.ReactNode }) {
  return (
    <div className="grid">
      <div className="[grid-area:1/1]">{text}</div>
      {sizer && (
        <div aria-hidden="true" className="invisible hidden [grid-area:1/1] md:block">
          {sizer}
        </div>
      )}
    </div>
  );
}

export default function HoaxCard({ hoax, sizers }: { hoax: Hoax; sizers?: HoaxSizers }) {
  return (
    <article className="h-full overflow-hidden rounded-card border border-line bg-canvas">
      {hoax.image ? (
        <ZoomableImage
          src={hoax.image.src}
          alt={hoax.image.alt}
          caption={hoax.title}
          position={hoax.image.position}
        />
      ) : (
        <ImagePlaceholder label={hoax.title} dark className="aspect-[2/1] rounded-none" />
      )}
      <div className="p-5">
        <p className="text-caption font-medium text-ink-muted">{hoax.year}</p>
        <h3 className="mt-1 font-heading text-h5 font-bold">
          <Reserve text={hoax.title} sizer={sizers?.title} />
        </h3>
        <div className="mt-2 text-body-sm text-ink-muted">
          <Reserve text={hoax.description} sizer={sizers?.description} />
        </div>
        <div className="mt-4 rounded-card bg-primary-soft p-3 text-body-sm">
          <Reserve
            text={
              <>
                <strong className="font-semibold">The tell:</strong> {hoax.tell}
              </>
            }
            sizer={
              sizers && (
                <>
                  <strong className="font-semibold">The tell:</strong> {sizers.tell}
                </>
              )
            }
          />
        </div>
      </div>
    </article>
  );
}
