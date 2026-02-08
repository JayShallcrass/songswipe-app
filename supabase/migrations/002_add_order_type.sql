-- Add order_type column to orders table for purchase categorization (PAY-07)
-- Supports: base (default), upsell (+1 variant), bundle (multi-gen pack)
ALTER TABLE orders
ADD COLUMN order_type TEXT NOT NULL DEFAULT 'base'
CHECK (order_type IN ('base', 'upsell', 'bundle'));

-- Add index for filtering orders by type (dashboard, reporting)
CREATE INDEX idx_orders_order_type ON orders(order_type);
