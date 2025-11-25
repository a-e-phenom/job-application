/*
  # Add Voice Screening Module

  1. Changes
    - Add voice screening module template to module_templates table
*/

-- Insert or update voice screening module template
INSERT INTO module_templates (name, description, component, content, is_default) VALUES
(
  'Voice Screening Agent',
  'AI-powered voice screening interview with virtual agent',
  'VoiceScreeningStep',
  '{
    "title": "You''re invited to a screening with our virtual agent!",
    "subtitle": "",
    "splitScreenWithImage": true,
    "splitScreenImage": "/screeningintro.png",
    "splitScreenImagePosition": "left"
  }'::jsonb,
  true
)
ON CONFLICT (component) 
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  is_default = EXCLUDED.is_default,
  updated_at = now();


