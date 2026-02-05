-- SongSwipe Database Schema - FIXED RLS Policies
-- Run this in Supabase SQL Editor to fix anonymous user access

-- ============================================
-- DROP EXISTING POLICIES (run once)
-- ============================================
-- Run these manually if needed to reset policies:
-- DROP POLICY IF EXISTS "Users can create customizations" ON customizations;
-- DROP POLICY IF EXISTS "Users can create orders" ON orders;
-- DROP POLICY IF EXISTS "Users can insert songs" ON songs;

-- ============================================
-- UPDATED CUSTOMIZATIONS POLICIES
-- ============================================
-- Allow authenticated users to manage their own customizations
CREATE POLICY "Users can manage own customizations" ON customizations
  FOR ALL USING (
    auth.uid() = user_id OR
    user_id = '00000000-0000-0000-0000-000000000000'::uuid
  );

-- Allow service role to bypass RLS (for webhooks)
ALTER TABLE customizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can access all customizations" ON customizations
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- UPDATED ORDERS POLICIES
-- ============================================
-- Allow authenticated users to manage their own orders
CREATE POLICY "Users can manage own orders" ON orders
  FOR ALL USING (
    auth.uid() = user_id OR
    user_id = '00000000-0000-0000-0000-000000000000'::uuid
  );

-- Allow service role to bypass RLS (for webhooks)
CREATE POLICY "Service role can access all orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- UPDATED SONGS POLICIES
-- ============================================
-- Allow authenticated users to manage their own songs
CREATE POLICY "Users can manage own songs" ON songs
  FOR ALL USING (
    auth.uid() = user_id OR
    user_id = '00000000-0000-0000-0000-000000000000'::uuid
  );

-- Allow service role to bypass RLS (for webhooks)
CREATE POLICY "Service role can access all songs" ON songs
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- UPDATED STORAGE POLICIES
-- ============================================
-- Allow service role to upload songs (for webhook song generation)
CREATE POLICY "Service role can upload songs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'songs'
  );

CREATE POLICY "Service role can view songs" ON storage.objects
  FOR SELECT USING (bucket_id = 'songs');

-- ============================================
-- CREATE GUEST USER (optional - for tracking anonymous orders)
-- ============================================
-- Create a guest user for anonymous orders
INSERT INTO users (id, email)
VALUES ('00000000-0000-0000-0000-000000000000', 'guest@songswipe.io')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TEST QUERY (run to verify)
-- ============================================
-- SELECT * FROM customizations LIMIT 1;
-- Should return data without auth errors
