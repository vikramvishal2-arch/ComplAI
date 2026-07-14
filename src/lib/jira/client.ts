import type { AssuranceSource } from '@/lib/assurance/types';
import { getJiraConfig, type JiraConfig } from '@/lib/jira/config';
import {
  isOpenJiraStatus,
  mapJiraIssueToVulnerability,
  type JiraSearchIssue,
} from '@/lib/jira/map-issues';
import type { AssuranceVulnerability } from '@/lib/assurance/types';

const DEFAULT_FIELDS = [
  'summary',
  'status',
  'priority',
  'labels',
  'created',
  'updated',
  'assignee',
  'components',
];

function authHeader(config: JiraConfig): string {
  const token = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');
  return `Basic ${token}`;
}

function defaultJql(
  projectKey: string,
  source: AssuranceSource | 'all' | undefined,
  openOnly: boolean
): string {
  const project = `project = ${projectKey}`;
  const statusClause = openOnly ? ' AND statusCategory != Done' : '';

  if (!source || source === 'all') {
    return `${project}${statusClause} AND labels in (sast, dast, infra, infrastructure, cloud, vm, cspm) ORDER BY priority DESC, updated DESC`;
  }

  const labelMap: Record<AssuranceSource, string> = {
    sast: 'sast',
    dast: 'dast',
    infra: 'infra, infrastructure, vm',
    cloud: 'cloud, cspm',
  };

  return `${project}${statusClause} AND labels in (${labelMap[source]}) ORDER BY priority DESC, updated DESC`;
}

export function buildJqlForSource(
  config: JiraConfig,
  source: AssuranceSource | 'all',
  openOnly = true
): string {
  if (source !== 'all' && config.jqlBySource[source]) {
    return config.jqlBySource[source];
  }
  if (config.jql) {
    return config.jql;
  }
  return defaultJql(config.projectKey, source, openOnly);
}

type SearchResponse = {
  issues?: JiraSearchIssue[];
  errorMessages?: string[];
  errors?: Record<string, string>;
};

async function searchIssues(config: JiraConfig, jql: string, maxResults = 100): Promise<JiraSearchIssue[]> {
  // Legacy GET/POST /rest/api/3/search returns 410 — use enhanced search.
  const url = `${config.baseUrl}/rest/api/3/search/jql`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: authHeader(config),
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jql,
      maxResults,
      fields: DEFAULT_FIELDS,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Jira search failed (${res.status}): ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as SearchResponse;
  return data.issues ?? [];
}

/**
 * Fetch open vulnerabilities from Jira for one source or all sources.
 * When per-source JQL is set, queries each source separately and merges.
 */
export async function fetchJiraVulnerabilities(
  source: AssuranceSource | 'all' = 'all',
  options?: { openOnly?: boolean }
): Promise<AssuranceVulnerability[]> {
  const config = getJiraConfig();
  if (!config.configured) {
    throw new Error('Jira is not configured');
  }

  const openOnly = options?.openOnly !== false;
  const sources: AssuranceSource[] =
    source === 'all' ? ['sast', 'dast', 'infra', 'cloud'] : [source];

  const hasPerSource =
    source === 'all' &&
    (config.jqlBySource.sast ||
      config.jqlBySource.dast ||
      config.jqlBySource.infra ||
      config.jqlBySource.cloud);

  const results: AssuranceVulnerability[] = [];
  const seen = new Set<string>();

  if (hasPerSource) {
    for (const src of sources) {
      const jql = buildJqlForSource(config, src, openOnly);
      const issues = await searchIssues(config, jql);
      for (const issue of issues) {
        if (openOnly && !isOpenJiraStatus(issue)) continue;
        const mapped = mapJiraIssueToVulnerability(issue, config.baseUrl, src);
        if (!mapped || seen.has(mapped.key)) continue;
        seen.add(mapped.key);
        results.push(mapped);
      }
    }
  } else {
    const jql = buildJqlForSource(config, source, openOnly);
    const issues = await searchIssues(config, jql);
    for (const issue of issues) {
      if (openOnly && !isOpenJiraStatus(issue)) continue;
      const forced = source === 'all' ? undefined : source;
      const mapped = mapJiraIssueToVulnerability(issue, config.baseUrl, forced);
      if (!mapped) continue;
      if (source !== 'all' && mapped.source !== source) continue;
      if (seen.has(mapped.key)) continue;
      seen.add(mapped.key);
      results.push(mapped);
    }
  }

  return results.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.severity] - order[b.severity] || b.updatedAt.localeCompare(a.updatedAt);
  });
}
