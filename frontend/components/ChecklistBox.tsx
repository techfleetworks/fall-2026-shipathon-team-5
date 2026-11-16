import type { ChecklistItem } from "@/lib/content/checklists";

// A box of tick-off items. The checkboxes are just for the reader; nothing is saved.
export default function ChecklistBox({ title, items }: { title: string; items: ChecklistItem[] }) {
  return (
    <section className="rounded-card border border-line bg-surface p-6">
      <h2 className="font-heading text-h5 font-bold">{title}</h2>
      <ul className="mt-3 divide-y divide-line">
        {items.map((item) => (
          <li key={item.title}>
            <label className="flex cursor-pointer gap-4 py-4">
              <input
                type="checkbox"
                className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[#16171a]"
              />
              <span>
                <span className="block font-medium">{item.title}</span>
                <span className="block text-body-sm text-ink-muted">{item.text}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
