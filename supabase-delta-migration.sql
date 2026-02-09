-- ============================================
-- SONGSWIPE DELTA MIGRATION (Parts 2-7 only)
-- Part 1 (base schema) is already applied.
-- Run this in Supabase SQL Editor in one go.
-- Project: xnhstgdgwonqjolmjvps
-- ============================================

-- PART 2: V2 Schema (song_variants, failed_jobs, orders.occasion_date)

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

-- PART 3: RLS Fix (guest user + service role access)

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

-- Guest user: must exist in auth.users first (FK constraint), then
-- the on_auth_user_created trigger auto-creates the public.users row.
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'guest@songswipe.io',
  '', NOW(), NOW(), NOW(),
  '{"provider": "email", "providers": ["email"]}', '{}'
)
ON CONFLICT (id) DO NOTHING;

-- PART 4: order_type column

ALTER TABLE orders
ADD COLUMN order_type TEXT NOT NULL DEFAULT 'base'
CHECK (order_type IN ('base', 'upsell', 'bundle'));

CREATE INDEX idx_orders_order_type ON orders(order_type);

-- PART 5: bundles table + parent_order_id

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

-- PART 6: email_preferences table

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

-- PART 7: customizations.occasion_date

ALTER TABLE customizations ADD COLUMN IF NOT EXISTS occasion_date DATE;
COMMENT ON COLUMN customizations.occasion_date IS 'Optional date of the occasion for anniversary reminders';

-- TABLE COMMENTS
COMMENT ON TABLE song_variants IS 'AI-generated song variants with per-variant status tracking and public share tokens';
COMMENT ON TABLE failed_jobs IS 'Dead-letter queue for failed generation jobs after retry exhaustion';
COMMENT ON TABLE bundles IS 'Pre-purchased song credit packs';
COMMENT ON TABLE email_preferences IS 'Email preference management for anniversary reminders';
COMMENT ON COLUMN orders.occasion_date IS 'Special occasion date for retention tracking';
