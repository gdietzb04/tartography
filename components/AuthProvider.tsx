"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase-browser";

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  favorites: Set<string>;
  favoriteCount: number;
  isFavorite: (shopId: string) => boolean;
  toggleFavorite: (shopId: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = supabaseBrowser();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!user) {
      setFavorites(new Set());
      return;
    }
    let active = true;
    supabase
      .from("favorites")
      .select("shop_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (active && data) setFavorites(new Set(data.map((r) => r.shop_id as string)));
      });
    return () => {
      active = false;
    };
  }, [user, supabase]);

  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href },
    });
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  const toggleFavorite = useCallback(
    async (shopId: string) => {
      if (!user) {
        await signInWithGoogle();
        return;
      }
      const had = favorites.has(shopId);
      setFavorites((prev) => {
        const next = new Set(prev);
        if (had) next.delete(shopId);
        else next.add(shopId);
        return next;
      });
      const query = had
        ? supabase.from("favorites").delete().eq("user_id", user.id).eq("shop_id", shopId)
        : supabase.from("favorites").insert({ user_id: user.id, shop_id: shopId });
      const { error } = await query;
      if (error) {
        // Roll back optimistic update on failure.
        setFavorites((prev) => {
          const next = new Set(prev);
          if (had) next.add(shopId);
          else next.delete(shopId);
          return next;
        });
      }
    },
    [user, favorites, supabase, signInWithGoogle]
  );

  const isFavorite = useCallback((shopId: string) => favorites.has(shopId), [favorites]);

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        favorites,
        favoriteCount: favorites.size,
        isFavorite,
        toggleFavorite,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
