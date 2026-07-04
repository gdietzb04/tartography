import { supabaseAnon } from "./supabase";
import { withRating } from "./rating";
import type { Review, ReviewWithVotes, Shop, ShopWithRating } from "./types";

export async function getShopsWithRatings(): Promise<ShopWithRating[]> {
  const db = supabaseAnon();
  const [shopsRes, reviewsRes] = await Promise.all([
    db.from("shops").select("*").order("name"),
    db.from("reviews").select("*"),
  ]);
  if (shopsRes.error) throw shopsRes.error;
  if (reviewsRes.error) throw reviewsRes.error;
  const reviews = (reviewsRes.data ?? []) as Review[];
  const byShop = new Map<string, Review[]>();
  for (const r of reviews) {
    const list = byShop.get(r.shop_id) ?? [];
    list.push(r);
    byShop.set(r.shop_id, list);
  }
  return ((shopsRes.data ?? []) as Shop[]).map((s) =>
    withRating(s, byShop.get(s.id) ?? [])
  );
}

export async function getShopWithReviews(
  id: string
): Promise<{ shop: ShopWithRating; reviews: ReviewWithVotes[] } | null> {
  const db = supabaseAnon();
  const [shopRes, reviewsRes] = await Promise.all([
    db.from("shops").select("*").eq("id", id).maybeSingle(),
    db
      .from("reviews")
      .select("*")
      .eq("shop_id", id)
      .order("created_at", { ascending: false }),
  ]);
  if (shopRes.error) throw shopRes.error;
  if (!shopRes.data) return null;
  const reviews = (reviewsRes.data ?? []) as Review[];

  const reviewIds = reviews.map((r) => r.id);
  const votesByReview = new Map<string, number>();
  if (reviewIds.length > 0) {
    const votesRes = await db.from("review_votes").select("review_id").in("review_id", reviewIds);
    if (votesRes.error) throw votesRes.error;
    for (const row of votesRes.data ?? []) {
      const key = row.review_id as string;
      votesByReview.set(key, (votesByReview.get(key) ?? 0) + 1);
    }
  }
  const reviewsWithVotes: ReviewWithVotes[] = reviews.map((r) => ({
    ...r,
    vote_count: votesByReview.get(r.id) ?? 0,
  }));

  return { shop: withRating(shopRes.data as Shop, reviews), reviews: reviewsWithVotes };
}
