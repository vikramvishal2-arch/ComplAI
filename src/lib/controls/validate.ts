import { getControlById, getAllControlsForActivatedFrameworks } from '../data/controls';
import { getFrameworkById } from '../data/frameworks';
import { getActivatedFrameworkIds } from '../store';
import type { Control } from '../types';

export class ControlValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ControlValidationError';
  }
}

export async function validateControlForOrganization(controlId: string): Promise<Control> {
  const control = getControlById(controlId);
  if (!control) {
    throw new ControlValidationError(
      'Control not found. Select a control from an activated framework.'
    );
  }

  const activatedIds = await getActivatedFrameworkIds();
  if (!activatedIds.includes(control.frameworkId)) {
    const fw = getFrameworkById(control.frameworkId);
    throw new ControlValidationError(
      `Framework "${fw?.shortName ?? control.frameworkId}" is not activated. Activate it in Framework Library first.`
    );
  }

  return control;
}

export async function getLinkableControlsForOrganization(): Promise<
  (Control & { frameworkShortName: string })[]
> {
  const activatedIds = await getActivatedFrameworkIds();
  return getAllControlsForActivatedFrameworks(activatedIds).map((control) => ({
    ...control,
    frameworkShortName: getFrameworkById(control.frameworkId)?.shortName ?? control.frameworkId,
  }));
}
