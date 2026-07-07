import { PRIVACY_MODULES } from './modules';
import { PRIVACY_CONTROLS, getControlsForModule } from './controls';

export const MODULES_WITH_COUNTS = PRIVACY_MODULES.map((m) => ({
  ...m,
  controlCount: getControlsForModule(m.id).length,
}));

export function getModulesWithCounts() {
  return MODULES_WITH_COUNTS;
}

export function getProgramStats() {
  const modules = MODULES_WITH_COUNTS;
  const totalControls = PRIVACY_CONTROLS.length;
  const frameworkIds = ['nist-privacy', 'iso27701', 'gdpr', 'india-dpdp'] as const;

  return {
    moduleCount: modules.length,
    controlCount: totalControls,
    frameworkCount: frameworkIds.length,
    nistFunctions: 5,
    modules,
  };
}
