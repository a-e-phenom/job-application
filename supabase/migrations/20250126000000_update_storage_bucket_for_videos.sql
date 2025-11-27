/*
  # Update storage bucket to support videos

  1. Updates to storage bucket
    - `logo-images` bucket
      - Increase file_size_limit from 5MB to 50MB
      - Add video MIME types to allowed_mime_types

  2. Note
    - This migration updates the existing bucket if it exists
    - If the bucket doesn't exist, run setup_supabase_storage.sql first
*/

-- Update the logo-images bucket to support videos
-- This will update the bucket if it exists, or do nothing if it doesn't
UPDATE storage.buckets
SET 
  file_size_limit = 52428800, -- 50MB (increased from 5MB)
  allowed_mime_types = ARRAY[
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/svg+xml', 
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-msvideo'
  ]
WHERE id = 'logo-images';

-- If the bucket doesn't exist yet, create it
-- This is a fallback in case setup_supabase_storage.sql hasn't been run
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 
  'logo-images',
  'logo-images',
  true,
  52428800, -- 50MB limit
  ARRAY[
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/svg+xml', 
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-msvideo'
  ]
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'logo-images'
);

