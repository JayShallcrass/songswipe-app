-- Add optional pronunciation guide for recipient names
ALTER TABLE customizations ADD COLUMN pronunciation TEXT NULL;
