/*
  # Add slug field to application_flows table

  1. Add slug column to application_flows table
  2. Create unique index on slug
  3. Generate slugs for existing flows based on their names
  4. Make slug field required
*/

-- Add slug column
ALTER TABLE application_flows ADD COLUMN IF NOT EXISTS slug text;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_application_flows_slug ON application_flows (slug);

-- Generate slugs for existing flows based on their names
-- This will create unique slugs for all existing flows
UPDATE application_flows 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- Make slug field required
ALTER TABLE application_flows ALTER COLUMN slug SET NOT NULL;

-- Add comment to the slug column
COMMENT ON COLUMN application_flows.slug IS 'URL-friendly identifier for the flow';
