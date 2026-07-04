-- Migration: account-linked reviews + helpful votes.
-- Run this once in the Supabase SQL editor against production.
-- Safe to re-run (idempotent): uses IF NOT EXISTS / DROP+CREATE for policies.

alter table reviews add column if not exists user_id uuid references auth.users(id) on delete cascade;
create index if not exists reviews_user_id_idx on reviews(user_id);

drop policy if exists "guest insert reviews" on reviews;
drop policy if exists "own review insert" on reviews;
create policy "own review insert" on reviews for insert with check (auth.uid() = user_id);

create table if not exists review_votes (
  review_id uuid not null references reviews(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (review_id, user_id)
);

create index if not exists review_votes_review_id_idx on review_votes(review_id);

alter table review_votes enable row level security;

drop policy if exists "public read review_votes" on review_votes;
create policy "public read review_votes" on review_votes for select using (true);

drop policy if exists "own vote insert" on review_votes;
create policy "own vote insert" on review_votes for insert with check (
  auth.uid() = user_id
  and auth.uid() <> (select user_id from reviews where id = review_id)
);

drop policy if exists "own vote delete" on review_votes;
create policy "own vote delete" on review_votes for delete using (auth.uid() = user_id);
