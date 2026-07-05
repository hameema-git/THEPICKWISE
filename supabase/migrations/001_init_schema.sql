-- thePickWise — Phase 1: initial schema
-- Run this in the Supabase Dashboard: SQL Editor → New query → paste all → Run

-- ============================================================
-- 1. profiles
-- ============================================================
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  created_at  timestamptz default now()
);

-- ============================================================
-- 2. categories
-- ============================================================
create table if not exists categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  emoji         text,
  color         text,
  display_order int not null default 0,
  is_featured   boolean not null default false,
  created_at    timestamptz default now()
);

-- ============================================================
-- 3. products
-- ============================================================
create table if not exists products (
  id               uuid primary key default gen_random_uuid(),
  category_id      uuid references categories(id) on delete set null,
  name             text not null,
  image_url        text,
  review           text,
  rating           numeric(2,1) check (rating between 1 and 5),
  reviews_count    int default 0,
  price            text,
  original_price   text,
  savings          text,
  shop             text check (shop in ('Amazon','Meesho','Flipkart')),
  affiliate_link   text not null,
  video_link       text,
  video_credit     text,
  badges           text[] default '{}',
  is_pick          boolean not null default false,
  is_published     boolean not null default true,
  price_updated_at timestamptz default now(),
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index if not exists products_category_idx on products(category_id);
create index if not exists products_published_idx on products(is_published);

-- ============================================================
-- 4. settings (single row)
-- ============================================================
create table if not exists settings (
  id                   uuid primary key default gen_random_uuid(),
  brand_name           text default 'thePickWise',
  logo_url             text,
  hero_title           text,
  hero_subtitle        text,
  about_text           text,
  instagram_url        text,
  youtube_url          text,
  whatsapp_number      text,
  theme_color          text default '#e63946',
  privacy_policy       text,
  affiliate_disclosure text,
  updated_at           timestamptz default now()
);

-- ============================================================
-- 5. affiliate_clicks
-- ============================================================
create table if not exists affiliate_clicks (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid references products(id) on delete cascade,
  clicked_at  timestamptz default now()
);

create index if not exists affiliate_clicks_product_idx on affiliate_clicks(product_id);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table products enable row level security;
alter table categories enable row level security;
alter table settings enable row level security;
alter table affiliate_clicks enable row level security;

-- Products: public reads published rows, authenticated owner does everything
create policy "public read published products"
  on products for select
  using (is_published = true);

create policy "owner full access products"
  on products for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Categories: public read, owner write
create policy "public read categories"
  on categories for select
  using (true);

create policy "owner write categories"
  on categories for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Settings: public read, owner write
create policy "public read settings"
  on settings for select
  using (true);

create policy "owner write settings"
  on settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Affiliate clicks: anyone can insert (visitors are anonymous), only owner can read stats
create policy "anyone can log click"
  on affiliate_clicks for insert
  with check (true);

create policy "owner reads clicks"
  on affiliate_clicks for select
  using (auth.role() = 'authenticated');

-- ============================================================
-- Seed: one settings row (there should only ever be exactly one)
-- ============================================================
insert into settings (brand_name, hero_title, hero_subtitle, theme_color, instagram_url)
select 'thePickWise',
       'Your one-stop shop for honest product reviews',
       'Every product here is personally tested. Watch the real video review before you buy.',
       '#e63946',
       'https://instagram.com/thepickwise'
where not exists (select 1 from settings);

-- ============================================================
-- Seed: the 7 categories already used in data/products.js
-- ============================================================
insert into categories (name, slug, emoji, display_order)
values
  ('Kitchen', 'kitchen', '🍳', 1),
  ('Tech',    'tech',    '💻', 2),
  ('Home',    'home',    '🏠', 3),
  ('Beauty',  'beauty',  '✨', 4),
  ('Kids',    'kids',    '🧸', 5),
  ('Fitness', 'fitness', '🏋️', 6)
on conflict (slug) do nothing;
