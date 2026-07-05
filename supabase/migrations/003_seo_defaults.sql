-- Phase 4: SEO defaults on the settings table (PRD Section 14 lists these,
-- but they weren't included in the original 001 migration).
alter table settings add column if not exists seo_title text;
alter table settings add column if not exists seo_description text;

update settings
set seo_title = 'thePickWise – Tested by Me. Trusted for You.',
    seo_description = 'Real product reviews with video. Every product personally tested before it''s recommended.'
where seo_title is null;
