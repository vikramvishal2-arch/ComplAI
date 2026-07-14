import type {
  AssuranceSeverity,
  AssuranceSource,
  AssuranceVulnerability,
} from '@/lib/assurance/types';

export type JiraSearchIssue = {
  id: string;
  key: string;
  fields: {
    summary?: string;
    status?: { name?: string; statusCategory?: { key?: string; name?: string } };
    priority?: { name?: string };
    labels?: string[];
    created?: string;
    updated?: string;
    assignee?: { displayName?: string } | null;
    components?: Array<{ name?: string }>;
  };
};

const SOURCE_LABELS: Record<AssuranceSource, string[]> = {
  sast: ['sast'],
  dast: ['dast'],
  infra: ['infra', 'infrastructure', 'vm'],
  cloud: ['cloud', 'cspm'],
};

export function classifyIssueSource(
  labels: string[] = [],
  components: Array<{ name?: string }> = [],
  summary = ''
): AssuranceSource | null {
  const haystack = [
    ...labels.map((l) => l.toLowerCase()),
    ...components.map((c) => (c.name ?? '').toLowerCase()),
  ];

  for (const source of Object.keys(SOURCE_LABELS) as AssuranceSource[]) {
    if (SOURCE_LABELS[source].some((token) => haystack.includes(token))) {
      return source;
    }
  }

  // Fallback: summary prefixes used by demo / common conventions
  const upper = summary.toUpperCase();
  if (upper.includes('[SAST]') || upper.startsWith('SAST')) return 'sast';
  if (upper.includes('[DAST]') || upper.startsWith('DAST')) return 'dast';
  if (upper.includes('[CLOUD]') || upper.includes('CSPM')) return 'cloud';
  if (upper.includes('[VM]') || upper.includes('[INFRA]') || upper.includes('INFRASTRUCTURE')) {
    return 'infra';
  }

  return null;
}

export function mapPriorityToSeverity(priorityName?: string): AssuranceSeverity {
  const p = (priorityName ?? '').toLowerCase();
  if (p === 'highest' || p === 'blocker' || p === 'critical') return 'critical';
  if (p === 'high' || p === 'major') return 'high';
  if (p === 'medium' || p === 'normal') return 'medium';
  return 'low';
}

export function isOpenJiraStatus(issue: JiraSearchIssue): boolean {
  const category = issue.fields.status?.statusCategory?.key?.toLowerCase();
  if (category === 'done') return false;
  const name = (issue.fields.status?.name ?? '').toLowerCase();
  return !['done', 'closed', 'resolved', 'cancelled', 'canceled'].includes(name);
}

export function mapJiraIssueToVulnerability(
  issue: JiraSearchIssue,
  baseUrl: string,
  forcedSource?: AssuranceSource
): AssuranceVulnerability | null {
  const labels = issue.fields.labels ?? [];
  const components = issue.fields.components ?? [];
  const summary = issue.fields.summary ?? '(no summary)';
  const source = forcedSource ?? classifyIssueSource(labels, components, summary);
  if (!source) return null;

  const key = issue.key;
  const browseBase = baseUrl.replace(/\/$/, '');

  return {
    id: `jira-${issue.id}`,
    key,
    summary,
    status: issue.fields.status?.name ?? 'Unknown',
    severity: mapPriorityToSeverity(issue.fields.priority?.name),
    priority: issue.fields.priority?.name ?? 'Medium',
    source,
    createdAt: issue.fields.created ?? '',
    updatedAt: issue.fields.updated ?? '',
    url: `${browseBase}/browse/${key}`,
    assignee: issue.fields.assignee?.displayName ?? null,
    labels,
    demo: false,
  };
}
