/*
  # Add folder system

  1. New Tables
    - `folders`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text, nullable)
      - `color` (text, default '#3B82F6')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Updates to existing tables
    - `application_flows`
      - Add `folder_id` (uuid, foreign key to folders)

  3. Security
    - Enable RLS on folders table
    - Add policies for anonymous users to manage folders
*/

-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add folder_id to application_flows table
ALTER TABLE application_flows 
ADD COLUMN IF NOT EXISTS folder_id uuid REFERENCES folders(id) ON DELETE SET NULL;

-- Enable RLS on folders table
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- Create policies for folders that allow anonymous access
CREATE POLICY "Allow anonymous to create folders"
  ON folders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anonymous to read folders"
  ON folders
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anonymous to update folders"
  ON folders
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous to delete folders"
  ON folders
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create trigger for updated_at on folders
CREATE TRIGGER update_folders_updated_at
    BEFORE UPDATE ON folders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index on folder_id for better performance
CREATE INDEX IF NOT EXISTS idx_application_flows_folder_id ON application_flows(folder_id);
