import type { EggTartStyle, PriceRange } from "@/lib/types";

export function StyleBadge({ style }: { style: EggTartStyle }) {
  const short =
    style === "Hong Kong-style" ? "HK flaky" : style === "Chinese bakery-style" ? "Shortcrust" : "Other";
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-custard/60 px-2.5 py-1 text-xs font-bold text-crust">
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
        <circle cx="5" cy="5" r="4" fill="#F5D78E" stroke="#7A4A21" />
      </svg>
      {short}
    </span>
  );
}

export function PriceBadge({ price }: { price: PriceRange }) {
  const label = price === "$" ? "under $2 a tart" : price === "$$" ? "$2-4 a tart" : "$4+ a tart";
  return (
    <span
      className="inline-flex items-center rounded-full border border-line bg-paper px-2.5 py-1 text-xs font-bold text-cocoa-soft"
      title={label}
    >
      {price} <span className="sr-only">{label}</span>
    </span>
  );
}

export function BestBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-berry px-2.5 py-1 text-xs font-bold text-paper">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="#FEF9EF" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      Top tart
    </span>
  );
}

export function DedicatedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sage px-2.5 py-1 text-xs font-bold text-paper">
      Egg tart specialist
    </span>
  );
}
