import Image from "next/image";
import type { Platform } from "@/lib/content/platforms";
import { ButtonLink } from "@/components/ui/Button";

export default function PlatformCard({ platform }: { platform: Platform }) {
  return (
    <article className="flex h-full flex-col rounded-card border border-line bg-surface p-6 transition-colors hover:border-ink">
      {platform.logo ? (
        <Image
          src={platform.logo}
          alt="" // decorative: the platform name is right below
          width={64}
          height={64}
          className="size-16 rounded-control"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex size-16 items-center justify-center rounded-control bg-subtle font-heading text-h4 font-bold text-ink-muted"
        >
          {platform.name.charAt(0)}
        </span>
      )}

      {/* Every card reserves room for a 2-line title and a 2-line description, and the
          Quick checks box has a minimum height, so the boxes line up and match in size. */}
      <h3 className="mt-5 font-heading text-h4 font-bold sm:min-h-[2lh]">{platform.name}</h3>
      <p className="mt-2 text-body text-ink-muted sm:min-h-[2lh]">{platform.description}</p>

      <div className="mt-5 rounded-card bg-canvas p-4 sm:min-h-40">
        <h4 className="text-label font-semibold">Quick checks</h4>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-body-sm marker:text-ink">
          {platform.checks.map((check) => (
            <li key={check}>{check}</li>
          ))}
        </ul>
      </div>

      {/* mt-auto pushes the button to the bottom so every card lines up */}
      <div className="mt-auto pt-6">
        <ButtonLink href={`/spot-the-slop/ai-on-your-feed/${platform.slug}`} variant="outline-teal">
          Read the {platform.guideName} guide
        </ButtonLink>
      </div>
    </article>
  );
}
