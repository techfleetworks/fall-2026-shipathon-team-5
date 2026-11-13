// Page-width wrapper: 1200px content (120px margins on a 1440 screen), 24px on phones.
export default function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-[1248px] px-6 ${className}`}>{children}</div>;
}
