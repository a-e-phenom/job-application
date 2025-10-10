import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DatabaseFlow {
  id: string;
  name: string;
  description: string;
  slug: string;
  steps: any[];
  is_active: boolean;
  primary_color: string;
  logo_url: string;
  collect_feedback: boolean;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseFolder {
  id: string;
  name: string;
  description: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseTemplate {
  id: string;
  name: string;
  description: string;
  component: string;
  content: any;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseLogoImage {
  id: string;
  filename: string;
  content_type: string;
  file_data: Uint8Array;
  file_size: number;
  created_at: string;
  updated_at: string;
}

// Logo image utilities
export const uploadLogoImage = async (file: File): Promise<string> => {
  try {
    // First, try using Supabase Storage (more efficient for large files)
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('logo-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.log('Storage upload failed, falling back to database:', uploadError);
      // Fallback to database storage for smaller files
      return await uploadToDatabase(file);
    }

    // Get public URL from storage
    const { data: urlData } = supabase.storage
      .from('logo-images')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Failed to upload logo image:', error);
    throw error;
  }
};

// Fallback method for database storage (for smaller files)
const uploadToDatabase = async (file: File): Promise<string> => {
  // Only use database for files smaller than 1MB to avoid timeouts
  if (file.size > 1024 * 1024) {
    throw new Error('File too large for database storage. Please use a smaller image or check Supabase Storage configuration.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  const { data, error } = await supabase
    .from('logo_images')
    .insert([{
      filename: file.name,
      content_type: file.type,
      file_data: uint8Array,
      file_size: file.size
    }])
    .select()
    .single();

  if (error) throw error;

  // Return a data URL that can be used as logo_url
  return `data:${file.type};base64,${btoa(String.fromCharCode(...uint8Array))}`;
};

export const getLogoImageUrl = async (logoId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('logo_images')
      .select('content_type, file_data')
      .eq('id', logoId)
      .single();

    if (error) throw error;
    if (!data) return null;

    // Convert bytea back to data URL
    const uint8Array = new Uint8Array(data.file_data);
    return `data:${data.content_type};base64,${btoa(String.fromCharCode(...uint8Array))}`;
  } catch (error) {
    console.error('Failed to get logo image:', error);
    return null;
  }
};

// Test Supabase connection
export const testSupabaseConnection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    // First test database connection
    const { data, error } = await supabase
      .from('logo_images')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Supabase database test failed:', error);
      
      // Check for specific error types
      if (error.code === 'PGRST116' || error.message?.includes('relation "logo_images" does not exist')) {
        return { 
          success: false, 
          error: 'logo_images table does not exist. Please run the database migration.' 
        };
      }
      
      return { 
        success: false, 
        error: error.message || 'Database connection failed' 
      };
    }
    
    // Test storage connection
    try {
      const { data: storageData, error: storageError } = await supabase.storage
        .from('logo-images')
        .list('', { limit: 1 });
      
      if (storageError) {
        console.log('Storage not available, using database fallback:', storageError);
        // Storage not available, but database works - this is okay
        return { success: true };
      }
      
      console.log('Supabase connection test successful (database + storage)');
      return { success: true };
    } catch (storageError) {
      console.log('Storage test failed, using database fallback:', storageError);
      return { success: true }; // Database works, storage is optional
    }
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};