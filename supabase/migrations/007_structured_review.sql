-- Structured review fields. The existing `review` column is NOT touched or
-- renamed — every existing product's review text keeps working exactly as
-- before, it just now displays under the "My Experience" label instead of
-- a single generic block. These four are new and all optional; a product
-- with none of them set still displays fine (falls back to just showing
-- the existing review text, same as today).
alter table products add column if not exists review_summary text;
alter table products add column if not exists review_pros text[] default '{}';
alter table products add column if not exists review_cons text[] default '{}';
alter table products add column if not exists review_verdict text;
