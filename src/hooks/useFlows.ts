import { useState, useEffect } from 'react';
import { supabase, DatabaseFlow } from '../lib/supabase';
import { ApplicationFlow } from '../types/flow';
import { generateUniqueSlug } from '../lib/utils';

export function useFlows() {
  const [flows, setFlows] = useState<ApplicationFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert database flow to application flow
  const convertToApplicationFlow = (dbFlow: DatabaseFlow): ApplicationFlow => {
    // Generate slug if it doesn't exist (for backward compatibility)
    let slug = dbFlow.slug;
    if (!slug) {
      slug = generateUniqueSlug(dbFlow.name, []);
      // Update the database with the generated slug
      updateFlowSlugInDatabase(dbFlow.id, slug);
    }
    
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
    collect_feedback: flow.collectFeedback || false
  });

  // Fetch all flows
  const fetchFlows = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('application_flows')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const convertedFlows = data.map(convertToApplicationFlow);
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

      const newFlow = convertToApplicationFlow(data);
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

      const updatedFlow = convertToApplicationFlow(data);
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
        collectFeedback: flow.collectFeedback
      };

      const dbFlow = convertToDatabaseFlow(duplicatedFlowData);
      const { data, error } = await supabase
        .from('application_flows')
        .insert([dbFlow])
        .select()
        .single();

      if (error) throw error;

      const newFlow = convertToApplicationFlow(data);
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
    refetch: fetchFlows
  };
}