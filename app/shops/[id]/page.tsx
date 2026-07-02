import Link from "next/link";
import { notFound } from "next/navigation";
import { getShopWithReviews } from "@/lib/queries";
import { reviewAverage } from "@/lib/rating";
import Stars from "@/components/Stars";
import { BestBadge, DedicatedBadge, PriceBadge, StyleBadge } from "@/components/Badges";
import TartPlaceholder from "@/components/TartPlaceholder";
import ReviewForm from "@/components/ReviewForm";
import type { DayKey } from "@/lib/types";

export const revalidate = 60;

const DAY_LABELS: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

const RUBRIC_KEYS = {
  crust_score: "Crust",
  custard_score: "Custard",
  sweetness_score: "Sweetness",
  value_score: "Value",
  freshness_score: "Freshness",
} as const;

export default async function ShopPage({ params }: { params: { id: string } }) {
  const data = await getShopWithReviews(params.id).catch(() => null);
  if (!data) notFound();
  const { shop, reviews } = data;

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <Link
        href="/"
        className="inline-flex min-h-[44px] items-center gap-1 text-sm font-bold text-yolk-deep transition-colors duration-150 ease-out hover:text-crust"
      >
        <span aria-hidden="true">&larr;</span> Back to the map
      </Link>

      <article className="mt-4 overflow-hidden rounded-card border border-line bg-paper shadow-card">
        {shop.photos.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shop.photos[0]} alt={shop.name} className="h-56 w-full object-cover" />
        ) : (
          <TartPlaceholder className="h-56 w-full" />
        )}
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold text-cocoa">{shop.name}</h1>
              <p className="mt-1 text-cocoa-soft">
                {shop.address} · {shop.neighborhood}, {shop.borough}
              </p>
            </div>
            <PriceBadge price={shop.price_range} />
          </div>

          <div className="mt-3">
            <Stars rating={shop.overall_rating} count={shop.review_count} size="md" />
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {shop.best_egg_tart_flag && <BestBadge />}
            {shop.is_dedicated_egg_tart_shop && <DedicatedBadge />}
            {shop.egg_tart_style.map((s) => (
              <StyleBadge key={s} style={s} />
            ))}
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="font-display text-lg font-semibold text-cocoa">Hours</h2>
              {shop.hours ? (
                <table className="mt-2 w-full text-sm">
                  <tbody>
                    {(Object.keys(DAY_LABELS) as DayKey[]).map((d) => (
                      <tr key={d}>
                        <td className="py-0.5 pr-4 text-cocoa-soft">{DAY_LABELS[d]}</td>
                        <td className="py-0.5 text-cocoa">{shop.hours?.[d] ?? "Closed"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="mt-2 text-sm text-cocoa-soft">Hours not listed. Call before you go.</p>
              )}
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-cocoa">Contact</h2>
              <ul className="mt-2 space-y-1 text-sm">
                {shop.phone && (
                  <li>
                    <a href={`tel:${shop.phone}`} className="inline-flex min-h-[44px] items-center font-bold text-yolk-deep hover:text-crust">
                      {shop.phone}
                    </a>
                  </li>
                )}
                {shop.website && (
                  <li>
                    <a href={shop.website} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center font-bold text-yolk-deep hover:text-crust">
                      Website
                    </a>
                  </li>
                )}
                {shop.instagram && (
                  <li>
                    <a href={shop.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center font-bold text-yolk-deep hover:text-crust">
                      Instagram
                    </a>
                  </li>
                )}
                {!shop.phone && !shop.website && !shop.instagram && (
                  <li className="text-cocoa-soft">No contact details on file.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </article>

      <section className="mt-8">
        <h2 className="font-display text-2xl font-bold text-cocoa">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="mt-2 text-cocoa-soft">
            Nobody has rated the tarts here yet. Ate one? Tell us how the custard held up.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {reviews.map((r, i) => (
              <li
                key={r.id}
                className="card-enter rounded-card border border-line bg-paper p-5 shadow-card"
                style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-cocoa">{r.reviewer_display_name}</span>
                  <Stars rating={Math.round(reviewAverage(r) * 10) / 10} />
                </div>
                <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-cocoa-soft">
                  {(Object.entries(RUBRIC_KEYS) as [keyof typeof RUBRIC_KEYS, string][]).map(([k, label]) => (
                    <div key={k} className="flex gap-1">
                      <dt>{label}:</dt>
                      <dd className="font-bold text-cocoa">{r[k]}/5</dd>
                    </div>
                  ))}
                </dl>
                {r.comment && <p className="mt-3 text-sm text-cocoa">{r.comment}</p>}
                {r.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.photo_url} alt="Reviewer photo of the egg tart" className="mt-3 h-40 rounded-lg object-cover" />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-2xl font-bold text-cocoa">Rate the tarts</h2>
        <ReviewForm shopId={shop.id} />
      </section>
    </main>
  );
}
