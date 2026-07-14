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

/** Validate many controls with a single activated-framework lookup. */
export async function validateControlsForOrganization(
  controlIds: string[]
): Promise<Control[]> {
  const unique = Array.from(new Set(controlIds.map((id) => id.trim()).filter(Boolean)));
  if (unique.length === 0) return [];

  const activatedIds = await getActivatedFrameworkIds();
  const controls: Control[] = [];

  for (const controlId of unique) {
    const control = getControlById(controlId);
    if (!control) {
      throw new ControlValidationError(
        'Control not found. Select a control from an activated framework.'
      );
    }
    if (!activatedIds.includes(control.frameworkId)) {
      const fw = getFrameworkById(control.frameworkId);
      throw new ControlValidationError(
        `Framework "${fw?.shortName ?? control.frameworkId}" is not activated. Activate it in Framework Library first.`
      );
    }
    controls.push(control);
  }

  return controls;
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
