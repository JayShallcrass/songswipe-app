-- ============================================
-- SONGSWIPE DATABASE SCHEMA V2
-- Phase 1: Foundation & Infrastructure Migration
-- ============================================
-- This migration builds on top of supabase-schema.sql
-- Run this in Supabase SQL Editor after the base schema is applied
--
-- New features:
-- - song_variants table with per-variant status tracking
-- - generation_status ENUM (pending/generating/complete/failed)
-- - failed_jobs dead-letter queue for exhausted retries
-- - orders.occasion_date for Phase 9 retention tracking
-- - RLS policies with dual-access pattern (owner + public share + service role)
-- ============================================

-- ============================================
-- ENUMS
-- ============================================

-- Generation status for tracking each variant
CREATE TYPE generation_status AS ENUM ('pending', 'generating', 'complete', 'failed');

-- ============================================
-- SONG VARIANTS TABLE
-- Multi-variant song generation with per-variant status
-- ============================================
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

-- ============================================
-- FAILED JOBS TABLE
-- Dead-letter queue for exhausted retries
-- ============================================
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

-- ============================================
-- ORDERS TABLE MODIFICATION
-- Add occasion_date for Phase 9 retention
-- ============================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS occasion_date DATE;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_song_variants_order_id ON song_variants(order_id);
CREATE INDEX idx_song_variants_user_id ON song_variants(user_id);
CREATE INDEX idx_song_variants_share_token ON song_variants(share_token);
CREATE INDEX idx_song_variants_status ON song_variants(generation_status);
CREATE INDEX idx_failed_jobs_type ON failed_jobs(job_type);
CREATE INDEX idx_failed_jobs_failed_at ON failed_jobs(failed_at);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on new tables
ALTER TABLE song_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_jobs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- SONG VARIANTS POLICIES (dual-access pattern)
-- ------------------------------------------

-- Users can view their own song variants
CREATE POLICY "Users can view own song variants" ON song_variants
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own song variants (for selecting favorite)
CREATE POLICY "Users can update own song variants" ON song_variants
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Public can view songs via share token (app layer validates specific token)
CREATE POLICY "Public can view songs via share token" ON song_variants
  FOR SELECT TO anon
  USING (share_token IS NOT NULL);

-- Service role can manage song variants (Inngest job queue)
CREATE POLICY "Service role can manage song variants" ON song_variants
  FOR ALL TO service_role
  USING (true);

-- ------------------------------------------
-- FAILED JOBS POLICIES (system/admin only)
-- ------------------------------------------

-- Service role can manage failed jobs
CREATE POLICY "Service role can manage failed jobs" ON failed_jobs
  FOR ALL TO service_role
  USING (true);

-- ============================================
-- TABLE COMMENTS
-- ============================================
COMMENT ON TABLE song_variants IS 'AI-generated song variants with per-variant status tracking and public share tokens';
COMMENT ON TABLE failed_jobs IS 'Dead-letter queue for failed generation jobs after retry exhaustion';
COMMENT ON COLUMN orders.occasion_date IS 'Special occasion date for retention tracking (Phase 9)';
