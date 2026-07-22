-- Phase: Photo upload support
-- Run this in the Supabase Dashboard: SQL Editor → New query → paste all → Run
-- Safe to run on the live project — every statement below only ADDS new
-- capability (a new bucket, new policies, a new nullable column). Nothing
-- here touches or removes existing data, tables, or policies.

-- ============================================================
-- 1. Storage bucket for product photos (public read, so images
--    display on the public site without needing signed URLs)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- ============================================================
-- 2. RLS policies on storage.objects, scoped to this bucket only
--    (RLS is already enabled on storage.objects by default in Supabase)
-- ============================================================
create policy "Public read product images"
on storage.objects for select
using (bucket_id = 'product-images');

create policy "Authenticated upload product images"
on storage.objects for insert
with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "Authenticated update product images"
on storage.objects for update
using (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "Authenticated delete product images"
on storage.objects for delete
using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- ============================================================
-- 3. Multi-photo support on products.
--    image_url stays exactly as it is today (the cover/primary photo —
--    every existing product and every existing read on the public site
--    keeps working unchanged). image_urls is new and additive: the full
--    set of uploaded photos, for a future product-detail gallery.
-- ============================================================
alter table products add column if not exists image_urls text[] default '{}';
