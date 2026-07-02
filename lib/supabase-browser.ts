import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Singleton browser client with a persisted session, used for Google OAuth and
// favorites. The anon key is public and safe to ship; RLS scopes writes per user.
let client: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce",
        },
      }
    );
  }
  return client;
}
