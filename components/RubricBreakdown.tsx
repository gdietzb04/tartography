import type { Review } from "@/lib/types";

const RUBRIC: { key: keyof Review; label: string }[] = [
  { key: "crust_score", label: "Crust" },
  { key: "custard_score", label: "Custard" },
  { key: "sweetness_score", label: "Sweetness" },
  { key: "value_score", label: "Value" },
  { key: "freshness_score", label: "Freshness" },
];

/** Aggregate per-category averages across all reviews of a shop, shown as bars. */
export default function RubricBreakdown({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;

  const averages = RUBRIC.map(({ key, label }) => {
    const sum = reviews.reduce((acc, r) => acc + (r[key] as number), 0);
    return { label, avg: Math.round((sum / reviews.length) * 10) / 10 };
  });

  return (
    <div className="rounded-card border border-line bg-paper p-5 shadow-card sm:p-6">
      <h2 className="font-display text-lg font-bold text-cocoa">Rubric breakdown</h2>
      <p className="mt-0.5 text-xs text-cocoa-soft">
        Average across {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
      </p>
      <dl className="mt-4 space-y-3">
        {averages.map(({ label, avg }) => (
          <div key={label} className="grid grid-cols-[5.5rem_1fr_2.25rem] items-center gap-3">
            <dt className="font-name text-sm font-semibold text-cocoa">{label}</dt>
            <div className="h-2.5 overflow-hidden rounded-full bg-cream" aria-hidden="true">
              <div
                className="h-full rounded-full bg-gradient-to-r from-custard to-yolk"
                style={{ width: `${(avg / 5) * 100}%` }}
              />
            </div>
            <dd className="text-right text-sm font-bold tabular-nums text-cocoa">{avg.toFixed(1)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
