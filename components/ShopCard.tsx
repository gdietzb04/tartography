import Link from "next/link";
import type { ShopWithRating } from "@/lib/types";
import Stars from "./Stars";
import { BestBadge, DedicatedBadge, PriceBadge, StyleBadge } from "./Badges";
import TartPlaceholder from "./TartPlaceholder";

interface ShopCardProps {
  shop: ShopWithRating;
  index: number;
  selected?: boolean;
  onHover?: (id: string | null) => void;
}

export default function ShopCard({ shop, index, selected, onHover }: ShopCardProps) {
  return (
    <Link
      href={`/shops/${shop.id}`}
      onMouseEnter={() => onHover?.(shop.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`card-enter block overflow-hidden rounded-card border bg-paper shadow-card transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-raised ${
        selected ? "border-yolk" : "border-line"
      }`}
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      {shop.photos.length > 0 ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={shop.photos[0]} alt={shop.name} className="h-32 w-full object-cover" />
      ) : (
        <TartPlaceholder className="h-32 w-full" />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold leading-tight text-cocoa">{shop.name}</h3>
          <PriceBadge price={shop.price_range} />
        </div>
        <p className="mt-1 text-sm text-cocoa-soft">
          {shop.neighborhood}, {shop.borough}
        </p>
        <div className="mt-2">
          <Stars rating={shop.overall_rating} count={shop.review_count} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {shop.best_egg_tart_flag && <BestBadge />}
          {shop.is_dedicated_egg_tart_shop && <DedicatedBadge />}
          {shop.egg_tart_style.map((s) => (
            <StyleBadge key={s} style={s} />
          ))}
        </div>
      </div>
    </Link>
  );
}
