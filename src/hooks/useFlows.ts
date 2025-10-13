import { useState, useEffect } from 'react';
import { supabase, DatabaseFlow } from '../lib/supabase';
import { ApplicationFlow } from '../types/flow';
import { generateUniqueSlug } from '../lib/utils';

export function useFlows() {
  const [flows, setFlows] = useState<ApplicationFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert database flow to application flow
  const convertToApplicationFlow = async (dbFlow: DatabaseFlow): Promise<ApplicationFlow> => {
    // Generate slug if it doesn't exist (for backward compatibility)
    let slug = dbFlow.slug;
    if (!slug) {
      slug = generateUniqueSlug(dbFlow.name, []);
      // Update the database with the generated slug
      updateFlowSlugInDatabase(dbFlow.id, slug);
    }
    
    // Fetch folder associations from junction table
    const { data: folderAssociations } = await supabase
      .from('flow_folders')
      .select('folder_id')
      .eq('flow_id', dbFlow.id);
    
    const folderIds = folderAssociations?.map(fa => fa.folder_id) || [];
    
    return {
      id: dbFlow.id,
      name: dbFlow.name,
      description: dbFlow.description,
      slug,
      steps: dbFlow.steps,
      isActive: dbFlow.is_active,
      primaryColor: dbFlow.primary_color,
      logoUrl: dbFlow.logo_url,
      collectFeedback: dbFlow.collect_feedback || false,
      folderId: dbFlow.folder_id || undefined, // Keep for backward compatibility
      folderIds, // New many-to-many relationship
      createdAt: new Date(dbFlow.created_at),
      updatedAt: new Date(dbFlow.updated_at)
    };
  };

  // Helper function to update slug in database
  const updateFlowSlugInDatabase = async (flowId: string, slug: string) => {
    try {
      await supabase
        .from('application_flows')
        .update({ slug })
        .eq('id', flowId);
    } catch (error) {
      console.error('Failed to update flow slug:', error);
    }
  };

  // Convert application flow to database format
  const convertToDatabaseFlow = (flow: Omit<ApplicationFlow, 'id' | 'createdAt' | 'updatedAt'>): Omit<DatabaseFlow, 'id' | 'created_at' | 'updated_at'> => ({
    name: flow.name,
    description: flow.description,
    slug: flow.slug,
    steps: flow.steps,
    is_active: flow.isActive,
    primary_color: flow.primaryColor || '#6366F1',
    logo_url: flow.logoUrl || '',
    collect_feedback: flow.collectFeedback || false,
    folder_id: flow.folderId || null // Keep for backward compatibility
  });

  // Add or remove flow-folder associations
  const updateFlowFolders = async (flowId: string, folderIds: string[]) => {
    try {
      // First, remove all existing associations
      await supabase
        .from('flow_folders')
        .delete()
        .eq('flow_id', flowId);

      // Then, add new associations
      if (folderIds.length > 0) {
        const associations = folderIds.map(folderId => ({
          flow_id: flowId,
          folder_id: folderId
        }));
        
        await supabase
          .from('flow_folders')
          .insert(associations);
      }
    } catch (err) {
      console.error('Failed to update flow folders:', err);
      throw err;
    }
  };

  // Fetch all flows
  const fetchFlows = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('application_flows')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const convertedFlows = await Promise.all(data.map(convertToApplicationFlow));
      setFlows(convertedFlows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch flows');
    } finally {
      setLoading(false);
    }
  };

  // Create new flow
  const createFlow = async (flowData: Omit<ApplicationFlow, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const dbFlow = convertToDatabaseFlow(flowData);
      const { data, error } = await supabase
        .from('application_flows')
        .insert([dbFlow])
        .select()
        .single();

      if (error) throw error;

      // Update folder associations if folderIds are provided
      if (flowData.folderIds && flowData.folderIds.length > 0) {
        await updateFlowFolders(data.id, flowData.folderIds);
      }

      const newFlow = await convertToApplicationFlow(data);
      setFlows(prev => [newFlow, ...prev]);
      return newFlow;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create flow');
      throw err;
    }
  };

  // Update existing flow
  const updateFlow = async (id: string, flowData: Omit<ApplicationFlow, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const dbFlow = convertToDatabaseFlow(flowData);
      const { data, error } = await supabase
        .from('application_flows')
        .update(dbFlow)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update folder associations if folderIds are provided
      if (flowData.folderIds !== undefined) {
        await updateFlowFolders(id, flowData.folderIds);
      }

      const updatedFlow = await convertToApplicationFlow(data);
      setFlows(prev => prev.map(f => f.id === id ? updatedFlow : f));
      return updatedFlow;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update flow');
      throw err;
    }
  };

  // Delete flow
  const deleteFlow = async (id: string) => {
    try {
      const { error } = await supabase
        .from('application_flows')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFlows(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete flow');
      throw err;
    }
  };

  // Duplicate flow
  const duplicateFlow = async (flow: ApplicationFlow) => {
    try {
      const duplicatedFlowData = {
        name: `${flow.name} (copy)`,
        description: flow.description,
        slug: generateUniqueSlug(`${flow.name} (copy)`, flows.map(f => f.slug)),
        steps: flow.steps,
        isActive: false, // Duplicated flows start as inactive
        primaryColor: flow.primaryColor,
        logoUrl: flow.logoUrl,
        collectFeedback: flow.collectFeedback,
        folderId: flow.folderId,
        folderIds: flow.folderIds // Keep the same folder associations
      };

      const dbFlow = convertToDatabaseFlow(duplicatedFlowData);
      const { data, error } = await supabase
        .from('application_flows')
        .insert([dbFlow])
        .select()
        .single();

      if (error) throw error;

      // Duplicate folder associations
      if (flow.folderIds && flow.folderIds.length > 0) {
        await updateFlowFolders(data.id, flow.folderIds);
      }

      const newFlow = await convertToApplicationFlow(data);
      setFlows(prev => [newFlow, ...prev]);
      return newFlow;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate flow');
      throw err;
    }
  };

  useEffect(() => {
    fetchFlows();
  }, []);

  return {
    flows,
    loading,
    error,
    createFlow,
    updateFlow,
    deleteFlow,
    duplicateFlow,
    updateFlowFolders,
    refetch: fetchFlows
  };
}