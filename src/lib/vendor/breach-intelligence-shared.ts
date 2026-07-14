import type { VendorBreachIntel, VendorBreachRecord } from './breach-intelligence-types';

export type { VendorBreachIntel, VendorBreachRecord } from './breach-intelligence-types';

export function parseBreachIntel(value: unknown): VendorBreachIntel | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const v = value as Partial<VendorBreachIntel>;
  if (!v.domain && !v.checkedAt) return null;
  if (Object.keys(v).length === 0) return null;
  return {
    domain: v.domain ?? '',
    checkedAt: v.checkedAt ?? '',
    live: Boolean(v.live),
    source: 'haveibeenpwned',
    status: (v.status as VendorBreachIntel['status']) ?? 'skipped',
    breachCount: typeof v.breachCount === 'number' ? v.breachCount : 0,
    breaches: Array.isArray(v.breaches) ? (v.breaches as VendorBreachRecord[]) : [],
    error: v.error,
    message: v.message ?? '',
  };
}

/**
 * Map live breach intel onto the external "Breach exposure" vector.
 * On HIBP error: replace curated/simulated breach scores — never present them as live clear.
 */
export function applyLiveBreachToVectors<
  T extends {
    id: string;
    label: string;
    score: number;
    status: 'pass' | 'warn' | 'fail';
    detail: string;
  },
>(vectors: T[], intel: VendorBreachIntel | null): T[] {
  if (!intel) return vectors;

  return vectors.map((vector) => {
    if (vector.id !== 'breach') return vector;

    if (intel.status === 'clear' && intel.live) {
      return {
        ...vector,
        score: 95,
        status: 'pass' as const,
        detail: `Live HIBP check: no disclosed breaches for ${intel.domain} (checked ${intel.checkedAt.slice(0, 10)}).`,
      };
    }

    if (intel.status === 'breaches_found' && intel.live) {
      const latest = intel.breaches[0];
      const score = Math.max(5, 55 - Math.min(intel.breachCount, 8) * 6);
      return {
        ...vector,
        score,
        status: 'fail' as const,
        detail: `Live HIBP: ${intel.breachCount} disclosed breach(es). Latest: ${latest?.title ?? 'n/a'} (${latest?.breachDate ?? 'unknown date'}).`,
      };
    }

    if (intel.status === 'error') {
      return {
        ...vector,
        score: 50,
        status: 'warn' as const,
        detail: `Live HIBP check failed — curated/simulated breach scores are not shown as fact. ${intel.message}`,
      };
    }

    if (intel.status === 'skipped') {
      return {
        ...vector,
        score: 50,
        status: 'warn' as const,
        detail: intel.message || 'Breach check skipped — add a primary domain for a live HIBP lookup.',
      };
    }

    return vector;
  });
}
