import React, { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { uploadLogoImage, testSupabaseConnection } from '../lib/supabase';

interface ImageUploadComponentProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export default function ImageUploadComponent({ 
  value, 
  onChange, 
  placeholder = "https://example.com/image.png",
  label = "Image",
  className = ""
}: ImageUploadComponentProps) {
  const [uploadMode, setUploadMode] = useState<'url' | 'upload'>('url');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
  const [connectionError, setConnectionError] = useState<string>('');

  // Test Supabase connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      const result = await testSupabaseConnection();
      setConnectionStatus(result.success ? 'connected' : 'failed');
      setConnectionError(result.error || '');
    };
    
    testConnection();
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (2MB limit to prevent timeouts)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB to prevent upload timeouts. Please use a smaller image or URL mode.');
      return;
    }

    setUploadedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase
    setIsUploading(true);
    try {
      const uploadedUrl = await uploadLogoImage(file);
      onChange(uploadedUrl);
    } catch (error) {
      console.error('Failed to upload image:', error);
      
      // More detailed error message
      let errorMessage = 'Failed to upload image. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('Missing Supabase environment variables')) {
          errorMessage = 'Supabase configuration is missing. Please check your environment variables.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'Permission denied. Please check your Supabase configuration.';
        } else if (error.message.includes('statement timeout') || error.message.includes('57014')) {
          errorMessage = 'Upload timed out. The image may be too large. Try a smaller image or use URL mode.';
        } else if (error.message.includes('File too large')) {
          errorMessage = 'Image is too large. Please use a smaller image (under 1MB) or use URL mode.';
        } else {
          errorMessage = `Upload failed: ${error.message}`;
        }
      }
      
      // Ask user if they want to use the preview image as a fallback
      const usePreview = confirm(`${errorMessage}\n\nWould you like to use the image preview instead? (Note: This will only work locally)`);
      
      if (usePreview && preview) {
        onChange(preview);
      } else {
        // Reset the file selection on error
        setUploadedFile(null);
        setPreview(null);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setPreview(null);
    onChange('');
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setUploadMode('url')}
            className={`px-3 py-1 text-xs rounded transition-colors duration-200 ${
              uploadMode === 'url'
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                : 'text-gray-600 hover:text-gray-800 border border-gray-200'
            }`}
          >
            URL
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('upload')}
            disabled={connectionStatus === 'failed'}
            className={`px-3 py-1 text-xs rounded transition-colors duration-200 ${
              uploadMode === 'upload'
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                : connectionStatus === 'failed'
                ? 'text-gray-400 border border-gray-200 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800 border border-gray-200'
            }`}
          >
            Upload
          </button>
        </div>
        
        {/* Connection status indicator */}
        {connectionStatus === 'checking' && (
          <span className="text-xs text-gray-500">Checking connection...</span>
        )}
        {connectionStatus === 'failed' && (
          <span className="text-xs text-red-500" title={connectionError}>
            Upload unavailable
          </span>
        )}
        {connectionStatus === 'connected' && uploadMode === 'upload' && (
          <span className="text-xs text-green-500">✓ Connected</span>
        )}
      </div>

      {uploadMode === 'url' ? (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      ) : (
        <div className="space-y-2">
          {connectionStatus === 'failed' ? (
            <div className="border-2 border-dashed border-red-300 rounded-lg p-4 text-center bg-red-50">
              <div className="w-8 h-8 mx-auto bg-red-100 rounded-lg flex items-center justify-center mb-2">
                <X className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-red-600 text-sm mb-1">
                Upload service unavailable
              </p>
              <p className="text-xs text-red-500 mb-2">
                {connectionError || 'Please use URL mode instead or check your Supabase configuration'}
              </p>
              {connectionError?.includes('logo_images table does not exist') && (
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                  <strong>Solution:</strong> Run the SQL script in <code>setup_logo_images_table.sql</code> in your Supabase SQL Editor
                </div>
              )}
            </div>
          ) : !uploadedFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors duration-200">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id={`image-upload-${label.toLowerCase().replace(/\s+/g, '-')}`}
                disabled={isUploading || connectionStatus === 'failed'}
              />
              <label 
                htmlFor={`image-upload-${label.toLowerCase().replace(/\s+/g, '-')}`} 
                className={`cursor-pointer ${isUploading || connectionStatus === 'failed' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="w-8 h-8 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                  <Upload className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-gray-600 text-sm mb-1">
                  {isUploading ? 'Uploading...' : 'Drop image here or click to upload'}
                </p>
                <p className="text-xs text-gray-500">
                  Supports JPEG, PNG, GIF, SVG (max 2MB)
                </p>
              </label>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{uploadedFile.name}</span>
                <button
                  type="button"
                  onClick={removeUploadedFile}
                  className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {preview && (
                <div className="mt-2">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-[500px] h-auto rounded border border-gray-200"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {value && uploadMode === 'url' && (
        <div className="mt-2">
          <img 
            src={value} 
            alt="Preview" 
            className="w-[500px] h-auto rounded border border-gray-200"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
}
