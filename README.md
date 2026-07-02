# Tartography

Every egg tart in New York, mapped. A directory of NYC bakeries that sell egg tarts — Hong Kong-style flaky shells and Chinese bakery shortcrust — with guest reviews scored on a five-part rubric (crust, custard, sweetness, value, freshness).

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Google Maps JS API + MarkerClusterer, and Supabase Postgres. See [ARCHITECTURE.md](ARCHITECTURE.md) for the reasoning.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in real values (five variables; two Google keys and three Supabase values).
3. Apply the schema: paste `supabase/schema.sql` into the Supabase SQL editor and run it once.
4. Seed the shops: `npm run seed`. Requires billing enabled on the Google Cloud project and the Places API enabled for `GOOGLE_PLACES_SERVER_KEY`. The script pulls Places Text Search results across Chinatown, Flushing, Sunset Park, Elmhurst, and Bensonhurst, cross-validates them against a curated web-research list, dedupes by name and coordinate proximity, and upserts into Supabase. It also creates the public `review-photos` storage bucket.
5. `npm run dev` and open http://localhost:3000.

## Deploying to Vercel

Import the repo, set the five environment variables from `.env.example` in the Vercel project settings, and deploy. `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` should be referrer-restricted to your domain and scoped to the Maps JavaScript API; `GOOGLE_PLACES_SERVER_KEY` and `SUPABASE_SERVICE_ROLE_KEY` stay server-side.

## How ratings work

Each review scores five rubric items 1-5. A review's average is the mean of its five scores; a shop's overall rating is the mean of its reviews' averages (see `lib/rating.ts` for the exact formula). Shops with no reviews show "No ratings yet" rather than a zero.
