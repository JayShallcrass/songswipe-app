-- ============================================
-- SONGSWIPE FULL DATABASE MIGRATION
-- Run this in Supabase SQL Editor in one go
-- Project: xnhstgdgwonqjolmjvps
-- ============================================

-- ============================================
-- PART 1: BASE SCHEMA (supabase-schema.sql)
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  recipient_name TEXT NOT NULL,
  your_name TEXT NOT NULL,
  occasion TEXT NOT NULL,
  song_length INTEGER NOT NULL,
  mood TEXT[] NOT NULL,
  genre TEXT NOT NULL,
  special_memories TEXT,
  things_to_avoid TEXT,
  prompt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customization_id UUID NOT NULL REFERENCES customizations(id) ON DELETE CASCADE,
  stripe_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'generating', 'completed', 'failed')),
  amount INTEGER NOT NULL DEFAULT 799,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all base tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Customizations policies
CREATE POLICY "Users can view own customizations" ON customizations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create customizations" ON customizations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own customizations" ON customizations
  FOR UPDATE USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

-- Songs policies
CREATE POLICY "Users can view own songs" ON songs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert songs" ON songs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own songs" ON songs
  FOR UPDATE USING (auth.uid() = user_id);

-- Downloads policies
CREATE POLICY "Users can view own downloads" ON downloads
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert downloads" ON downloads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('songs', 'songs', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own songs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'songs' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );
CREATE POLICY "Users can view own songs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'songs' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );
CREATE POLICY "Users can update own songs" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'songs' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );
CREATE POLICY "Users can delete own songs" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'songs' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Base indexes
CREATE INDEX IF NOT EXISTS idx_customizations_user_id ON customizations(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_songs_user_id ON songs(user_id);
CREATE INDEX IF NOT EXISTS idx_songs_order_id ON songs(order_id);
CREATE INDEX IF NOT EXISTS idx_downloads_song_id ON downloads(song_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_created_at ON downloads(created_at);

-- Triggers
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO UPDATE SET email = NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 2: V2 SCHEMA (supabase-schema-v2.sql)
-- ============================================

CREATE TYPE generation_status AS ENUM ('pending', 'generating', 'complete', 'failed');

CREATE TABLE song_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  variant_number INTEGER NOT NULL CHECK (variant_number BETWEEN 1 AND 5),
  storage_path TEXT NOT NULL,
  duration_ms INTEGER,
  generation_status generation_status NOT NULL DEFAULT 'pending',
  share_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  selected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE (order_id, variant_number)
);

CREATE TABLE failed_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  retry_count INTEGER NOT NULL,
  failed_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  notes TEXT
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS occasion_date DATE;

CREATE INDEX idx_song_variants_order_id ON song_variants(order_id);
CREATE INDEX idx_song_variants_user_id ON song_variants(user_id);
CREATE INDEX idx_song_variants_share_token ON song_variants(share_token);
CREATE INDEX idx_song_variants_status ON song_variants(generation_status);
CREATE INDEX idx_failed_jobs_type ON failed_jobs(job_type);
CREATE INDEX idx_failed_jobs_failed_at ON failed_jobs(failed_at);

ALTER TABLE song_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own song variants" ON song_variants
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can update own song variants" ON song_variants
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Public can view songs via share token" ON song_variants
  FOR SELECT TO anon
  USING (share_token IS NOT NULL);
CREATE POLICY "Service role can manage song variants" ON song_variants
  FOR ALL TO service_role
  USING (true);

CREATE POLICY "Service role can manage failed jobs" ON failed_jobs
  FOR ALL TO service_role
  USING (true);

-- ============================================
-- PART 3: RLS FIX (supabase-rls-fix.sql)
-- ============================================

CREATE POLICY "Users can manage own customizations" ON customizations
  FOR ALL USING (
    auth.uid() = user_id OR
    user_id = '00000000-0000-0000-0000-000000000000'::uuid
  );
CREATE POLICY "Service role can access all customizations" ON customizations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can manage own orders" ON orders
  FOR ALL USING (
    auth.uid() = user_id OR
    user_id = '00000000-0000-0000-0000-000000000000'::uuid
  );
CREATE POLICY "Service role can access all orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can manage own songs" ON songs
  FOR ALL USING (
    auth.uid() = user_id OR
    user_id = '00000000-0000-0000-0000-000000000000'::uuid
  );
CREATE POLICY "Service role can access all songs" ON songs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can upload songs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'songs');
CREATE POLICY "Service role can view songs" ON storage.objects
  FOR SELECT USING (bucket_id = 'songs');

INSERT INTO users (id, email)
VALUES ('00000000-0000-0000-0000-000000000000', 'guest@songswipe.io')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PART 4: MIGRATION 002 (add order_type)
-- ============================================

ALTER TABLE orders
ADD COLUMN order_type TEXT NOT NULL DEFAULT 'base'
CHECK (order_type IN ('base', 'upsell', 'bundle'));

CREATE INDEX idx_orders_order_type ON orders(order_type);

-- ============================================
-- PART 5: MIGRATION 003 (bundles table)
-- ============================================

CREATE TABLE bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  bundle_tier TEXT NOT NULL CHECK (bundle_tier IN ('3-pack', '5-pack', '10-pack')),
  quantity_purchased INTEGER NOT NULL CHECK (quantity_purchased > 0),
  quantity_remaining INTEGER NOT NULL CHECK (quantity_remaining >= 0),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NULL,
  CONSTRAINT remaining_lte_purchased CHECK (quantity_remaining <= quantity_purchased)
);

ALTER TABLE orders ADD COLUMN parent_order_id UUID NULL REFERENCES orders(id);

CREATE INDEX idx_bundles_user_id ON bundles(user_id);
CREATE INDEX idx_bundles_order_id ON bundles(order_id);
CREATE INDEX idx_orders_parent_order_id ON orders(parent_order_id);

ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bundles"
  ON bundles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage bundles"
  ON bundles FOR ALL TO service_role
  USING (true);

-- ============================================
-- PART 6: MIGRATION 004 (email_preferences)
-- ============================================

CREATE TABLE email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  global_unsubscribe BOOLEAN NOT NULL DEFAULT false,
  occasion_unsubscribes UUID[] NOT NULL DEFAULT '{}',
  unsubscribe_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_email_prefs UNIQUE(user_id)
);

CREATE INDEX idx_email_prefs_user ON email_preferences(user_id);
CREATE INDEX idx_email_prefs_token ON email_preferences(unsubscribe_token);

ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON email_preferences FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences"
  ON email_preferences FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage preferences"
  ON email_preferences FOR ALL TO service_role
  USING (true);

-- ============================================
-- PART 7: MIGRATION 005 (customization occasion_date)
-- ============================================

ALTER TABLE customizations ADD COLUMN IF NOT EXISTS occasion_date DATE;
COMMENT ON COLUMN customizations.occasion_date IS 'Optional date of the occasion for anniversary reminders';

-- ============================================
-- TABLE COMMENTS
-- ============================================
COMMENT ON TABLE users IS 'User profiles extending Supabase auth';
COMMENT ON TABLE customizations IS 'Song customization data';
COMMENT ON TABLE orders IS 'Payment orders and status';
COMMENT ON TABLE songs IS 'Generated song references';
COMMENT ON TABLE downloads IS 'Download log for security and analytics';
COMMENT ON TABLE song_variants IS 'AI-generated song variants with per-variant status tracking and public share tokens';
COMMENT ON TABLE failed_jobs IS 'Dead-letter queue for failed generation jobs after retry exhaustion';
COMMENT ON TABLE bundles IS 'Pre-purchased song credit packs';
COMMENT ON TABLE email_preferences IS 'Email preference management for anniversary reminders';
COMMENT ON COLUMN orders.occasion_date IS 'Special occasion date for retention tracking';
