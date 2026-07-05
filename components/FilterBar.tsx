"use client";

import { useState } from "react";
import type { EggTartStyle, PriceRange } from "@/lib/types";

export interface Filters {
  styles: EggTartStyle[];
  boroughs: string[];
  prices: PriceRange[];
  dedicatedOnly: boolean;
  bestOnly: boolean;
  favoritesOnly: boolean;
  search: string;
}

export const emptyFilters: Filters = {
  styles: [],
  boroughs: [],
  prices: [],
  dedicatedOnly: false,
  bestOnly: false,
  favoritesOnly: false,
  search: "",
};

interface FilterBarProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  boroughs: string[];
  showFavorites?: boolean;
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function isEmpty(f: Filters): boolean {
  return (
    f.styles.length === 0 &&
    f.boroughs.length === 0 &&
    f.prices.length === 0 &&
    !f.dedicatedOnly &&
    !f.bestOnly &&
    !f.favoritesOnly &&
    f.search.trim() === ""
  );
}

// Count of active chip-style filters (everything except the always-visible
// search box), used for the collapsed mobile filter badge.
function activeCount(f: Filters): number {
  return (
    f.styles.length +
    f.boroughs.length +
    f.prices.length +
    (f.dedicatedOnly ? 1 : 0) +
    (f.bestOnly ? 1 : 0) +
    (f.favoritesOnly ? 1 : 0)
  );
}

const chipBase =
  "inline-flex min-h-[36px] items-center whitespace-nowrap rounded-full border px-3.5 text-[13px] font-bold transition-[transform,background-color,border-color] duration-150 ease-out active:scale-95";
const chipOff = "border-line bg-cream/60 text-cocoa-soft hover:border-yolk hover:text-cocoa";
const chipOn = "border-yolk bg-yolk text-paper shadow-card";

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 shrink items-baseline gap-2">
      <span className="shrink-0 pt-1.5 text-[11px] font-bold uppercase tracking-wide text-cocoa-soft/70">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

export default function FilterBar({ filters, onChange, boroughs, showFavorites }: FilterBarProps) {
  // On mobile the chip rows collapse behind a "Filters" toggle to reclaim
  // vertical space; on lg+ they are always shown regardless of this state.
  const [open, setOpen] = useState(false);
  const count = activeCount(filters);
  const styles: EggTartStyle[] = [
    "Hong Kong-style",
    "Chinese bakery-style",
    "Portuguese-style",
    "Cookie-crust",
    "Taiwanese-style",
    "Flavored/specialty",
    "Other",
  ];
  const prices: PriceRange[] = ["$", "$$", "$$$"];

  return (
    <div className="rounded-card border border-line bg-paper shadow-card">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B573F" strokeWidth="2" aria-hidden="true" className="shrink-0">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search by shop name or neighborhood"
          className="min-h-[44px] w-full bg-transparent text-sm text-cocoa placeholder:text-cocoa-soft/70 focus:outline-none"
        />
        {!isEmpty(filters) && (
          <button
            type="button"
            onClick={() => onChange(emptyFilters)}
            className="min-h-[36px] shrink-0 rounded-full px-3 text-xs font-bold text-berry transition-colors duration-150 ease-out hover:bg-berry/10"
          >
            Clear all
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 border-b border-line px-4 py-2.5 text-sm font-bold text-cocoa lg:hidden"
      >
        <span className="flex items-center gap-2">
          Filters
          {count > 0 && (
            <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-yolk px-1.5 text-[11px] font-bold text-paper">
              {count}
            </span>
          )}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div
        className={`${open ? "flex" : "hidden"} flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 lg:flex`}
      >
        <Group label="Style">
          {styles.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={filters.styles.includes(s)}
              onClick={() => onChange({ ...filters, styles: toggle(filters.styles, s) })}
              className={`${chipBase} ${filters.styles.includes(s) ? chipOn : chipOff}`}
            >
              {s}
            </button>
          ))}
        </Group>

        <Group label="Borough">
          {boroughs.map((b) => (
            <button
              key={b}
              type="button"
              aria-pressed={filters.boroughs.includes(b)}
              onClick={() => onChange({ ...filters, boroughs: toggle(filters.boroughs, b) })}
              className={`${chipBase} ${filters.boroughs.includes(b) ? chipOn : chipOff}`}
            >
              {b}
            </button>
          ))}
        </Group>

        <Group label="Price">
          {prices.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={filters.prices.includes(p)}
              onClick={() => onChange({ ...filters, prices: toggle(filters.prices, p) })}
              className={`${chipBase} ${filters.prices.includes(p) ? chipOn : chipOff}`}
            >
              {p}
            </button>
          ))}
        </Group>

        <div className="flex flex-wrap gap-1.5 sm:ml-auto">
          <button
            type="button"
            aria-pressed={filters.dedicatedOnly}
            onClick={() => onChange({ ...filters, dedicatedOnly: !filters.dedicatedOnly })}
            className={`${chipBase} ${filters.dedicatedOnly ? chipOn : chipOff}`}
          >
            Specialists only
          </button>
          <button
            type="button"
            aria-pressed={filters.bestOnly}
            onClick={() => onChange({ ...filters, bestOnly: !filters.bestOnly })}
            className={`${chipBase} ${filters.bestOnly ? chipOn : chipOff}`}
          >
            Top tarts
          </button>
          {showFavorites && (
            <button
              type="button"
              aria-pressed={filters.favoritesOnly}
              onClick={() => onChange({ ...filters, favoritesOnly: !filters.favoritesOnly })}
              className={`${chipBase} inline-flex items-center gap-1 ${filters.favoritesOnly ? "border-berry bg-berry text-paper shadow-card" : "border-line bg-cream/60 text-berry hover:border-berry"}`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 21s-7.5-4.6-10-9.2C.4 8.6 1.9 5 5.3 5c2 0 3.4 1.1 4.7 2.7C11.3 6.1 12.7 5 14.7 5c3.4 0 4.9 3.6 3.3 6.8C19.5 16.4 12 21 12 21z" />
              </svg>
              Favorites
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
