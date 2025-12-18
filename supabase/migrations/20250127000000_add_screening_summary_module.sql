/*
  # Add Screening Summary and Confirmation module template

  1. New Template
    - Add "Screening Summary and Confirmation" module template to module_templates table
*/

-- Insert screening summary module template
INSERT INTO module_templates (name, description, component, content, is_default) VALUES
(
  'Screening Summary and Confirmation',
  'Display a summary of screening answers with sections for Prior Affiliation and My Information, allowing review before submission',
  'ScreeningSummaryStep',
  '{
    "title": "Well done,",
    "subtitle": "You completed the screening process! You can review your answers before submitting.",
    "sections": [
      {
        "id": "prior-affiliation",
        "title": "Prior Affiliation",
        "fields": [
          {
            "label": "Are you currently a full time or part time employee at Midland University HealthLink? (fixed-term, agency workers and contractors excluded)",
            "value": "No"
          },
          {
            "label": "Have you ever worked for Midland University HealthLink?",
            "value": "No"
          },
          {
            "label": "Have you ever worked at Midland University HealthLink or any of its affiliates, including PPD, as either an employee or a contingent worker?",
            "value": "No"
          },
          {
            "label": "Email",
            "value": "myname@myemail.com"
          }
        ]
      },
      {
        "id": "my-information",
        "title": "My Information",
        "fields": [
          {
            "label": "Country",
            "value": "United States"
          },
          {
            "label": "Prefix",
            "value": "Ms."
          },
          {
            "label": "Given Name(s)",
            "value": "Jane"
          },
          {
            "label": "Family Name",
            "value": "Ferguson"
          },
          {
            "label": "I have a preferred name",
            "value": "No"
          },
          {
            "label": "Address Line 1",
            "value": "1903 Greyling Dr, Louisville, KY 40272"
          }
        ]
      }
    ]
  }'::jsonb,
  true
);
