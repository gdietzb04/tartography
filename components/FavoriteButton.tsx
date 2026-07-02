"use client";

import { useAuth } from "./AuthProvider";

interface FavoriteButtonProps {
  shopId: string;
  /** "overlay" floats on a card image; "inline" sits in a row. */
  variant?: "overlay" | "inline";
}

export default function FavoriteButton({ shopId, variant = "overlay" }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, user } = useAuth();
  const fav = isFavorite(shopId);

  const base =
    variant === "overlay"
      ? "absolute left-1.5 top-1.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-paper/90 shadow-card backdrop-blur-sm"
      : "inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line bg-paper px-4 text-sm font-bold shadow-card";

  return (
    <button
      type="button"
      aria-pressed={fav}
      aria-label={fav ? "Remove from favorites" : user ? "Save to favorites" : "Sign in to save to favorites"}
      title={user ? (fav ? "Remove from favorites" : "Save to favorites") : "Sign in to save"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggleFavorite(shopId);
      }}
      className={`${base} transition-[transform,color,background-color] duration-150 ease-out hover:-translate-y-0.5 ${
        fav ? "text-berry" : "text-cocoa-soft hover:text-berry"
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 21s-7.5-4.6-10-9.2C.4 8.6 1.9 5 5.3 5c2 0 3.4 1.1 4.7 2.7C11.3 6.1 12.7 5 14.7 5c3.4 0 4.9 3.6 3.3 6.8C19.5 16.4 12 21 12 21z" strokeLinejoin="round" />
      </svg>
      {variant === "inline" && <span>{fav ? "Saved" : "Save"}</span>}
    </button>
  );
}
