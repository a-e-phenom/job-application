-- Setup script for logo_images table
-- Run this in your Supabase SQL Editor

-- Create the logo_images table
CREATE TABLE IF NOT EXISTS logo_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  content_type text NOT NULL,
  file_data bytea NOT NULL,
  file_size integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE logo_images ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access
CREATE POLICY "Allow anonymous to create logo images"
  ON logo_images
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anonymous to read logo images"
  ON logo_images
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anonymous to update logo images"
  ON logo_images
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous to delete logo images"
  ON logo_images
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create or replace the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_logo_images_updated_at ON logo_images;
CREATE TRIGGER update_logo_images_updated_at
    BEFORE UPDATE ON logo_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
