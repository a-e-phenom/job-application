/*
  # Add collect_feedback field to application_flows table

  1. Add collect_feedback column to application_flows table
  2. Set default value to false for existing flows
  3. Make the column NOT NULL
*/

-- Add collect_feedback column with default value false
ALTER TABLE application_flows ADD COLUMN IF NOT EXISTS collect_feedback boolean DEFAULT false;

-- Make collect_feedback field required (NOT NULL)
ALTER TABLE application_flows ALTER COLUMN collect_feedback SET NOT NULL;

-- Add comment to the collect_feedback column
COMMENT ON COLUMN application_flows.collect_feedback IS 'Whether to collect feedback from candidates at the end of the application flow';
