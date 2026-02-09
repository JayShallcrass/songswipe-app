-- Migration 004: Add email_preferences table for anniversary reminders and unsubscribe management

-- Create email_preferences table
CREATE TABLE email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  global_unsubscribe BOOLEAN NOT NULL DEFAULT false,
  occasion_unsubscribes UUID[] NOT NULL DEFAULT '{}', -- Array of order IDs the user has opted out of
  unsubscribe_token TEXT NOT NULL UNIQUE, -- Secure random token for URL-based unsubscribe
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_email_prefs UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX idx_email_prefs_user ON email_preferences(user_id);
CREATE INDEX idx_email_prefs_token ON email_preferences(unsubscribe_token);

-- Enable RLS
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own preferences"
  ON email_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON email_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage preferences"
  ON email_preferences FOR ALL
  TO service_role
  USING (true);
