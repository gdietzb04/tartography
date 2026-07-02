# Tartography — Architecture

Tartography is a Next.js 14 (App Router) + TypeScript + Tailwind app backed by Supabase Postgres, rendering an interactive Google Map of NYC egg tart shops.

**Why Supabase over a JSON file or SQLite:** guest reviews are written at runtime, so the datastore must accept concurrent writes from serverless functions on Vercel. A JSON file or SQLite bundled with the deploy is read-only in that environment, while Supabase gives us hosted Postgres, a REST layer, and row-level security without running our own server.

**Why Next.js App Router:** shop pages are server-rendered for fast loads and shareable URLs, while the map and review form are isolated client components; the App Router lets both live in one codebase with API routes for review submission.

**Why two Google API keys:** the browser key (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`) is referrer-restricted and scoped to the Maps JavaScript API only, so shipping it in the bundle is safe; the server key (`GOOGLE_PLACES_SERVER_KEY`) is scoped to the Places API and used only by the one-time seed script, so it never reaches the browser. Compromising either key exposes only its own narrow surface.

**Data flow:** seed script (Places Text Search + curated web list, cross-validated and deduped) → Supabase `shops` table. App reads shops server-side with the anon key, renders map + list. Guest reviews POST to `/api/reviews`, which validates rubric scores and inserts into `reviews`; the shop's overall rating is computed from review averages at read time.
