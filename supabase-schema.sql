-- SongSwipe Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase auth)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CUSTOMIZATIONS TABLE
-- Stores song customization data
-- ============================================
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

-- ============================================
-- ORDERS TABLE
-- Tracks payments and order status
-- ============================================
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

-- ============================================
-- SONGS TABLE
-- Stores generated song references
-- ============================================
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DOWNLOADS LOG TABLE
-- Tracks all downloads for security/analytics
-- ============================================
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- USERS POLICIES
-- ------------------------------------------
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- ------------------------------------------
-- CUSTOMIZATIONS POLICIES
-- ------------------------------------------
-- Users can view their own customizations
CREATE POLICY "Users can view own customizations" ON customizations
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own customizations
CREATE POLICY "Users can create customizations" ON customizations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own customizations
CREATE POLICY "Users can update own customizations" ON customizations
  FOR UPDATE USING (auth.uid() = user_id);

-- ------------------------------------------
-- ORDERS POLICIES
-- ------------------------------------------
-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own orders
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

-- ------------------------------------------
-- SONGS POLICIES
-- ------------------------------------------
-- Users can view their own songs
CREATE POLICY "Users can view own songs" ON songs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own songs (via webhook/system)
CREATE POLICY "Users can insert songs" ON songs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own songs
CREATE POLICY "Users can update own songs" ON songs
  FOR UPDATE USING (auth.uid() = user_id);

-- ------------------------------------------
-- DOWNLOADS POLICIES
-- ------------------------------------------
-- Users can view their own downloads
CREATE POLICY "Users can view own downloads" ON downloads
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert downloads
CREATE POLICY "System can insert downloads" ON downloads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKET SETUP
-- ============================================

-- Create private songs bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('songs', 'songs', false)
ON CONFLICT (id) DO NOTHING;

-- Configure storage policies for songs bucket
-- Only owners can access their files
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

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_customizations_user_id ON customizations(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_songs_user_id ON songs(user_id);
CREATE INDEX IF NOT EXISTS idx_songs_order_id ON songs(order_id);
CREATE INDEX IF NOT EXISTS idx_downloads_song_id ON downloads(song_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_created_at ON downloads(created_at);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create user record on signup
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

-- Auto-update updated_at timestamp
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
-- COMMENTS
-- ============================================
COMMENT ON TABLE users IS 'User profiles extending Supabase auth';
COMMENT ON TABLE customizations IS 'Song customization data';
COMMENT ON TABLE orders IS 'Payment orders and status';
COMMENT ON TABLE songs IS 'Generated song references';
COMMENT ON TABLE downloads IS 'Download log for security and analytics';
