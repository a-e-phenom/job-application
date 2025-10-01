-- Setup script for Supabase Storage
-- Run this in your Supabase SQL Editor AFTER running setup_logo_images_table.sql

-- Create a storage bucket for logo images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logo-images',
  'logo-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp']
);

-- Create policies for the logo-images bucket
CREATE POLICY "Allow anonymous to upload logo images"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'logo-images');

CREATE POLICY "Allow anonymous to view logo images"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'logo-images');

CREATE POLICY "Allow anonymous to update logo images"
  ON storage.objects
  FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'logo-images')
  WITH CHECK (bucket_id = 'logo-images');

CREATE POLICY "Allow anonymous to delete logo images"
  ON storage.objects
  FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'logo-images');
