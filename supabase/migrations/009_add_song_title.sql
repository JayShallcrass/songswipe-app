-- Add song_title column to customizations table
-- Apply manually via Supabase SQL Editor

ALTER TABLE customizations ADD COLUMN song_title text;
