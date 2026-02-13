-- Moderation logs for tracking blocked content submissions
-- Apply manually via Supabase SQL Editor

CREATE TABLE moderation_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  field_name text NOT NULL,
  flagged_content text NOT NULL,
  action_taken text NOT NULL DEFAULT 'blocked',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can insert/read (no user access)
CREATE POLICY "Service role only" ON moderation_logs
  FOR ALL
  USING (false)
  WITH CHECK (false);
