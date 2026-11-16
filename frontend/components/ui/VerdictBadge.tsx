type Verdict = "authentic" | "uncertain" | "misleading";

const styles: Record<Verdict, { className: string; icon: string; label: string }> = {
  authentic: {
    className: "bg-authentic-soft text-authentic-text",
    icon: "✓",
    label: "Likely authentic",
  },
  uncertain: {
    className: "bg-uncertain-soft text-uncertain-text",
    icon: "!",
    label: "Uncertain",
  },
  misleading: {
    className: "bg-misleading-soft text-misleading-text",
    icon: "✕",
    label: "Likely misleading",
  },
};

export default function VerdictBadge({
  verdict,
  children,
}: {
  verdict: Verdict;
  children?: React.ReactNode;
}) {
  const s = styles[verdict];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-card px-2 py-1 text-caption font-semibold ${s.className}`}
    >
      <span aria-hidden="true">{s.icon}</span>
      {children ?? s.label}
    </span>
  );
}
