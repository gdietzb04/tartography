import Link from "next/link";
import type { ShopWithRating } from "@/lib/types";
import Stars from "./Stars";
import { BestBadge, DedicatedBadge, PriceBadge, StyleBadge } from "./Badges";
import TartPlaceholder from "./TartPlaceholder";
import FavoriteButton from "./FavoriteButton";

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
      className={`card-enter group relative flex gap-4 rounded-2xl border p-3 transition-[transform,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:bg-cream/60 ${
        selected ? "border-yolk bg-cream/60 shadow-card" : "border-transparent"
      }`}
      style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-28">
        <FavoriteButton shopId={shop.id} />
        {shop.photos.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shop.photos[0]}
            alt={shop.name}
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        ) : (
          <TartPlaceholder seed={shop.id} className="h-full w-full" />
        )}
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-name text-[17px] font-semibold leading-tight text-cocoa transition-colors group-hover:text-yolk-deep sm:text-[19px]">
            {shop.name}
          </h3>
          <PriceBadge price={shop.price_range} />
        </div>
        <p className="mt-0.5 truncate text-sm text-cocoa-soft">
          {shop.neighborhood}, {shop.borough}
        </p>
        <div className="mt-1.5">
          <Stars rating={shop.overall_rating} count={shop.review_count} />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
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
