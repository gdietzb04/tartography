import type { Review, Shop, ShopWithRating } from "./types";

/**
 * Overall rating formula (exact):
 *   For each review r: reviewAvg(r) = (crust + custard + sweetness + value + freshness) / 5
 *   Shop overall_rating = sum(reviewAvg(r) for all reviews of the shop) / reviewCount
 * i.e. the average of each review's average rubric score, rounded to 1 decimal
 * for display. A shop with zero reviews has overall_rating = null (shown as
 * "no ratings yet"), never 0.
 */
export function reviewAverage(r: Pick<Review, "crust_score" | "custard_score" | "sweetness_score" | "value_score" | "freshness_score">): number {
  return (r.crust_score + r.custard_score + r.sweetness_score + r.value_score + r.freshness_score) / 5;
}

export function overallRating(reviews: Review[]): number | null {
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((acc, r) => acc + reviewAverage(r), 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export function withRating(shop: Shop, reviews: Review[]): ShopWithRating {
  return {
    ...shop,
    review_count: reviews.length,
    overall_rating: overallRating(reviews),
  };
}
