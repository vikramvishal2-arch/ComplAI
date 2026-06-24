import { getControlById } from '../data/controls';
import { getPolicyTemplateDef } from '../data/policy-template-catalog';

/** Convert Annex A reference (e.g. A.5.1) to platform control id (iso-a5-1). */
export function annexARefToControlId(ref: string): string | null {
  const match = ref.trim().match(/^A\.(\d+)\.(\d+)$/i);
  if (!match) return null;
  const id = `iso-a${match[1]}-${match[2]}`;
  return getControlById(id) ? id : null;
}

/** Parse ISO reference strings (single, ranged, or multiple) into control ids. */
export function parseIsoReferenceToControlIds(isoReference: string): string[] {
  if (!isoReference.trim()) return [];

  const ids = new Set<string>();
  const normalized = isoReference.replace(/–/g, '-').replace(/\//g, ' ');
  const rangePattern = /A\.(\d+)\.(\d+)\s*-\s*A\.(\d+)\.(\d+)/gi;

  let rangeMatch: RegExpExecArray | null;
  while ((rangeMatch = rangePattern.exec(normalized)) !== null) {
    const chStart = Number(rangeMatch[1]);
    const numStart = Number(rangeMatch[2]);
    const chEnd = Number(rangeMatch[3]);
    const numEnd = Number(rangeMatch[4]);

    if (chStart === chEnd) {
      for (let n = numStart; n <= numEnd; n++) {
        const id = annexARefToControlId(`A.${chStart}.${n}`);
        if (id) ids.add(id);
      }
    } else {
      for (let n = numStart; n <= numEnd; n++) {
        const id = annexARefToControlId(`A.${chEnd}.${n}`);
        if (id) ids.add(id);
      }
      const startId = annexARefToControlId(`A.${chStart}.${numStart}`);
      if (startId) ids.add(startId);
    }
  }

  const withoutRanges = normalized.replace(rangePattern, ' ');
  for (const m of withoutRanges.matchAll(/A\.(\d+)\.(\d+)/gi)) {
    const id = annexARefToControlId(`A.${m[1]}.${m[2]}`);
    if (id) ids.add(id);
  }

  return [...ids];
}

export function resolvePolicyControlIds(input: {
  templateId?: string | null;
  isoReference?: string;
  linkedControlIds?: string[] | null;
}): string[] {
  if (input.linkedControlIds?.length) {
    return input.linkedControlIds.filter((id) => getControlById(id));
  }
  if (input.templateId) {
    const def = getPolicyTemplateDef(input.templateId);
    if (def?.controlIds?.length) {
      return def.controlIds.filter((id) => getControlById(id));
    }
  }
  return parseIsoReferenceToControlIds(input.isoReference ?? '');
}
