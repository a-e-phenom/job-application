import { useState, useEffect } from 'react';
import { supabase, DatabaseFolder } from '../lib/supabase';
import { Folder } from '../types/folder';

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert database folder to folder
  const convertToFolder = (dbFolder: DatabaseFolder & { flow_count?: number }): Folder => ({
    id: dbFolder.id,
    name: dbFolder.name,
    description: dbFolder.description,
    createdAt: new Date(dbFolder.created_at),
    updatedAt: new Date(dbFolder.updated_at),
    flowCount: dbFolder.flow_count || 0
  });

  // Convert folder to database format
  const convertToDatabaseFolder = (folder: Omit<Folder, 'id' | 'createdAt' | 'updatedAt' | 'flowCount'>): Omit<DatabaseFolder, 'id' | 'created_at' | 'updated_at'> => ({
    name: folder.name,
    description: folder.description || ''
  });

  // Fetch all folders with flow counts
  const fetchFolders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get flow counts for each folder
      const foldersWithCounts = await Promise.all(
        data.map(async (folder) => {
          const { count } = await supabase
            .from('application_flows')
            .select('*', { count: 'exact', head: true })
            .eq('folder_id', folder.id);
          
          return {
            ...folder,
            flow_count: count || 0
          };
        })
      );

      const convertedFolders = foldersWithCounts.map(convertToFolder);
      setFolders(convertedFolders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch folders');
    } finally {
      setLoading(false);
    }
  };

  // Create new folder
  const createFolder = async (folderData: Omit<Folder, 'id' | 'createdAt' | 'updatedAt' | 'flowCount'>) => {
    try {
      console.log('Creating folder in database:', folderData);
      const dbFolder = convertToDatabaseFolder(folderData);
      console.log('Converted to database format:', dbFolder);
      
      const { data, error } = await supabase
        .from('folders')
        .insert([dbFolder])
        .select()
        .single();

      console.log('Database response:', { data, error });
      if (error) throw error;

      const newFolder = convertToFolder({ ...data, flow_count: 0 });
      console.log('New folder created:', newFolder);
      setFolders(prev => [newFolder, ...prev]);
      return newFolder;
    } catch (err) {
      console.error('Error creating folder:', err);
      setError(err instanceof Error ? err.message : 'Failed to create folder');
      throw err;
    }
  };

  // Update existing folder
  const updateFolder = async (id: string, folderData: Omit<Folder, 'id' | 'createdAt' | 'updatedAt' | 'flowCount'>) => {
    try {
      const dbFolder = convertToDatabaseFolder(folderData);
      const { data, error } = await supabase
        .from('folders')
        .update(dbFolder)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedFolder = convertToFolder({ ...data, flow_count: 0 });
      setFolders(prev => prev.map(f => f.id === id ? updatedFolder : f));
      return updatedFolder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update folder');
      throw err;
    }
  };

  // Delete folder
  const deleteFolder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFolders(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete folder');
      throw err;
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  return {
    folders,
    loading,
    error,
    createFolder,
    updateFolder,
    deleteFolder,
    refetch: fetchFolders
  };
}
