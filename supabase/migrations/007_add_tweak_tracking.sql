-- Track how many tweaks a user has used per order (first one free, then paid)
ALTER TABLE orders ADD COLUMN tweak_count INTEGER NOT NULL DEFAULT 0;
