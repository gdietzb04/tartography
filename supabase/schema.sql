-- Tartography schema. Run once in the Supabase SQL editor before seeding.

create extension if not exists "pgcrypto";

create table if not exists shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  neighborhood text not null,
  borough text not null,
  lat double precision not null,
  lng double precision not null,
  hours jsonb,
  phone text,
  website text,
  instagram text,
  photos text[] not null default '{}',
  egg_tart_style text[] not null default '{}',
  is_dedicated_egg_tart_shop boolean not null default false,
  price_range text not null default '$' check (price_range in ('$', '$$', '$$$')),
  best_egg_tart_flag boolean not null default false,
  created_at timestamptz not null default now(),
  unique (name, address)
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  -- Snapshot of the poster's Google display name at submission time; kept even
  -- if they later rename their Google account. Nullable only for pre-auth rows.
  reviewer_display_name text not null check (char_length(reviewer_display_name) between 1 and 60),
  user_id uuid references auth.users(id) on delete cascade,
  crust_score int not null check (crust_score between 1 and 5),
  custard_score int not null check (custard_score between 1 and 5),
  sweetness_score int not null check (sweetness_score between 1 and 5),
  value_score int not null check (value_score between 1 and 5),
  freshness_score int not null check (freshness_score between 1 and 5),
  comment text check (char_length(comment) <= 2000),
  photo_url text,
  created_at timestamptz not null default now()
);

create index if not exists reviews_shop_id_idx on reviews(shop_id);
create index if not exists reviews_user_id_idx on reviews(user_id);

-- RLS: anyone may read reviews; posting requires a signed-in account.
alter table shops enable row level security;
alter table reviews enable row level security;

create policy "public read shops" on shops for select using (true);
create policy "public read reviews" on reviews for select using (true);
drop policy if exists "guest insert reviews" on reviews;
create policy "own review insert" on reviews for insert with check (auth.uid() = user_id);

-- Helpful votes: one per (review, signed-in user). Voting on your own review is
-- disallowed at the RLS level, not just in the UI.
create table if not exists review_votes (
  review_id uuid not null references reviews(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (review_id, user_id)
);

create index if not exists review_votes_review_id_idx on review_votes(review_id);

alter table review_votes enable row level security;

create policy "public read review_votes" on review_votes for select using (true);
create policy "own vote insert" on review_votes for insert with check (
  auth.uid() = user_id
  and auth.uid() <> (select user_id from reviews where id = review_id)
);
create policy "own vote delete" on review_votes for delete using (auth.uid() = user_id);

-- Favorites: one row per (signed-in user, shop). Requires Supabase Auth
-- (Google provider enabled in the dashboard). Each user sees/edits only their own.
create table if not exists favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  shop_id uuid not null references shops(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, shop_id)
);

create index if not exists favorites_user_id_idx on favorites(user_id);

alter table favorites enable row level security;

create policy "own favorites read" on favorites for select using (auth.uid() = user_id);
create policy "own favorites insert" on favorites for insert with check (auth.uid() = user_id);
create policy "own favorites delete" on favorites for delete using (auth.uid() = user_id);
