/*
  # Create flows and templates tables

  1. New Tables
    - `application_flows`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `steps` (jsonb)
      - `is_active` (boolean)
      - `primary_color` (text)
      - `logo_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `module_templates`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `component` (text)
      - `content` (jsonb)
      - `is_default` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their data
*/

-- Create application_flows table
CREATE TABLE IF NOT EXISTS application_flows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT false,
  primary_color text DEFAULT '#6366F1',
  logo_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create module_templates table
CREATE TABLE IF NOT EXISTS module_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  component text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE application_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for application_flows
CREATE POLICY "Users can read all flows"
  ON application_flows
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create flows"
  ON application_flows
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update flows"
  ON application_flows
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete flows"
  ON application_flows
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for module_templates
CREATE POLICY "Users can read all templates"
  ON module_templates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create templates"
  ON module_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update templates"
  ON module_templates
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete custom templates"
  ON module_templates
  FOR DELETE
  TO authenticated
  USING (is_default = false);

-- Insert default module templates
INSERT INTO module_templates (name, description, component, content, is_default) VALUES
(
  'Contact Information',
  'Collect basic contact details like name, email, phone, and address',
  'ContactInfoStep',
  '{
    "title": "Contact Information",
    "subtitle": "Let''s make sure you''re not a secret agent. Or are you?",
    "questions": [
      {"id": "firstName", "text": "First name", "type": "text", "required": true},
      {"id": "lastName", "text": "Last name", "type": "text", "required": true},
      {"id": "email", "text": "Email address", "type": "text", "required": true},
      {"id": "phone", "text": "Phone number", "type": "text", "required": true},
      {"id": "address", "text": "Address", "type": "text", "required": false}
    ]
  }'::jsonb,
  true
),
(
  'Pre-screening Questions',
  'Initial qualification questions to filter candidates',
  'PreScreeningStep',
  '{
    "title": "Pre-application questionnaire",
    "subtitle": "This role has the following requirements:",
    "questions": [
      {"id": "age", "text": "Are you at least 18 of age?", "type": "radio", "options": ["Yes", "No"], "required": true},
      {"id": "authorization", "text": "Are you legally authorized to work in the United States?", "type": "radio", "options": ["Yes", "No"], "required": true},
      {"id": "sponsorship", "text": "Will you now or in the future require sponsorship to work in the US?", "type": "radio", "options": ["Yes", "No"], "required": true}
    ]
  }'::jsonb,
  true
),
(
  'Screening Questions',
  'Detailed questions about experience and qualifications',
  'ScreeningStep',
  '{
    "title": "Application questions",
    "subtitle": "This role has the following requirements:",
    "questions": [
      {"id": "eligibility", "text": "Are you legally eligible to work in the United States?", "type": "radio", "options": ["Yes", "No"], "required": true},
      {"id": "department", "text": "Which department interests you?", "type": "radio", "options": ["Management", "Sales"], "required": true},
      {"id": "motivation", "text": "What motivates you?", "type": "textarea", "required": true}
    ]
  }'::jsonb,
  true
),
(
  'Interview Scheduling',
  'Allow candidates to schedule interview slots',
  'InterviewSchedulingStep',
  '{
    "title": "Select date and time",
    "subtitle": "Choose your preferred interview slot",
    "customFields": {
      "meetingDuration": 60,
      "timeSlots": ["10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"],
      "timezones": [
        {"value": "UTC+05:30", "label": "(UTC + 05:30) Asia / Calcutta"},
        {"value": "UTC-08:00", "label": "(UTC - 08:00) America / Los_Angeles"},
        {"value": "UTC-05:00", "label": "(UTC - 05:00) America / New_York"}
      ]
    }
  }'::jsonb,
  true
),
(
  'Resume Upload',
  'Upload resume and provide additional information',
  'ResumeStep',
  '{
    "title": "Resume and additional info",
    "subtitle": "Let''s make sure you''re not a secret agent. Or are you?",
    "questions": [
      {"id": "resume", "text": "Upload your resume", "type": "file", "required": false},
      {"id": "previousWork", "text": "Have you previously worked for us?", "type": "radio", "options": ["Yes", "No"], "required": true},
      {"id": "hearAbout", "text": "How did you hear about us?", "type": "select", "options": ["Job Board", "Company Website", "Referral", "Social Media"], "required": true}
    ]
  }'::jsonb,
  true
),
(
  'Assessment',
  'Complete job-related assessment questions',
  'AssessmentStep',
  '{
    "title": "Welcome to the assessment!",
    "instructions": "You will choose the most suitable and least suitable response for each scenario.",
    "customFields": {
      "scenarios": [
        {
          "id": "scenario1",
          "title": "What do you do?",
          "description": "You are waiting for a colleague to take over at the end of your shift...",
          "responses": ["Contact your store manager", "Check if someone else is available", "Tell them you have to leave"]
        }
      ],
      "agreementQuestions": [
        {
          "id": "agreement1",
          "statement": "When faced with challenges, I tend to stick to strategies I already know."
        }
      ],
      "mathQuestions": [
        {
          "id": "math1",
          "title": "Read the text",
          "question": "What are the total monthly earnings of Sarah?",
          "description": "Sarah earned $1,500 base salary and 5% commission on $3,800 sales.",
          "options": ["$1,700", "$1,850", "$1,950", "$2,000"]
        }
      ]
    }
  }'::jsonb,
  true
);

-- Insert sample application flows
INSERT INTO application_flows (name, description, steps, is_active, logo_url) VALUES
(
  'Software Engineer Application',
  'Complete application flow for software engineering positions',
  '[
    {
      "id": "step1",
      "name": "Basic Information",
      "modules": [
        {
          "id": "contact-info",
          "name": "Contact Information",
          "description": "Collect basic contact details",
          "component": "ContactInfoStep"
        }
      ]
    },
    {
      "id": "step2",
      "name": "Qualification",
      "modules": [
        {
          "id": "pre-screening",
          "name": "Pre-screening Questions",
          "description": "Initial qualification questions",
          "component": "PreScreeningStep"
        }
      ]
    },
    {
      "id": "step3",
      "name": "Final Steps",
      "modules": [
        {
          "id": "interview-scheduling",
          "name": "Interview Scheduling",
          "description": "Schedule interview slots",
          "component": "InterviewSchedulingStep"
        }
      ]
    }
  ]'::jsonb,
  true,
  'https://mms.businesswire.com/media/20240122372572/en/1546931/5/Phenom_Lockup_RGB_Black.jpg?download=1'
),
(
  'Marketing Manager Flow',
  'Streamlined application process for marketing roles',
  '[
    {
      "id": "step1",
      "name": "Contact & Screening",
      "modules": [
        {
          "id": "contact-info",
          "name": "Contact Information",
          "description": "Collect basic contact details",
          "component": "ContactInfoStep"
        },
        {
          "id": "screening",
          "name": "Screening Questions",
          "description": "Detailed qualification questions",
          "component": "ScreeningStep"
        }
      ]
    }
  ]'::jsonb,
  false,
  'https://mms.businesswire.com/media/20240122372572/en/1546931/5/Phenom_Lockup_RGB_Black.jpg?download=1'
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_application_flows_updated_at
    BEFORE UPDATE ON application_flows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_module_templates_updated_at
    BEFORE UPDATE ON module_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();