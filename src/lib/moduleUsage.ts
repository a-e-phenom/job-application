import { ApplicationFlow } from '../types/flow';

export interface ModuleUsageEntry {
  component: string;
  name: string;
  flowCount: number;
}

export function formatComponentName(component: string | undefined | null): string {
  if (!component) return 'Unknown Module';
  return component
    .replace(/Step$/, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();
}

export function buildModuleUsageEntries(
  stats: Array<{ component: string; flowCount: number }>,
  componentNames: Record<string, string> = {}
): ModuleUsageEntry[] {
  return stats
    .filter(stat => Boolean(stat.component))
    .map(stat => ({
      component: stat.component,
      name: componentNames[stat.component] || formatComponentName(stat.component),
      flowCount: stat.flowCount
    }))
    .sort((a, b) => b.flowCount - a.flowCount || a.name.localeCompare(b.name));
}

export function computeModuleUsage(
  flows: Pick<ApplicationFlow, 'id' | 'name' | 'slug' | 'steps'>[],
  componentNames: Record<string, string> = {}
): ModuleUsageEntry[] {
  const usageMap = new Map<string, Set<string>>();

  for (const flow of flows) {
    const componentsInFlow = new Set<string>();

    for (const step of flow.steps || []) {
      for (const module of step.modules || []) {
        if (module.component) {
          componentsInFlow.add(module.component);
        }
      }
    }

    for (const component of componentsInFlow) {
      const flowIds = usageMap.get(component) ?? new Set<string>();
      flowIds.add(flow.id);
      usageMap.set(component, flowIds);
    }
  }

  return buildModuleUsageEntries(
    Array.from(usageMap.entries()).map(([component, flowIds]) => ({
      component,
      flowCount: flowIds.size
    })),
    componentNames
  );
}
