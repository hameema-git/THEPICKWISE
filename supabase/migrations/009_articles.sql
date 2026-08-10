create table if not exists articles (
  id uuid primary key default gen_random_uuid(), category_id uuid references categories(id) on delete set null,
  title text not null, slug text not null unique, excerpt text, content text not null default '', featured_image text,
  seo_title text, seo_description text, seo_keywords text, status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists article_products (
  article_id uuid references articles(id) on delete cascade, product_id uuid references products(id) on delete cascade,
  display_order int not null default 0, primary key(article_id, product_id)
);
alter table articles enable row level security; alter table article_products enable row level security;
create policy "public read published articles" on articles for select using (status = 'published');
create policy "owner manages articles" on articles for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "public read article products" on article_products for select using (exists (select 1 from articles a where a.id = article_id and a.status = 'published'));
create policy "owner manages article products" on article_products for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
