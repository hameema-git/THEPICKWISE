-- Per-product SEO overrides. All optional — when left blank, the site
-- auto-generates sensible defaults from the product's existing fields
-- (name, review/summary), exactly as it already does today. Nothing
-- changes for any product that doesn't set these.
alter table products add column if not exists seo_title text;
alter table products add column if not exists seo_description text;
alter table products add column if not exists seo_keywords text;
