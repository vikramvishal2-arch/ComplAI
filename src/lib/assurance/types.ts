export type AssuranceSource = 'sast' | 'dast' | 'infra' | 'cloud';

export type AssuranceSeverity = 'critical' | 'high' | 'medium' | 'low';

/** Normalized open-vuln record for Assurance UI + Jira sync. */
export type AssuranceVulnerability = {
  id: string;
  key: string;
  summary: string;
  status: string;
  severity: AssuranceSeverity;
  priority: string;
  source: AssuranceSource;
  createdAt: string;
  updatedAt: string;
  url: string;
  assignee?: string | null;
  labels?: string[];
  /** True when row comes from sample data (Jira not configured). */
  demo?: boolean;
};

export type AssuranceDataMode = 'jira' | 'demo';

export type AssuranceVulnerabilitiesResponse = {
  mode: AssuranceDataMode;
  configured: boolean;
  message: string;
  source: AssuranceSource | 'all';
  status: 'open' | 'all';
  count: number;
  vulnerabilities: AssuranceVulnerability[];
  fetchedAt: string;
};

export const ASSURANCE_SOURCE_LABELS: Record<AssuranceSource, string> = {
  sast: 'SAST',
  dast: 'DAST',
  infra: 'Infra',
  cloud: 'Cloud',
};

export const ASSURANCE_SOURCES: AssuranceSource[] = ['sast', 'dast', 'infra', 'cloud'];
