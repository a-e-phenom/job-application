import { supabase, DatabaseFlow } from './supabase';
import { ApplicationFlow } from '../types/flow';
import { generateUniqueSlug } from './utils';
import { computeStepAndModuleCounts } from './flowCounts';

/** Columns for list views — omits `steps` (large JSON) to reduce PostgREST egress */
export const FLOW_LIST_COLUMNS =
  'id, name, description, slug, is_active, primary_color, logo_url, collect_feedback, folder_id, created_at, updated_at, step_count, module_count';

export const FLOW_MUTATION_RETURN_COLUMNS = FLOW_LIST_COLUMNS;

export type FlowListRow = Omit<DatabaseFlow, 'steps'> & { steps?: unknown };

export async function fetchFolderIdsMap(flowIds: string[]): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (flowIds.length === 0) return map;

  const { data, error } = await supabase
    .from('flow_folders')
    .select('flow_id, folder_id')
    .in('flow_id', flowIds);

  if (error) throw error;

  for (const row of data || []) {
    const fid = row.flow_id as string;
    const list = map.get(fid) || [];
    list.push(row.folder_id as string);
    map.set(fid, list);
  }
  return map;
}

export function listRowToApplicationFlow(
  row: FlowListRow,
  folderIds: string[],
  steps: ApplicationFlow['steps'] = []
): ApplicationFlow {
  const counts =
    steps.length > 0
      ? computeStepAndModuleCounts(steps)
      : {
          step_count: row.step_count ?? 0,
          module_count: row.module_count ?? 0
        };

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    slug: row.slug || '',
    steps,
    isActive: row.is_active,
    primaryColor: row.primary_color,
    logoUrl: row.logo_url,
    collectFeedback: row.collect_feedback || false,
    folderId: row.folder_id || undefined,
    folderIds,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    stepCount: counts.step_count,
    moduleCount: counts.module_count
  };
}

async function ensureSlugOnRow(row: FlowListRow): Promise<string> {
  if (row.slug && String(row.slug).trim()) return row.slug;
  const slug = generateUniqueSlug(row.name, []);
  await supabase.from('application_flows').update({ slug }).eq('id', row.id);
  return slug;
}

/** One flow with full `steps` + folders (candidate runner, duplicate, etc.) */
export async function fetchFullFlowBySlug(slug: string): Promise<ApplicationFlow | null> {
  const { data, error } = await supabase
    .from('application_flows')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return fullDbRowToApplicationFlow(data as DatabaseFlow);
}

export async function fetchFullFlowById(id: string): Promise<ApplicationFlow | null> {
  const { data, error } = await supabase
    .from('application_flows')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return fullDbRowToApplicationFlow(data as DatabaseFlow);
}

export async function fullDbRowToApplicationFlow(dbFlow: DatabaseFlow): Promise<ApplicationFlow> {
  const slug = await ensureSlugOnRow(dbFlow);

  const { data: folderAssociations } = await supabase
    .from('flow_folders')
    .select('folder_id')
    .eq('flow_id', dbFlow.id);

  const folderIds = folderAssociations?.map(fa => fa.folder_id) || [];

  const steps = (dbFlow.steps || []) as ApplicationFlow['steps'];
  const computed = computeStepAndModuleCounts(steps);

  return {
    id: dbFlow.id,
    name: dbFlow.name,
    description: dbFlow.description,
    slug,
    steps,
    isActive: dbFlow.is_active,
    primaryColor: dbFlow.primary_color,
    logoUrl: dbFlow.logo_url,
    collectFeedback: dbFlow.collect_feedback || false,
    folderId: dbFlow.folder_id || undefined,
    folderIds,
    createdAt: new Date(dbFlow.created_at),
    updatedAt: new Date(dbFlow.updated_at),
    stepCount: dbFlow.step_count ?? computed.step_count,
    moduleCount: dbFlow.module_count ?? computed.module_count
  };
}
