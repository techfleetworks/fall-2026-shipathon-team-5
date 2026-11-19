import Link from "next/link";

type Variant = "primary" | "dark" | "outline" | "outline-teal";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:brightness-95",
  dark: "bg-deep-raised text-inverse hover:bg-[#33363c]",
  outline: "border border-line bg-surface text-ink hover:bg-subtle",
  // white with a grey outline, turns teal on hover (like the jump buttons on the Learn page)
  "outline-teal":
    "border border-line bg-surface text-ink hover:border-primary hover:bg-primary hover:text-on-primary",
};

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-5 text-label font-semibold transition";

type Props = {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
};

// newTab: open the link in a new tab (for other websites). Screen readers are told so.
export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  newTab = false,
  children,
}: Props & { href: string; newTab?: boolean }) {
  return (
    <Link
      href={href}
      className={`${base} ${variants[variant]} ${className}`}
      {...(newTab && { target: "_blank", rel: "noopener noreferrer" })}
    >
      {children}
      {newTab && <span className="sr-only"> (opens in a new tab)</span>}
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
