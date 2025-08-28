/*
  # Clean up duplicate module templates

  1. Changes
    - Remove any duplicate entries keeping the most recent one for each component
    - This ensures no duplicates exist after fixing the useTemplates hook

  2. Security
    - No changes to RLS policies needed
*/

-- Remove duplicates by keeping only the most recent entry for each component
DELETE FROM module_templates 
WHERE id NOT IN (
  SELECT DISTINCT ON (component) id
  FROM module_templates
  ORDER BY component, updated_at DESC
);

-- Ensure the unique constraint exists (in case it was dropped)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_component' 
    AND conrelid = 'module_templates'::regclass
  ) THEN
    ALTER TABLE module_templates 
    ADD CONSTRAINT unique_component UNIQUE (component);
  END IF;
END $$;
