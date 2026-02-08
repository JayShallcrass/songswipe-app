-- Migration 003: Add bundles table and parent_order_id for upsells

-- Create bundles table for pre-purchased song credits
CREATE TABLE bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  bundle_tier TEXT NOT NULL CHECK (bundle_tier IN ('3-pack', '5-pack', '10-pack')),
  quantity_purchased INTEGER NOT NULL CHECK (quantity_purchased > 0),
  quantity_remaining INTEGER NOT NULL CHECK (quantity_remaining >= 0),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NULL, -- NULL = never expires
  CONSTRAINT remaining_lte_purchased CHECK (quantity_remaining <= quantity_purchased)
);

-- Add parent_order_id to orders table for linking upsell orders to their parent
ALTER TABLE orders ADD COLUMN parent_order_id UUID NULL REFERENCES orders(id);

-- Create indexes for performance
CREATE INDEX idx_bundles_user_id ON bundles(user_id);
CREATE INDEX idx_bundles_order_id ON bundles(order_id);
CREATE INDEX idx_orders_parent_order_id ON orders(parent_order_id);

-- Enable RLS
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;

-- RLS policies for bundles
CREATE POLICY "Users can view own bundles"
  ON bundles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage bundles"
  ON bundles FOR ALL
  TO service_role
  USING (true);
