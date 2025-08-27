/*
  # Create logo storage table

  1. New Tables
    - `logo_images`
      - `id` (uuid, primary key)
      - `filename` (text)
      - `content_type` (text)
      - `file_data` (bytea)
      - `file_size` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on logo_images table
    - Add policies for anonymous users to manage logo images
*/

-- Create logo_images table
CREATE TABLE IF NOT EXISTS logo_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  content_type text NOT NULL,
  file_data bytea NOT NULL,
  file_size integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE logo_images ENABLE ROW LEVEL SECURITY;

-- Create policies for logo_images that allow anonymous access
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

-- Create trigger for updated_at
CREATE TRIGGER update_logo_images_updated_at
    BEFORE UPDATE ON logo_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();