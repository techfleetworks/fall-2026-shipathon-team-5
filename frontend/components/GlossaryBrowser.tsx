"use client";

import { useMemo, useState } from "react";
import type { Term } from "@/lib/content/glossary";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Turns "Content Credentials (C2PA)" into "content-credentials-c2pa" for #links.
const termId = (term: string) =>
  term.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Search box, A–Z letter filter and term cards for the glossary page.
export default function GlossaryBrowser({ terms }: { terms: Term[] }) {
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState<string | null>(null);

  // Terms that match the search box (term name or definition).
  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return terms;
    return terms.filter(
      (t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q),
    );
  }, [terms, query]);

  // Letters that have at least one matching term are bold and clickable.
  const available = new Set(searched.map((t) => t.term[0].toUpperCase()));
  // Ignore a selected letter that has no matches left, so a search never
  // comes up empty just because a letter was clicked earlier.
  const activeLetter = letter && available.has(letter) ? letter : null;
  const shown = activeLetter
    ? searched.filter((t) => t.term[0].toUpperCase() === activeLetter)
    : searched;

  // True when a search or letter is narrowing the list. "All" shows as
  // selected (dark) when nothing is filtered, like the Figma mockup.
  const filtered = query.trim() !== "" || activeLetter !== null;

  const clearFilters = () => {
    setQuery("");
    setLetter(null);
  };

  return (
    <div>
      {/* Search and "All" reset button */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <label htmlFor="glossary-search" className="sr-only">
            Search terms
          </label>
          <svg
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-ink-muted"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            id="glossary-search"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLetter(null); // a new search starts from all letters
            }}
            placeholder={`Search ${terms.length} terms`}
            className="min-h-14 w-full rounded-control border border-line bg-surface pl-13 pr-4 text-body-lg placeholder:text-ink-muted"
          />
        </div>
        <button
          type="button"
          onClick={clearFilters}
          aria-pressed={!filtered}
          className={`min-h-14 shrink-0 rounded-control border px-6 text-label font-semibold ${
            filtered
              ? "border-line bg-surface text-ink hover:bg-subtle"
              : "border-deep bg-deep text-inverse"
          }`}
        >
          All
        </button>
      </div>

      {/* A–Z: click a letter to show only its terms, click it again to show all */}
      <nav aria-label="Filter by first letter" className="mt-6">
        <ul className="grid grid-cols-7 justify-items-center gap-1 sm:flex sm:flex-wrap sm:justify-between sm:gap-0">
          {LETTERS.map((l) => {
            const has = available.has(l);
            const active = activeLetter === l;
            return (
              <li key={l}>
                <button
                  type="button"
                  disabled={!has}
                  aria-pressed={active}
                  aria-label={`Terms starting with ${l}`}
                  onClick={() => setLetter(active ? null : l)}
                  className={`flex size-11 items-center justify-center rounded-control text-body-lg ${
                    active
                      ? "bg-primary font-semibold text-on-primary"
                      : has
                        ? "font-semibold text-ink hover:bg-subtle"
                        : "cursor-default text-ink-muted/60"
                  }`}
                >
                  {l}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Screen readers hear how many terms are showing as filters change */}
      <p className="sr-only" aria-live="polite">
        {shown.length === 1 ? "1 term" : `${shown.length} terms`} showing
      </p>

      {shown.length > 0 ? (
        <ul className="mt-8 grid gap-x-9 gap-y-6 md:grid-cols-2">
          {shown.map((t) => (
            <li
              key={t.term}
              id={termId(t.term)}
              className="scroll-mt-24 rounded-card border border-line bg-surface p-6"
            >
              <h2 className="font-heading text-h5 font-bold">{t.term}</h2>
              <p className="mt-2 text-body text-ink-muted">{t.definition}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-card border border-line bg-surface p-8 text-center">
          <p className="text-body-lg">No terms match that search.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 inline-flex min-h-11 items-center rounded-control border border-line px-5 text-label font-semibold hover:bg-subtle"
          >
            Show all terms
          </button>
        </div>
      )}
    </div>
  );
}
