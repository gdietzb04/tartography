interface StarsProps {
  rating: number | null;
  count?: number;
  size?: "sm" | "md";
}

/** Star rating always paired with the numeric value so color is never the only signal. */
export default function Stars({ rating, count, size = "sm" }: StarsProps) {
  const px = size === "sm" ? 14 : 18;
  if (rating === null) {
    return (
      <span className="text-cocoa-soft text-sm">No ratings yet</span>
    );
  }
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`Rated ${rating} out of 5`}>
      <span className="inline-flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            width={px}
            height={px}
            viewBox="0 0 24 24"
            fill={i <= full ? "#D9822B" : "none"}
            stroke={i <= full ? "#B5651D" : "#C8B99A"}
            strokeWidth="2"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </span>
      <span className="font-bold text-cocoa text-sm">{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-cocoa-soft text-sm">
          ({count} {count === 1 ? "review" : "reviews"})
        </span>
      )}
    </span>
  );
}
