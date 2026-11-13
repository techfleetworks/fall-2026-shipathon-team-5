import Link from "next/link";
import LogoMark from "@/components/LogoMark";

// "header": the Veritas mark (components/LogoMark.tsx).
// "footer": white rounded square with an aqua dot (Figma footer placeholder mark).
export default function Logo({ variant = "header" }: { variant?: "header" | "footer" }) {
  return (
    <Link href="/" className="inline-flex min-h-11 items-center gap-2" aria-label="Veritas home">
      {variant === "header" ? (
        <LogoMark className="size-8" />
      ) : (
        <span aria-hidden="true" className="relative size-7 rounded-control bg-inverse">
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-authentic" />
        </span>
      )}
      <span className="font-heading text-h5 font-bold text-inverse">Veritas</span>
    </Link>
  );
}
