import Link from "next/link";

type Variant = "primary" | "dark" | "outline";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:brightness-95",
  dark: "bg-deep-raised text-inverse hover:bg-[#33363c]",
  outline: "border border-line bg-surface text-ink hover:bg-subtle",
};

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-5 text-label font-semibold transition";

type Props = {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
};

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
}: Props & { href: string }) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: Props & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
