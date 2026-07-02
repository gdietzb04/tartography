export type EggTartStyle = "Hong Kong-style" | "Chinese bakery-style" | "Other";
export type PriceRange = "$" | "$$" | "$$$";

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/** Per-day hours, e.g. { mon: "08:00-19:00", sun: null } — null means closed. */
export type Hours = Partial<Record<DayKey, string | null>>;

export interface Shop {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  borough: string;
  lat: number;
  lng: number;
  hours: Hours | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  photos: string[];
  egg_tart_style: EggTartStyle[];
  is_dedicated_egg_tart_shop: boolean;
  price_range: PriceRange;
  best_egg_tart_flag: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  shop_id: string;
  reviewer_display_name: string;
  crust_score: number;
  custard_score: number;
  sweetness_score: number;
  value_score: number;
  freshness_score: number;
  comment: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface ShopWithRating extends Shop {
  review_count: number;
  overall_rating: number | null;
}
