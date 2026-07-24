-- Product lifecycle status — separate from is_published (which stays
-- exactly as-is: it controls draft vs live). This new field is about
-- ACTIVE products' real-world availability:
--   active        — normal, business as usual
--   out_of_stock  — still shown, flagged, buy button still works (creator's
--                   manual flag, not a live stock feed)
--   discontinued  — the product page stays live (preserves SEO / doesn't
--                   404 an indexed URL) but shows a "discontinued" notice,
--                   optionally pointing at a replacement product
--
-- Every existing product defaults to 'active', so nothing changes for any
-- product that exists today.
alter table products add column if not exists status text not null default 'active'
  check (status in ('active', 'out_of_stock', 'discontinued'));

alter table products add column if not exists replacement_product_id uuid
  references products(id) on delete set null;
