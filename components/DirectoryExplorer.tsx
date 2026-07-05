"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { animate, motion, useDragControls, useMotionValue, type PanInfo } from "framer-motion";
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

// True below the lg breakpoint, where the map + bottom-sheet layout is used.
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
}

function SortControl({
  count,
  sort,
  setSort,
}: {
  count: number;
  sort: SortKey;
  setSort: (k: SortKey) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-cocoa-soft" role="status">
        {count === 0
          ? "Nothing matches those filters."
          : `${count} ${count === 1 ? "shop" : "shops"} selling egg tarts`}
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
  );
}

function ShopList({
  filtered,
  selectedId,
  onHover,
}: {
  filtered: ShopWithRating[];
  selectedId: string | null;
  onHover: (id: string | null) => void;
}) {
  if (filtered.length === 0) {
    return <p className="px-3 py-8 text-center text-sm text-cocoa-soft">Loosen a filter and try again.</p>;
  }
  return (
    <div className="divide-y divide-line">
      {filtered.map((shop, i) => (
        <ShopCard key={shop.id} shop={shop} index={i} selected={shop.id === selectedId} onHover={onHover} />
      ))}
    </div>
  );
}

// Height of the sheet that stays on screen when collapsed to its "peek" snap:
// enough for the grab handle plus the count/sort row.
const SHEET_PEEK = 128;

type SnapPos = "peek" | "mid" | "full";

function MobileMapSheet({
  filtered,
  sort,
  setSort,
  selectedId,
  setSelectedId,
}: {
  filtered: ShopWithRating[];
  sort: SortKey;
  setSort: (k: SortKey) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [pos, setPos] = useState<SnapPos>("mid");
  const y = useMotionValue(0);
  const controls = useDragControls();

  const targets = useMemo<Record<SnapPos, number>>(
    () => ({
      full: 0,
      mid: height ? Math.round(height * 0.5) : 0,
      peek: height ? Math.max(0, height - SHEET_PEEK) : 0,
    }),
    [height]
  );

  // Measure the map/sheet container so snap points track its real height.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.clientHeight));
    ro.observe(el);
    setHeight(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  // Settle the sheet to its current snap whenever the height (re)measures.
  useEffect(() => {
    if (height) y.set(targets[pos]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height]);

  function snapTo(next: SnapPos) {
    setPos(next);
    animate(y, targets[next], { type: "spring", stiffness: 340, damping: 36 });
  }

  function handleDragEnd(_e: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    const projected = y.get() + info.velocity.y * 0.12;
    const order: SnapPos[] = ["full", "mid", "peek"];
    let best = order[0];
    for (const key of order) {
      if (Math.abs(targets[key] - projected) < Math.abs(targets[best] - projected)) best = key;
    }
    snapTo(best);
  }

  return (
    <div
      ref={wrapRef}
      className="relative h-[calc(100dvh-11rem)] min-h-[440px] overflow-hidden rounded-card border border-line shadow-raised"
    >
      <div className="absolute inset-0">
        <MapView shops={filtered} selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      <motion.div
        drag="y"
        dragListener={false}
        dragControls={controls}
        dragConstraints={{ top: targets.full, bottom: targets.peek }}
        dragElastic={0.04}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="absolute inset-0 flex flex-col rounded-t-[1.5rem] border-t border-line bg-paper shadow-modal"
      >
        <div
          onPointerDown={(e) => controls.start(e)}
          role="button"
          tabIndex={0}
          aria-label="Drag to resize the shop list"
          className="shrink-0 cursor-grab touch-none px-4 pb-3 pt-2.5 active:cursor-grabbing"
        >
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line" />
          <SortControl count={filtered.length} sort={sort} setSort={setSort} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-6">
          <ShopList filtered={filtered} selectedId={selectedId} onHover={setSelectedId} />
        </div>
      </motion.div>
    </div>
  );
}

function DesktopLayout({
  filtered,
  sort,
  setSort,
  selectedId,
  setSelectedId,
}: {
  filtered: ShopWithRating[];
  sort: SortKey;
  setSort: (k: SortKey) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}) {
  return (
    <div className="grid gap-4 lg:h-[calc(100vh-14rem)] lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="flex min-h-0 flex-col">
        <div className="mb-2 shrink-0">
          <SortControl count={filtered.length} sort={sort} setSort={setSort} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto rounded-card border border-line bg-paper p-2 shadow-card">
          <ShopList filtered={filtered} selectedId={selectedId} onHover={setSelectedId} />
        </div>
      </div>
      <div className="h-auto overflow-hidden rounded-card border border-line shadow-raised">
        <MapView shops={filtered} selectedId={selectedId} onSelect={setSelectedId} />
      </div>
    </div>
  );
}

export default function DirectoryExplorer({ shops }: { shops: ShopWithRating[] }) {
  const { user, favorites } = useAuth();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sort, setSort] = useState<SortKey>("most_reviewed");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const isMobile = useIsMobile();

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
      {isMobile ? (
        <MobileMapSheet
          filtered={filtered}
          sort={sort}
          setSort={setSort}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
        />
      ) : (
        <DesktopLayout
          filtered={filtered}
          sort={sort}
          setSort={setSort}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
        />
      )}
    </div>
  );
}
