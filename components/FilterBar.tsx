"use client";

import type { EggTartStyle, PriceRange } from "@/lib/types";

export interface Filters {
  styles: EggTartStyle[];
  boroughs: string[];
  prices: PriceRange[];
  dedicatedOnly: boolean;
  bestOnly: boolean;
  search: string;
}

export const emptyFilters: Filters = {
  styles: [],
  boroughs: [],
  prices: [],
  dedicatedOnly: false,
  bestOnly: false,
  search: "",
};

interface FilterBarProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  boroughs: string[];
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
    f.search.trim() === ""
  );
}

const chipBase =
  "inline-flex min-h-[36px] items-center whitespace-nowrap rounded-full border px-3.5 text-[13px] font-bold transition-colors duration-150 ease-out";
const chipOff = "border-line bg-cream/60 text-cocoa-soft hover:border-yolk hover:text-cocoa";
const chipOn = "border-yolk bg-yolk text-paper";

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="text-[11px] font-bold uppercase tracking-wide text-cocoa-soft/70">{label}</span>
      <div className="flex gap-1.5">{children}</div>
    </div>
  );
}

export default function FilterBar({ filters, onChange, boroughs }: FilterBarProps) {
  const styles: EggTartStyle[] = ["Hong Kong-style", "Chinese bakery-style", "Other"];
  const prices: PriceRange[] = ["$", "$$", "$$$"];

  return (
    <div className="rounded-2xl border border-line bg-paper shadow-card">
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

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
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

        <div className="flex shrink-0 gap-1.5 sm:ml-auto">
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
        </div>
      </div>
    </div>
  );
}
