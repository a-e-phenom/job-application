# Job Application Flow Builder

A React application for creating and managing job application flows with assessment modules.

## Setup

### Supabase Configuration

To enable image upload functionality, you need to configure Supabase:

1. Create a `.env` file in the root directory
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

3. Run the database migrations in the `supabase/migrations/` directory to set up the required tables

### Image Upload Issues

If you encounter "failed to upload image" errors:

1. **Check Supabase Configuration**: Ensure your `.env` file has the correct Supabase URL and anonymous key
2. **Database Setup**: Make sure the `logo_images` table exists and has proper RLS policies
3. **Network Issues**: Check your internet connection and Supabase project status
4. **Fallback Option**: The app will offer to use the image preview as a fallback if upload fails

The image upload component will automatically detect connection issues and show appropriate error messages.

## Features

- Create and manage job application flows
- Multiple module types:
  - Contact Information
  - Pre-screening Questions
  - Screening Questions
  - Interview Scheduling
  - Resume Upload
  - Assessment (with customizable screens)
  - **Voice Screening Agent** (AI-powered voice interviews)
  - Video Interviews
  - Custom Forms
- Assessment modules with image upload support
- URL and file upload options for images
- Real-time connection status monitoring
- Graceful error handling with fallback options
- Folder organization for flows
- Flow templates and module templates
- Customizable branding (colors, logos)

## Voice Screening Agent

The Voice Screening Agent module enables AI-powered voice screening interviews. Key features:

- Welcome screen with clear instructions for candidates
- Interactive voice call interface with virtual agent "Rachel"
- Real-time call duration tracking
- Animated audio waveform visualization
- Clean, professional UI that adapts to your brand colors

For detailed information about the Voice Screening Agent module, see [VOICE_SCREENING_MODULE.md](VOICE_SCREENING_MODULE.md)
