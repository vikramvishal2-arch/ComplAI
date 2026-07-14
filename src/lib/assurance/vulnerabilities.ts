import type {
  AssuranceDataMode,
  AssuranceSource,
  AssuranceVulnerabilitiesResponse,
  AssuranceVulnerability,
} from '@/lib/assurance/types';
import { getDemoVulnerabilities } from '@/lib/assurance/demo-vulnerabilities';
import { getJiraConfig } from '@/lib/jira/config';
import { fetchJiraVulnerabilities } from '@/lib/jira/client';

const CACHE_TTL_MS = 60_000;

type CacheEntry = {
  expiresAt: number;
  payload: AssuranceVulnerabilitiesResponse;
};

const cache = new Map<string, CacheEntry>();

function cacheKey(source: AssuranceSource | 'all', status: 'open' | 'all'): string {
  return `${source}:${status}`;
}

export function clearAssuranceVulnCache() {
  cache.clear();
}

export async function listAssuranceVulnerabilities(options?: {
  source?: AssuranceSource | 'all';
  status?: 'open' | 'all';
  bypassCache?: boolean;
}): Promise<AssuranceVulnerabilitiesResponse> {
  const source = options?.source ?? 'all';
  const status = options?.status ?? 'open';
  const key = cacheKey(source, status);
  const now = Date.now();

  if (!options?.bypassCache) {
    const hit = cache.get(key);
    if (hit && hit.expiresAt > now) {
      return hit.payload;
    }
  }

  const config = getJiraConfig();
  let mode: AssuranceDataMode = 'demo';
  let configured = config.configured;
  let vulnerabilities: AssuranceVulnerability[] = [];
  let message: string;

  if (configured) {
    try {
      vulnerabilities = await fetchJiraVulnerabilities(source, {
        openOnly: status === 'open',
      });
      mode = 'jira';
      message = `Loaded ${vulnerabilities.length} issue(s) from Jira`;
    } catch (error) {
      console.error('Jira vulnerability fetch failed; falling back to demo data', error);
      vulnerabilities = getDemoVulnerabilities(source);
      mode = 'demo';
      message =
        'Jira is configured but the API request failed — showing demo data. Check credentials and network.';
    }
  } else {
    vulnerabilities = getDemoVulnerabilities(source);
    message =
      'Demo data (configure JIRA_BASE_URL, JIRA_EMAIL / JIRA_USER, and JIRA_API_TOKEN to sync live issues)';
  }

  const payload: AssuranceVulnerabilitiesResponse = {
    mode,
    configured,
    message,
    source,
    status,
    count: vulnerabilities.length,
    vulnerabilities,
    fetchedAt: new Date().toISOString(),
  };

  cache.set(key, { expiresAt: now + CACHE_TTL_MS, payload });
  return payload;
}
