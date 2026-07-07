import { getFromEdgeCache, setEdgeCache } from '@/lib/ill/cache/edge-cache';
import { lookupThreatInDb } from '@/lib/ill/threat-db/repository';
import type { ThreatCheckRequest, ThreatCheckResult } from '@/lib/ill/types';

export async function performThreatLookup(
  params: ThreatCheckRequest
): Promise<ThreatCheckResult> {
  const cached = getFromEdgeCache(params);
  if (cached) return cached;

  const result = await lookupThreatInDb(params);
  setEdgeCache(params, result);
  return result;
}

export async function performBulkThreatLookup(
  items: ThreatCheckRequest[]
): Promise<ThreatCheckResult[]> {
  return Promise.all(items.map((item) => performThreatLookup(item)));
}
