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
  steps: any[];
  is_active: boolean;
  primary_color: string;
  logo_url: string;
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
    // Convert file to base64 for storage
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
  } catch (error) {
    console.error('Failed to upload logo image:', error);
    throw error;
  }
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