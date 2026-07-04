# Spec: Account-linked reviews with helpful votes

## Problem
Reviews are already publicly visible to everyone (`public read reviews` RLS
policy), but they aren't tied to real accounts — `reviewer_display_name` is
free text typed into a form, unrelated to the Google sign-in already wired up
for favorites (`AuthProvider.tsx`, `AuthButton.tsx`). Two people can both type
"Sarah" with no way to tell them apart, and there's no way for one signed-in
user to interact with another user's review.

## Goal
A signed-in user posts a review under their real Google identity. Other
signed-in users can see it (already works) and give it a "Helpful" vote.
Vote counts are visible to everyone; only signed-in users can vote.

## 1. Schema changes (supabase/schema.sql)

Add to the `reviews` table:
```sql
alter table reviews add column user_id uuid references auth.users(id) on delete cascade;
create index if not exists reviews_user_id_idx on reviews(user_id);
```
Keep `reviewer_display_name` as a snapshot of the name at post time (Google
`full_name`/`name` at submission), so historical reviews don't break if a user
changes their Google name later. `user_id` is nullable to avoid breaking
existing guest-era rows; new inserts should always set it.

New table for votes:
```sql
create table if not exists review_votes (
  review_id uuid not null references reviews(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (review_id, user_id)
);
create index if not exists review_votes_review_id_idx on review_votes(review_id);

alter table review_votes enable row level security;
create policy "public read review_votes" on review_votes for select using (true);
create policy "own vote insert" on review_votes for insert with check (auth.uid() = user_id);
create policy "own vote delete" on review_votes for delete using (auth.uid() = user_id);
```

Update the reviews insert policy to require auth and match the poster's own id
(replace the old anonymous "guest insert reviews" policy):
```sql
drop policy if exists "guest insert reviews" on reviews;
create policy "own review insert" on reviews for insert with check (auth.uid() = user_id);
```
This is a breaking change for the old anonymous flow — intentional, since
reviews should now require sign-in. Anyone can still read all reviews.

## 2. API route (app/api/reviews/route.ts)

- Stop accepting `reviewer_display_name` from the client. Instead, read the
  caller's session server-side (pass the user's access token from the client
  fetch as a Bearer header, or use `createServerClient` from
  `@supabase/ssr` with cookies if that's already the auth pattern used
  elsewhere in the app — check how `AuthProvider`/favorites currently persist
  session cookies before picking an approach).
- Reject with 401 if there's no valid session.
- Derive `reviewer_display_name` server-side from `user.user_metadata.full_name
  || user.user_metadata.name || user.email`, and set `user_id = user.id` on
  insert.
- Everything else (rubric score validation, photo upload, shop existence
  check) stays the same.

## 3. ReviewForm.tsx

- Import `useAuth` from `AuthProvider`.
- Remove the free-text "Your name" field entirely.
- If `!user`, replace the form with a prompt: "Sign in to leave a review" plus
  a button calling `signInWithGoogle()` (same pattern as the favorites
  toggle's fallback).
- If `user`, show their name/avatar read-only at the top of the form (reuse
  the avatar rendering from `AuthButton.tsx`), keep the five rubric scores +
  optional comment + optional photo as-is.
- On submit, no longer need to set `reviewer_display_name` in the FormData —
  the API derives it from the session.

## 4. Reviews display (app/shops/[id]/page.tsx)

- Add a query for vote counts per review (either a join or a second query
  against `review_votes` grouped by `review_id`), and whether the current
  signed-in user has voted on each (for toggle state).
- Render a "Helpful (N)" button under each review's comment. Clicking it:
  - If not signed in, calls `signInWithGoogle()`.
  - If signed in, optimistically toggles the vote (insert/delete in
    `review_votes` via the browser Supabase client, same optimistic-update +
    rollback-on-error pattern already used in `AuthProvider.toggleFavorite`).
- Consider disabling the vote button (not hiding it) when the review's
  `user_id` equals the current user's id — voting for your own review is a
  product decision; default to disallowing it via a UI-level check plus an
  RLS-level check (`with check (auth.uid() = user_id and auth.uid() <>
  (select user_id from reviews where id = review_id))`) if that behavior is
  wanted. Flag this as an open question rather than assuming.

## 5. Data migration note

Existing seeded/guest reviews (if any exist in production) will have
`user_id = null` and `reviewer_display_name` already set from the old flow —
those are fine to keep as-is (display them as they are; only new reviews
require an account). No backfill needed.

## Open questions to resolve at implementation time
- Confirm which Supabase auth helper pattern is already used for
  server-side session reads in this codebase (`@supabase/ssr` vs. manual
  cookie parsing) — check `lib/supabase-browser.ts` and any existing
  server-side auth usage before adding a new pattern.
- Decide whether users can vote on their own reviews (default: no).
- Decide whether a user can edit/delete their own past review (out of scope
  for this spec unless requested).
