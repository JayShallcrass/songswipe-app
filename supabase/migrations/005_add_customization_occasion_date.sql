-- Migration: Add occasion_date to customizations table
-- Purpose: Capture the date of the occasion for anniversary reminder functionality
-- Phase: 09-retention-marketing
-- Plan: 09-04

ALTER TABLE customizations ADD COLUMN IF NOT EXISTS occasion_date DATE;

COMMENT ON COLUMN customizations.occasion_date IS 'Optional date of the occasion for anniversary reminders';
