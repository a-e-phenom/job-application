import { useState, useEffect, useCallback } from 'react';
import { supabase, DatabaseFlow } from '../lib/supabase';
import { ApplicationFlow } from '../types/flow';
import { generateUniqueSlug } from '../lib/utils';
import {
  FLOW_LIST_COLUMNS,
  FLOW_MUTATION_RETURN_COLUMNS,
  fetchFolderIdsMap,
  listRowToApplicationFlow,
  fetchFullFlowBySlug,
  fetchFullFlowById,
  FlowListRow
} from '../lib/flowQueries';
import { computeStepAndModuleCounts } from '../lib/flowCounts';

export function useFlows() {
  const [flows, setFlows] = useState<ApplicationFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const convertToDatabaseFlow = (
    flow: Omit<ApplicationFlow, 'id' | 'createdAt' | 'updatedAt'>
  ): Omit<DatabaseFlow, 'id' | 'created_at' | 'updated_at'> => {
    const { step_count, module_count } = computeStepAndModuleCounts(flow.steps);
    return {
      name: flow.name,
      description: flow.description,
      slug: flow.slug,
      steps: flow.steps,
      is_active: flow.isActive,
      primary_color: flow.primaryColor || '#6366F1',
      logo_url: flow.logoUrl || '',
      collect_feedback: flow.collectFeedback || false,
      folder_id: flow.folderId || null,
      step_count,
      module_count
    };
  };

  const updateFlowFolders = async (flowId: string, folderIds: string[]) => {
    try {
      await supabase.from('flow_folders').delete().eq('flow_id', flowId);

      if (folderIds.length > 0) {
        const associations = folderIds.map(folderId => ({
          flow_id: flowId,
          folder_id: folderId
        }));

        await supabase.from('flow_folders').insert(associations);
      }
    } catch (err) {
      console.error('Failed to update flow folders:', err);
      throw err;
    }
  };

  /** Folder-only updates: avoids sending full flow (and empty steps) over PostgREST */
  const syncFlowFolderIds = async (flowId: string, folderIds: string[]) => {
    await updateFlowFolders(flowId, folderIds);
    setFlows(prev => prev.map(f => (f.id === flowId ? { ...f, folderIds } : f)));
  };

  const fetchFlows = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('application_flows')
        .select(FLOW_LIST_COLUMNS)
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      const rows = (data || []) as FlowListRow[];
      const folderMap = await fetchFolderIdsMap(rows.map(r => r.id));

      const takenSlugs = rows.map(r => r.slug).filter(Boolean) as string[];
      const convertedFlows: ApplicationFlow[] = [];
      for (const row of rows) {
        const folderIds = folderMap.get(row.id) || [];
        let flow = listRowToApplicationFlow(row, folderIds, []);

        if (!flow.slug) {
          const slug = generateUniqueSlug(row.name, takenSlugs);
          takenSlugs.push(slug);
          await supabase.from('application_flows').update({ slug }).eq('id', row.id);
          flow = { ...flow, slug };
        }
        convertedFlows.push(flow);
      }

      setFlows(convertedFlows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch flows');
    } finally {
      setLoading(false);
    }
  };

  const fetchFlowBySlug = useCallback(async (slug: string) => {
    return fetchFullFlowBySlug(slug);
  }, []);

  const createFlow = async (flowData: Omit<ApplicationFlow, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const dbFlow = convertToDatabaseFlow(flowData);
      const { data, error: insertError } = await supabase
        .from('application_flows')
        .insert([dbFlow])
        .select(FLOW_MUTATION_RETURN_COLUMNS)
        .single();

      if (insertError) throw insertError;

      if (flowData.folderIds && flowData.folderIds.length > 0) {
        await updateFlowFolders(data.id, flowData.folderIds);
      }

      const folderIds = flowData.folderIds || [];
      const newFlow = listRowToApplicationFlow(data as FlowListRow, folderIds, flowData.steps);
      setFlows(prev => [newFlow, ...prev]);
      return newFlow;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create flow');
      throw err;
    }
  };

  const updateFlow = async (id: string, flowData: Omit<ApplicationFlow, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const dbFlow = convertToDatabaseFlow(flowData);
      const { data, error: updateError } = await supabase
        .from('application_flows')
        .update(dbFlow)
        .eq('id', id)
        .select(FLOW_MUTATION_RETURN_COLUMNS)
        .single();

      if (updateError) throw updateError;

      if (flowData.folderIds !== undefined) {
        await updateFlowFolders(id, flowData.folderIds);
      }

      let updatedFlow: ApplicationFlow | null = null;
      setFlows(prev => {
        const fromPrev = prev.find(f => f.id === id)?.folderIds || [];
        const folderIdsResolved =
          flowData.folderIds !== undefined ? flowData.folderIds : fromPrev;
        updatedFlow = {
          ...listRowToApplicationFlow(data as FlowListRow, folderIdsResolved, flowData.steps)
        };
        return prev.map(f => (f.id === id ? updatedFlow! : f));
      });

      if (!updatedFlow) throw new Error('Failed to merge updated flow');
      return updatedFlow;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update flow');
      throw err;
    }
  };

  const deleteFlow = async (id: string) => {
    try {
      const { error: deleteError } = await supabase.from('application_flows').delete().eq('id', id);

      if (deleteError) throw deleteError;

      setFlows(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete flow');
      throw err;
    }
  };

  const duplicateFlow = async (flow: ApplicationFlow) => {
    try {
      const full = await fetchFullFlowById(flow.id);
      if (!full) {
        throw new Error('Flow not found');
      }

      const duplicatedFlowData = {
        name: `${full.name} (copy)`,
        description: full.description,
        slug: generateUniqueSlug(`${full.name} (copy)`, flows.map(f => f.slug)),
        steps: full.steps,
        isActive: false,
        primaryColor: full.primaryColor,
        logoUrl: full.logoUrl,
        collectFeedback: full.collectFeedback,
        folderId: full.folderId,
        folderIds: full.folderIds
      };

      const dbFlow = convertToDatabaseFlow(duplicatedFlowData);
      const { data, error: insertError } = await supabase
        .from('application_flows')
        .insert([dbFlow])
        .select(FLOW_MUTATION_RETURN_COLUMNS)
        .single();

      if (insertError) throw insertError;

      if (full.folderIds && full.folderIds.length > 0) {
        await updateFlowFolders(data.id, full.folderIds);
      }

      const newFlow = listRowToApplicationFlow(
        data as FlowListRow,
        full.folderIds || [],
        duplicatedFlowData.steps
      );
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
    syncFlowFolderIds,
    fetchFlowBySlug,
    refetch: fetchFlows
  };
}
