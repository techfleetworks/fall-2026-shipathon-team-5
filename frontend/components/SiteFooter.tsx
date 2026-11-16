import Link from "next/link";
import { footerGroups } from "@/lib/sitemap";
import Logo from "@/components/Logo";
import Container from "@/components/ui/Container";

export default function SiteFooter() {
  return (
    <footer className="mt-auto bg-deep text-inverse">
      <Container className="py-16">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Logo variant="footer" />
            <p className="mt-2 text-body-sm text-inverse-muted">
              Learn to spot AI fakes before you share them.
            </p>
          </div>
          {/* Link columns are desktop-only; on phones the header menu covers navigation. */}
          {footerGroups.map((group) => (
            <div key={group.title} className="hidden md:block">
              <h2 className="text-label font-semibold">{group.title}</h2>
              <ul className="mt-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-7 items-center text-body-sm text-inverse-muted hover:text-inverse hover:underline"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t md:mt-12 border-deep-raised pt-8 text-caption text-inverse-muted sm:flex-row sm:justify-between">
          <p>© 2026 Veritas · Built for Tech Fleet Shipathon</p>
          <p>Veritas estimates likelihood, not certainty.</p>
        </div>
      </Container>
    </footer>
  );
}
