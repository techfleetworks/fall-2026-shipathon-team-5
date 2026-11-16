// Grey stand-in until real images are added to /public. Swap for next/image later.
export default function ImagePlaceholder({
  label = "Image",
  className = "",
  dark = false,
}: {
  label?: string;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      role="img"
      aria-label={`${label} (placeholder)`}
      className={`flex items-center justify-center rounded-image ${
        dark ? "bg-deep-raised text-inverse-muted" : "bg-subtle text-ink-muted"
      } ${className}`}
    >
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="4" y="8" width="40" height="32" rx="2" stroke="currentColor" strokeWidth="3" />
        <path d="M10 34l10-12 8 9 5-5 7 8" stroke="currentColor" strokeWidth="3" />
        <circle cx="34" cy="17" r="3" fill="currentColor" />
      </svg>
    </div>
  );
}
