import React, { useState } from 'react';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { testSupabaseConnection } from '../lib/supabase';

export default function UploadDiagnostics() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{
    connection: boolean | null;
    envVars: boolean | null;
    error?: string;
  }>({
    connection: null,
    envVars: null,
  });

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults({ connection: null, envVars: null });

    try {
      // Check environment variables
      const hasEnvVars = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
      
      // Test connection
      let connectionWorks = false;
      let error = '';
      
      if (hasEnvVars) {
        try {
          const result = await testSupabaseConnection();
          connectionWorks = result.success;
          error = result.error || '';
        } catch (err) {
          error = err instanceof Error ? err.message : 'Unknown error';
        }
      }

      setResults({
        connection: connectionWorks,
        envVars: hasEnvVars,
        error: error || undefined,
      });
    } catch (err) {
      setResults({
        connection: false,
        envVars: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Upload Diagnostics</h3>
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="flex items-center space-x-2 px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 disabled:opacity-50"
        >
          {isRunning ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
          <span>{isRunning ? 'Running...' : 'Run Diagnostics'}</span>
        </button>
      </div>

      {results.envVars !== null && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            {results.envVars ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm">
              Environment Variables: {results.envVars ? 'Configured' : 'Missing'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {results.connection ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm">
              Supabase Connection: {results.connection ? 'Working' : 'Failed'}
            </span>
          </div>

          {results.error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              Error: {results.error}
            </div>
          )}

          {!results.envVars && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
              <strong>Solution:</strong> Create a <code>.env</code> file with your Supabase credentials:
              <br />
              <code>VITE_SUPABASE_URL=your_project_url</code>
              <br />
              <code>VITE_SUPABASE_ANON_KEY=your_anon_key</code>
            </div>
          )}

          {results.envVars && !results.connection && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
              {results.error?.includes('logo_images table does not exist') ? (
                <>
                  <strong>Solution:</strong> The logo_images table is missing. Run the SQL script in <code>setup_logo_images_table.sql</code> in your Supabase SQL Editor.
                </>
              ) : (
                <>
                  <strong>Solution:</strong> Check your Supabase project URL and anonymous key, or ensure your database has the required tables.
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
