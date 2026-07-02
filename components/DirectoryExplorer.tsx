"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { ShopWithRating } from "@/lib/types";
import FilterBar, { emptyFilters, type Filters } from "./FilterBar";
import ShopCard from "./ShopCard";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function DirectoryExplorer({ shops }: { shops: ShopWithRating[] }) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const boroughs = useMemo(
    () => Array.from(new Set(shops.map((s) => s.borough))).sort(),
    [shops]
  );

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return shops.filter((s) => {
      if (filters.styles.length && !s.egg_tart_style.some((st) => filters.styles.includes(st))) return false;
      if (filters.boroughs.length && !filters.boroughs.includes(s.borough)) return false;
      if (filters.prices.length && !filters.prices.includes(s.price_range)) return false;
      if (filters.dedicatedOnly && !s.is_dedicated_egg_tart_shop) return false;
      if (filters.bestOnly && !s.best_egg_tart_flag) return false;
      if (q && !`${s.name} ${s.neighborhood} ${s.borough}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [shops, filters]);

  return (
    <div className="flex flex-col gap-4">
      <FilterBar filters={filters} onChange={setFilters} boroughs={boroughs} />

      <div className="flex gap-2 lg:hidden" role="group" aria-label="Switch between list and map">
        {(["list", "map"] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={mobileView === v}
            onClick={() => setMobileView(v)}
            className={`min-h-[44px] flex-1 rounded-full border text-sm font-bold transition-colors duration-150 ease-out ${
              mobileView === v ? "border-crust bg-crust text-paper" : "border-line bg-paper text-cocoa-soft"
            }`}
          >
            {v === "list" ? "List" : "Map"}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
        <div className={`${mobileView === "map" ? "hidden lg:block" : ""}`}>
          <p className="mb-3 text-sm text-cocoa-soft" role="status">
            {filtered.length === 0
              ? "Nothing matches those filters. Loosen one and try again."
              : `${filtered.length} ${filtered.length === 1 ? "shop" : "shops"} selling egg tarts right now`}
          </p>
          <div className="grid max-h-[70vh] gap-3 overflow-y-auto pb-2 pr-1 sm:grid-cols-2">
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
        </div>
        <div
          className={`h-[70vh] overflow-hidden rounded-card border border-line shadow-card ${
            mobileView === "list" ? "hidden lg:block" : ""
          }`}
        >
          <MapView shops={filtered} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
      </div>
    </div>
  );
}
