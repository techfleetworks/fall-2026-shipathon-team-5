// Veritas mark: aqua rounded square with a black V whose right arm ends in a dot.
// Drawn on a 100×100 grid so it scales cleanly to any size.
export default function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <rect width="100" height="100" rx="28" className="fill-primary" />
      <path
        d="M28.5 34 L50 71.5 L71.5 34"
        fill="none"
        strokeWidth="10.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-on-primary"
      />
      <circle cx="73.3" cy="26.8" r="8.5" className="fill-on-primary" />
    </svg>
  );
}
