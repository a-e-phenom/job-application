/*
  # Remove color from folders

  1. Updates to existing tables
    - `folders`
      - Remove `color` column
*/

-- Remove color column from folders table
ALTER TABLE folders DROP COLUMN IF EXISTS color;
