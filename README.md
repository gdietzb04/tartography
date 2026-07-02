# Tartography

Every mapped egg tart in New York. A directory of NYC bakeries that sell egg tarts — Hong Kong flaky shells, Chinese-bakery shortcrust, Portuguese pastel de nata, and more — with guest reviews scored on a five-part rubric (crust, custard, sweetness, value, freshness) and Google sign-in to save favorites.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Google Maps JS API + MarkerClusterer, and Supabase Postgres. See [ARCHITECTURE.md](ARCHITECTURE.md) for the reasoning.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in real values (five variables; two Google keys and three Supabase values).
3. Apply the schema: paste `supabase/schema.sql` into the Supabase SQL editor and run it once. This also creates the `favorites` table (with row-level security) used by signed-in users.
4. Seed the shops: `npm run seed`. Requires billing enabled on the Google Cloud project and the Places API enabled for `GOOGLE_PLACES_SERVER_KEY`. The script pulls Places Text Search results across Chinatown, Flushing, Sunset Park, Elmhurst, and Bensonhurst, cross-validates them against a curated web-research list, dedupes by name and coordinate proximity, and upserts into Supabase. It also creates the public `review-photos` storage bucket.
5. `npm run dev` and open http://localhost:3000.

## Deploying to Vercel

Import the repo, set the five environment variables from `.env.example` in the Vercel project settings, and deploy. `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` should be referrer-restricted to your domain and scoped to the Maps JavaScript API; `GOOGLE_PLACES_SERVER_KEY` and `SUPABASE_SERVICE_ROLE_KEY` stay server-side.

## Favorites (Google sign-in)

Signed-in users can save shops to favorites, synced to their account via a `favorites` table with row-level security. Auth runs on the browser Supabase client (`lib/supabase-browser.ts` + `components/AuthProvider.tsx`) using Google OAuth.

To enable it:

1. In the Supabase dashboard, go to **Authentication → Providers → Google** and enable it.
2. In the Google Cloud Console, create an OAuth 2.0 client (Web application). Add the Supabase callback URL (`https://<your-project>.supabase.co/auth/v1/callback`) as an authorized redirect URI, then paste the client ID and secret into Supabase.
3. In Supabase **Authentication → URL Configuration**, set the Site URL and add your production domain plus `http://localhost:3000` to the redirect allow-list.

No new environment variables are needed; favorites reuse `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Vercel deployment protection

If the shared link prompts a Vercel login, disable **Settings → Deployment Protection → Vercel Authentication** for the project (or scope it to preview only), and share the stable production domain rather than a per-deployment `*.vercel.app` hash URL.

## How ratings work

Each review scores five rubric items 1-5. A review's average is the mean of its five scores; a shop's overall rating is the mean of its reviews' averages (see `lib/rating.ts` for the exact formula). Shops with no reviews show "No ratings yet" rather than a zero.
