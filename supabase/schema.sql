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
  reviewer_display_name text not null check (char_length(reviewer_display_name) between 1 and 60),
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

-- RLS: anyone may read; guest reviews insert through the API route (anon key).
alter table shops enable row level security;
alter table reviews enable row level security;

create policy "public read shops" on shops for select using (true);
create policy "public read reviews" on reviews for select using (true);
create policy "guest insert reviews" on reviews for insert with check (true);
