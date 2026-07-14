import type { EvidenceBriefcaseIndex } from './briefcase-types';
import { buildEvidenceBriefcaseIndex } from './briefcase-index';

let cache: { expiresAt: number; index: EvidenceBriefcaseIndex } | null = null;

const CACHE_TTL_MS = 15_000;

export function invalidateEvidenceBriefcaseCache() {
  cache = null;
}

export async function getEvidenceBriefcaseIndex(options?: {
  fresh?: boolean;
}): Promise<EvidenceBriefcaseIndex> {
  const now = Date.now();
  if (options?.fresh) {
    cache = null;
  }
  if (!cache || cache.expiresAt < now) {
    cache = {
      index: await buildEvidenceBriefcaseIndex(),
      expiresAt: now + CACHE_TTL_MS,
    };
  }
  return cache.index;
}
