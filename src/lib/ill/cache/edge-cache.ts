import type { ThreatCheckResult } from '@/lib/ill/types';
import { getIllConfig } from '@/lib/ill/config';

type CacheEntry = {
  result: ThreatCheckResult;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry>();

function cacheKey(ip?: string, url?: string, domain?: string): string {
  return [ip ?? '', url ?? '', domain ?? ''].join('|').toLowerCase();
}

export function getFromEdgeCache(params: {
  ip?: string;
  url?: string;
  domain?: string;
}): ThreatCheckResult | null {
  const key = cacheKey(params.ip, params.url, params.domain);
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return { ...entry.result, cache_hit: true };
}

export function setEdgeCache(
  params: { ip?: string; url?: string; domain?: string },
  result: ThreatCheckResult
) {
  const { cacheTtlSeconds } = getIllConfig();
  const key = cacheKey(params.ip, params.url, params.domain);
  cache.set(key, {
    result: { ...result, cache_hit: false },
    expiresAt: Date.now() + cacheTtlSeconds * 1000,
  });
}

export function bulkLoadEdgeCache(
  iocs: Array<{
    ioc_type: string;
    value: string;
    category: string;
    blacklisted: boolean;
    confidence: number;
    source_feed: string;
  }>
) {
  const checkedAt = new Date().toISOString();
  for (const ioc of iocs) {
    if (!ioc.blacklisted) continue;
    const base = {
      status: 'malicious' as const,
      blacklisted: true,
      category: ioc.category as ThreatCheckResult['category'],
      confidence: ioc.confidence,
      source_feed: ioc.source_feed,
      checked_at: checkedAt,
    };
    if (ioc.ioc_type === 'ip') {
      setEdgeCache({ ip: ioc.value }, { ip: ioc.value, ...base });
    } else if (ioc.ioc_type === 'url') {
      setEdgeCache({ url: ioc.value }, { url: ioc.value, ...base });
    } else if (ioc.ioc_type === 'domain') {
      setEdgeCache({ domain: ioc.value }, { domain: ioc.value, ...base });
    }
  }
}

export function getEdgeCacheStats() {
  const now = Date.now();
  let active = 0;
  for (const entry of cache.values()) {
    if (entry.expiresAt > now) active += 1;
  }
  return { total_entries: cache.size, active_entries: active };
}

export function clearEdgeCache() {
  cache.clear();
}
