-- Adds support for a product having BOTH a YouTube video and an Instagram
-- Reel at the same time, shown as separate buttons. Purely additive —
-- the existing video_link/video_credit columns and all existing product
-- data are untouched, so nothing already live breaks.
alter table products add column if not exists video_link_youtube text;
alter table products add column if not exists video_link_instagram text;
