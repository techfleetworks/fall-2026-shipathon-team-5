import Image from "next/image";
import type { Checklist } from "@/lib/content/checklists";
import { ButtonLink } from "@/components/ui/Button";

// Card for the Checklists section on the Learn to spot the slop page.
export default function ChecklistCard({ href, checklist }: { href: string; checklist: Checklist }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card border border-line bg-canvas transition-colors hover:border-ink">
      <div className="relative aspect-[2/1] bg-deep">
        <Image
          src={checklist.cardImage.src}
          alt={checklist.cardImage.alt}
          fill
          sizes="(min-width: 768px) 400px, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-caption font-medium text-ink-muted">Checklist</p>
        <h3 className="mt-1 font-heading text-h4 font-bold">{checklist.cardTitle}</h3>
        <div className="mt-auto pt-6">
          <ButtonLink href={href} variant="outline-teal">
            {checklist.buttonLabel}
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
