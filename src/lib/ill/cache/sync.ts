import { bulkLoadEdgeCache } from '@/lib/ill/cache/edge-cache';
import { syncFeedsSince } from '@/lib/ill/threat-db/repository';

let lastSyncAt = new Date(0);

export async function syncEdgeCacheFromDb(since?: Date) {
  const syncSince = since ?? lastSyncAt;
  const iocs = await syncFeedsSince(syncSince);
  bulkLoadEdgeCache(iocs);
  lastSyncAt = new Date();
  return {
    synced_at: lastSyncAt.toISOString(),
    since: syncSince.toISOString(),
    loaded: iocs.filter((i) => i.blacklisted).length,
  };
}

export function getLastSyncAt() {
  return lastSyncAt.toISOString();
}
