# 🔧 Image Upload Fix Guide

## The Problem
You're getting upload errors when trying to upload images. This can happen for two main reasons:

1. **Missing Database Table** - The `logo_images` table doesn't exist
2. **Statement Timeout** - The image file is too large, causing database timeouts

## The Solution

### Step 1: Access Your Supabase Dashboard
1. Go to [supabase.com](https://supabase.com) and log in
2. Select your project
3. Go to the **SQL Editor** tab

### Step 2: Run the Database Migrations
1. **First Migration**: Copy the contents of `setup_logo_images_table.sql` and run it
2. **Second Migration**: Copy the contents of `setup_supabase_storage.sql` and run it
3. Click **Run** to execute each script

### Step 3: Verify Everything Was Created
1. **Database Table**: Go to **Table Editor** → You should see `logo_images` table
2. **Storage Bucket**: Go to **Storage** → You should see `logo-images` bucket
3. Both should be properly configured with the right permissions

### Step 4: Test the Upload
1. Refresh your application
2. Try uploading an image in the assessment module
3. The upload should now work!

## What the Migrations Do

**Database Migration (`setup_logo_images_table.sql`)**:
- ✅ The `logo_images` table with proper schema
- ✅ Row Level Security (RLS) policies for anonymous access
- ✅ Triggers for automatic `updated_at` timestamps
- ✅ Proper permissions for the `anon` and `authenticated` roles

**Storage Migration (`setup_supabase_storage.sql`)**:
- ✅ Creates `logo-images` storage bucket
- ✅ Sets up public access for uploaded images
- ✅ Configures file size limits (5MB) and allowed MIME types
- ✅ Creates RLS policies for anonymous uploads

## Troubleshooting

### If you still get errors:
1. **Check your `.env` file** - Make sure you have:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

2. **Verify RLS policies** - The migration should create policies, but if not:
   ```sql
   -- Check if policies exist
   SELECT * FROM pg_policies WHERE tablename = 'logo_images';
   ```

3. **Check table permissions**:
   ```sql
   -- Grant permissions if needed
   GRANT ALL ON logo_images TO anon;
   GRANT ALL ON logo_images TO authenticated;
   ```

### Alternative: Use URL Mode
If upload still doesn't work, you can always use **URL mode** instead:
1. Switch to "URL" tab in the image upload component
2. Paste a direct image URL (e.g., from imgur, your website, etc.)

## Enhanced Error Messages

The app now shows specific error messages:
- 🔍 **"logo_images table does not exist"** → Run the database migration
- ⏱️ **"Upload timed out"** → Image too large, try smaller file or URL mode
- 📁 **"File too large"** → Use image under 2MB or URL mode
- 🌐 **"Network error"** → Check internet connection
- 🔑 **"Permission denied"** → Check Supabase configuration
- ⚙️ **"Missing environment variables"** → Set up `.env` file

## How It Works Now

The upload system now uses a **hybrid approach**:
1. **First**: Tries Supabase Storage (faster, handles larger files)
2. **Fallback**: Uses database storage (for smaller files under 1MB)
3. **Smart Limits**: Prevents timeouts by limiting file sizes
4. **Better Errors**: Shows specific error messages with solutions

## Need Help?

If you're still having issues:
1. Check the browser console for detailed error messages
2. Use the Upload Diagnostics component (if available in the UI)
3. Verify your Supabase project is active and accessible
4. Make sure your Supabase URL and key are correct in the `.env` file

The enhanced error handling will now give you much clearer information about what's wrong!
