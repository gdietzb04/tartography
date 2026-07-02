"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { ShopWithRating } from "@/lib/types";
import FilterBar, { emptyFilters, type Filters } from "./FilterBar";
import ShopCard from "./ShopCard";
import { useAuth } from "./AuthProvider";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-custard/20">
      <span className="text-sm font-bold text-cocoa-soft">Loading the map…</span>
    </div>
  ),
});

type SortKey = "most_reviewed" | "top_rated" | "top_tarts" | "alpha";

const SORT_LABELS: Record<SortKey, string> = {
  most_reviewed: "Most reviewed",
  top_rated: "Highest rated",
  top_tarts: "Top tarts first",
  alpha: "A → Z",
};

function sortShops(list: ShopWithRating[], key: SortKey): ShopWithRating[] {
  const arr = [...list];
  const byName = (a: ShopWithRating, b: ShopWithRating) => a.name.localeCompare(b.name);
  const rating = (s: ShopWithRating) => s.overall_rating ?? -1;
  switch (key) {
    case "most_reviewed":
      return arr.sort((a, b) => b.review_count - a.review_count || rating(b) - rating(a) || byName(a, b));
    case "top_rated":
      return arr.sort((a, b) => rating(b) - rating(a) || b.review_count - a.review_count || byName(a, b));
    case "top_tarts":
      return arr.sort(
        (a, b) =>
          Number(b.best_egg_tart_flag) - Number(a.best_egg_tart_flag) ||
          Number(b.is_dedicated_egg_tart_shop) - Number(a.is_dedicated_egg_tart_shop) ||
          rating(b) - rating(a) ||
          byName(a, b)
      );
    case "alpha":
      return arr.sort(byName);
  }
}

export default function DirectoryExplorer({ shops }: { shops: ShopWithRating[] }) {
  const { user, favorites } = useAuth();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sort, setSort] = useState<SortKey>("most_reviewed");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const boroughs = useMemo(
    () => Array.from(new Set(shops.map((s) => s.borough))).sort(),
    [shops]
  );

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const matched = shops.filter((s) => {
      if (filters.styles.length && !s.egg_tart_style.some((st) => filters.styles.includes(st))) return false;
      if (filters.boroughs.length && !filters.boroughs.includes(s.borough)) return false;
      if (filters.prices.length && !filters.prices.includes(s.price_range)) return false;
      if (filters.dedicatedOnly && !s.is_dedicated_egg_tart_shop) return false;
      if (filters.bestOnly && !s.best_egg_tart_flag) return false;
      if (filters.favoritesOnly && !favorites.has(s.id)) return false;
      if (q && !`${s.name} ${s.neighborhood} ${s.borough}`.toLowerCase().includes(q)) return false;
      return true;
    });
    return sortShops(matched, sort);
  }, [shops, filters, sort, favorites]);

  return (
    <div className="flex flex-col gap-4">
      <FilterBar filters={filters} onChange={setFilters} boroughs={boroughs} showFavorites={!!user} />

      <div
        className="flex rounded-full border border-line bg-paper p-1 shadow-card lg:hidden"
        role="group"
        aria-label="Switch between list and map"
      >
        {(["list", "map"] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={mobileView === v}
            onClick={() => setMobileView(v)}
            className={`min-h-[40px] flex-1 rounded-full text-sm font-bold transition-colors duration-150 ease-out ${
              mobileView === v ? "bg-crust text-paper" : "text-cocoa-soft"
            }`}
          >
            {v === "list" ? "List" : "Map"}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:h-[calc(100vh-14rem)] lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className={`flex min-h-0 flex-col ${mobileView === "map" ? "hidden lg:flex" : ""}`}>
          <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-cocoa-soft" role="status">
              {filtered.length === 0
                ? "Nothing matches those filters."
                : `${filtered.length} ${filtered.length === 1 ? "shop" : "shops"} selling egg tarts`}
            </p>
            <label className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wide text-cocoa-soft/70">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="min-h-[36px] cursor-pointer rounded-full border border-line bg-cream/60 px-3 pr-7 text-[13px] font-bold text-cocoa transition-colors hover:border-yolk focus:outline-none"
                aria-label="Sort shops"
              >
                {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                  <option key={k} value={k}>
                    {SORT_LABELS[k]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto rounded-card border border-line bg-paper p-2 shadow-card lg:max-h-none">
            {filtered.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-cocoa-soft">Loosen a filter and try again.</p>
            ) : (
              <div className="divide-y divide-line">
                {filtered.map((shop, i) => (
                  <ShopCard
                    key={shop.id}
                    shop={shop}
                    index={i}
                    selected={shop.id === selectedId}
                    onHover={setSelectedId}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <div
          className={`h-[70vh] overflow-hidden rounded-card border border-line shadow-raised lg:h-auto ${
            mobileView === "list" ? "hidden lg:block" : ""
          }`}
        >
          <MapView shops={filtered} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
      </div>
    </div>
  );
}
