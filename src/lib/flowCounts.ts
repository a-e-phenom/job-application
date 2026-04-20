import { FlowStep } from '../types/flow';

/** Matches DB trigger logic for application_flows.step_count / module_count */
export function computeStepAndModuleCounts(steps: FlowStep[]): {
  step_count: number;
  module_count: number;
} {
  const step_count = steps?.length ?? 0;
  const module_count = (steps ?? []).reduce(
    (total, step) => total + (step.modules?.length ?? 0),
    0
  );
  return { step_count, module_count };
}
