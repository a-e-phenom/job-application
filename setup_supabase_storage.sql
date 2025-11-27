-- Setup script for Supabase Storage
-- Run this in your Supabase SQL Editor AFTER running setup_logo_images_table.sql

-- Create a storage bucket for logo images and videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logo-images',
  'logo-images',
  true,
  52428800, -- 50MB limit (increased to support videos)
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo']
);

-- Create policies for the logo-images bucket (supports both images and videos)
CREATE POLICY "Allow anonymous to upload logo images and videos"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'logo-images');

CREATE POLICY "Allow anonymous to view logo images and videos"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'logo-images');

CREATE POLICY "Allow anonymous to update logo images and videos"
  ON storage.objects
  FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'logo-images')
  WITH CHECK (bucket_id = 'logo-images');

CREATE POLICY "Allow anonymous to delete logo images and videos"
  ON storage.objects
  FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'logo-images');
