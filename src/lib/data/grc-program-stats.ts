import { GRC_MODULES } from '@/lib/data/grc-modules';
import { FRAMEWORKS } from '@/lib/data/frameworks';
import { CONTROLS } from '@/lib/data/controls';

export function getGrcProgramStats() {
  const controlCount = CONTROLS.length;
  return {
    moduleCount: GRC_MODULES.length,
    frameworkCount: FRAMEWORKS.length,
    controlCount,
    modules: GRC_MODULES,
  };
}
