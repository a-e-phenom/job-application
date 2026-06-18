import { supabase } from './supabase';
import { ApplicationFlow } from '../types/flow';
import { buildModuleUsageEntries, computeModuleUsage, ModuleUsageEntry } from './moduleUsage';

const FLOW_BATCH_SIZE = 4;

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as { message: unknown }).message);
  }
  return 'Request failed';
}

async function fetchModuleUsageViaRpc(): Promise<ModuleUsageEntry[] | null> {
  const { data, error } = await supabase.rpc('get_module_usage');

  if (error) {
    if (error.code === 'PGRST202' || error.code === '42883') {
      return null;
    }
    throw error;
  }

  const rows = (data || []) as Array<{ component: string; flow_count: number | string }>;
  return buildModuleUsageEntries(
    rows
      .filter(row => row.component)
      .map(row => ({
        component: row.component,
        flowCount: Number(row.flow_count)
      }))
  );
}

async function fetchFlowsStepsInBatches(
  flowIds: string[]
): Promise<Pick<ApplicationFlow, 'id' | 'steps'>[]> {
  const results: Pick<ApplicationFlow, 'id' | 'steps'>[] = [];

  for (let index = 0; index < flowIds.length; index += FLOW_BATCH_SIZE) {
    const batch = flowIds.slice(index, index + FLOW_BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async flowId => {
        const { data, error } = await supabase
          .from('application_flows')
          .select('id, steps')
          .eq('id', flowId)
          .single();

        if (error) {
          console.warn(`Failed to fetch steps for flow ${flowId}:`, error.message);
          return { id: flowId, steps: [] as ApplicationFlow['steps'] };
        }

        return {
          id: data.id,
          steps: (data.steps || []) as ApplicationFlow['steps']
        };
      })
    );

    results.push(...batchResults);
  }

  return results;
}

async function fetchModuleUsageViaBatches(
  componentNames: Record<string, string>
): Promise<ModuleUsageEntry[]> {
  const { data: flowRows, error: listError } = await supabase
    .from('application_flows')
    .select('id, name, slug');

  if (listError) throw listError;

  const flows = flowRows || [];
  if (flows.length === 0) return [];

  const stepsByFlowId = await fetchFlowsStepsInBatches(flows.map(flow => flow.id));
  const stepsMap = new Map(stepsByFlowId.map(flow => [flow.id, flow.steps]));

  return computeModuleUsage(
    flows.map(flow => ({
      id: flow.id,
      name: flow.name,
      slug: flow.slug,
      steps: stepsMap.get(flow.id) || []
    })),
    componentNames
  );
}

export async function fetchModuleUsageReport(): Promise<{
  entries: ModuleUsageEntry[];
  totalFlows: number;
}> {
  const [{ count, error: countError }, { data: templateRows, error: templatesError }] =
    await Promise.all([
      supabase.from('application_flows').select('*', { count: 'exact', head: true }),
      supabase.from('module_templates').select('name, component')
    ]);

  if (countError) throw countError;
  if (templatesError) throw templatesError;

  const componentNames: Record<string, string> = {};
  for (const template of templateRows || []) {
    if (template.component) {
      componentNames[template.component] = template.name;
    }
  }

  const rpcEntries = await fetchModuleUsageViaRpc();
  if (rpcEntries) {
    return {
      entries: rpcEntries.map(entry => ({
        ...entry,
        name: componentNames[entry.component] || entry.name
      })),
      totalFlows: count ?? 0
    };
  }

  const entries = await fetchModuleUsageViaBatches(componentNames);
  return {
    entries,
    totalFlows: count ?? 0
  };
}

export { getErrorMessage };
