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

const chipBase =
  "inline-flex min-h-[44px] items-center rounded-full border px-4 text-sm font-bold transition-colors duration-150 ease-out";
const chipOff = "border-line bg-paper text-cocoa-soft hover:border-yolk";
const chipOn = "border-yolk bg-yolk text-paper";

export default function FilterBar({ filters, onChange, boroughs }: FilterBarProps) {
  const styles: EggTartStyle[] = ["Hong Kong-style", "Chinese bakery-style", "Other"];
  const prices: PriceRange[] = ["$", "$$", "$$$"];
  return (
    <div className="flex flex-col gap-3">
      <label className="block">
        <span className="sr-only">Search shops</span>
        <input
          type="search"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search by name or neighborhood"
          className="min-h-[44px] w-full rounded-full border border-line bg-paper px-5 text-sm text-cocoa placeholder:text-cocoa-soft/70 focus:border-yolk focus:outline-none"
        />
      </label>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by style">
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
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by borough">
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
      </div>
    </div>
  );
}
