/*
  # Add unique constraint to module_templates component column

  1. Changes
    - Remove any duplicate entries keeping the most recent one
    - Add unique constraint on component column to prevent future duplicates

  2. Security
    - No changes to RLS policies needed
*/

-- First, remove duplicates by keeping only the most recent entry for each component
DELETE FROM module_templates 
WHERE id NOT IN (
  SELECT DISTINCT ON (component) id
  FROM module_templates
  ORDER BY component, updated_at DESC
);

-- Add unique constraint on component column
ALTER TABLE module_templates 
ADD CONSTRAINT unique_component UNIQUE (component);