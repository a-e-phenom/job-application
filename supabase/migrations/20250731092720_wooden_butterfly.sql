/*
  # Fix RLS policies for anonymous access

  1. Security Changes
    - Drop existing restrictive policies
    - Create new policies that allow anonymous users to perform CRUD operations
    - Maintain protection for default templates (cannot be deleted)
    
  2. Tables Affected
    - `application_flows` - allow full CRUD for anonymous users
    - `module_templates` - allow full CRUD for anonymous users, except deleting defaults
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create flows" ON application_flows;
DROP POLICY IF EXISTS "Users can read all flows" ON application_flows;
DROP POLICY IF EXISTS "Users can update flows" ON application_flows;
DROP POLICY IF EXISTS "Users can delete flows" ON application_flows;

DROP POLICY IF EXISTS "Users can create templates" ON module_templates;
DROP POLICY IF EXISTS "Users can read all templates" ON module_templates;
DROP POLICY IF EXISTS "Users can update templates" ON module_templates;
DROP POLICY IF EXISTS "Users can delete custom templates" ON module_templates;

-- Create new policies for application_flows that allow anonymous access
CREATE POLICY "Allow anonymous to create flows"
  ON application_flows
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anonymous to read flows"
  ON application_flows
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anonymous to update flows"
  ON application_flows
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous to delete flows"
  ON application_flows
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create new policies for module_templates that allow anonymous access
CREATE POLICY "Allow anonymous to create templates"
  ON module_templates
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anonymous to read templates"
  ON module_templates
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anonymous to update templates"
  ON module_templates
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous to delete custom templates"
  ON module_templates
  FOR DELETE
  TO anon, authenticated
  USING (is_default = false);