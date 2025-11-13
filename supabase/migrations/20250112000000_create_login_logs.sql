-- Create login_logs table to track user logins
CREATE TABLE IF NOT EXISTS login_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  logged_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster queries
CREATE INDEX IF NOT EXISTS idx_login_logs_email ON login_logs(email);

-- Create index on logged_in_at for sorting
CREATE INDEX IF NOT EXISTS idx_login_logs_logged_in_at ON login_logs(logged_in_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert login logs (for recording logins)
CREATE POLICY "Allow insert login logs" ON login_logs
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to view all login logs
CREATE POLICY "Allow select login logs" ON login_logs
  FOR SELECT
  USING (true);

