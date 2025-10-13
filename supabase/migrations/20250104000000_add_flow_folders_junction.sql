/*
  # Add many-to-many relationship between flows and folders

  1. Changes
    - Create `flow_folders` junction table for many-to-many relationship
    - Keep `folder_id` column in `application_flows` for backward compatibility (will be phased out)
    
  2. New Tables
    - `flow_folders`
      - `id` (uuid, primary key)
      - `flow_id` (uuid, foreign key to application_flows)
      - `folder_id` (uuid, foreign key to folders)
      - `created_at` (timestamp)
      - Unique constraint on (flow_id, folder_id) to prevent duplicates

  3. Security
    - Enable RLS on flow_folders table
    - Add policies for anonymous users to manage flow-folder associations
*/

-- Create flow_folders junction table
CREATE TABLE IF NOT EXISTS flow_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id uuid NOT NULL REFERENCES application_flows(id) ON DELETE CASCADE,
  folder_id uuid NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(flow_id, folder_id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_flow_folders_flow_id ON flow_folders(flow_id);
CREATE INDEX IF NOT EXISTS idx_flow_folders_folder_id ON flow_folders(folder_id);

-- Enable RLS on flow_folders table
ALTER TABLE flow_folders ENABLE ROW LEVEL SECURITY;

-- Create policies for flow_folders that allow anonymous access
CREATE POLICY "Allow anonymous to create flow_folder associations"
  ON flow_folders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anonymous to read flow_folder associations"
  ON flow_folders
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anonymous to delete flow_folder associations"
  ON flow_folders
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Migrate existing folder_id data to junction table
INSERT INTO flow_folders (flow_id, folder_id)
SELECT id, folder_id 
FROM application_flows 
WHERE folder_id IS NOT NULL
ON CONFLICT (flow_id, folder_id) DO NOTHING;

