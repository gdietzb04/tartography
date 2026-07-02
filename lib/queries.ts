import { supabaseAnon } from "./supabase";
import { withRating } from "./rating";
import type { Review, Shop, ShopWithRating } from "./types";

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
): Promise<{ shop: ShopWithRating; reviews: Review[] } | null> {
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
  return { shop: withRating(shopRes.data as Shop, reviews), reviews };
}
