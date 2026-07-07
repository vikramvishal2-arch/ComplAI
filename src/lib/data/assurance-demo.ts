export type VulnerabilitySeverity = 'critical' | 'high' | 'medium' | 'low';

export type InfrastructureVulnerability = {
  id: string;
  cve: string;
  title: string;
  asset: string;
  assetType: 'server' | 'network' | 'container' | 'cloud';
  environment: 'production' | 'staging' | 'development';
  severity: VulnerabilitySeverity;
  cvss: number;
  scanner: string;
  firstSeen: string;
  lastSeen: string;
  status: 'open' | 'in_progress' | 'remediated' | 'accepted';
  jiraTicketId: string | null;
};

export type DastFinding = {
  id: string;
  title: string;
  application: string;
  url: string;
  owaspCategory: string;
  severity: VulnerabilitySeverity;
  scanner: string;
  detectedAt: string;
  status: 'open' | 'in_progress' | 'remediated' | 'false_positive';
  jiraTicketId: string | null;
};

export type JiraTicket = {
  id: string;
  key: string;
  summary: string;
  project: string;
  issueType: 'Bug' | 'Task' | 'Security';
  priority: 'Highest' | 'High' | 'Medium' | 'Low';
  assignee: string;
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done';
  source: 'infrastructure' | 'dast';
  sourceFindingId: string;
  createdAt: string;
  updatedAt: string;
  slaDue: string;
  url: string;
};

export const INFRASTRUCTURE_VULNERABILITIES: InfrastructureVulnerability[] = [
  {
    id: 'infra-001',
    cve: 'CVE-2024-6387',
    title: 'OpenSSH regreSSHion — unauthenticated RCE on glibc systems',
    asset: 'prod-api-01.internal',
    assetType: 'server',
    environment: 'production',
    severity: 'critical',
    cvss: 9.8,
    scanner: 'Tenable Nessus',
    firstSeen: '2026-03-12',
    lastSeen: '2026-07-01',
    status: 'in_progress',
    jiraTicketId: 'SEC-1842',
  },
  {
    id: 'infra-002',
    cve: 'CVE-2025-29927',
    title: 'Next.js middleware authorization bypass',
    asset: 'prod-web-cluster',
    assetType: 'container',
    environment: 'production',
    severity: 'critical',
    cvss: 9.1,
    scanner: 'Qualys VMDR',
    firstSeen: '2026-04-02',
    lastSeen: '2026-07-02',
    status: 'open',
    jiraTicketId: 'SEC-1856',
  },
  {
    id: 'infra-003',
    cve: 'CVE-2024-37371',
    title: 'Kerberos PAC validation bypass',
    asset: 'ad-dc-02.corp.local',
    assetType: 'server',
    environment: 'production',
    severity: 'high',
    cvss: 8.1,
    scanner: 'Tenable Nessus',
    firstSeen: '2026-02-18',
    lastSeen: '2026-06-28',
    status: 'in_progress',
    jiraTicketId: 'SEC-1798',
  },
  {
    id: 'infra-004',
    cve: 'CVE-2024-21762',
    title: 'FortiOS out-of-bounds write in SSL VPN',
    asset: 'fw-edge-01',
    assetType: 'network',
    environment: 'production',
    severity: 'high',
    cvss: 9.6,
    scanner: 'Rapid7 InsightVM',
    firstSeen: '2026-01-20',
    lastSeen: '2026-06-15',
    status: 'remediated',
    jiraTicketId: 'SEC-1720',
  },
  {
    id: 'infra-005',
    cve: 'CVE-2024-38112',
    title: 'Windows MSHTML spoofing vulnerability',
    asset: 'win-endpoint-pool',
    assetType: 'server',
    environment: 'production',
    severity: 'medium',
    cvss: 6.5,
    scanner: 'Microsoft Defender Vulnerability Management',
    firstSeen: '2026-05-01',
    lastSeen: '2026-07-03',
    status: 'open',
    jiraTicketId: null,
  },
  {
    id: 'infra-006',
    cve: 'CVE-2024-21626',
    title: 'runc container breakout via file descriptor leak',
    asset: 'eks-node-group-prod',
    assetType: 'cloud',
    environment: 'production',
    severity: 'high',
    cvss: 8.6,
    scanner: 'Wiz',
    firstSeen: '2026-03-28',
    lastSeen: '2026-07-02',
    status: 'open',
    jiraTicketId: 'SEC-1861',
  },
];

export const DAST_FINDINGS: DastFinding[] = [
  {
    id: 'dast-001',
    title: 'SQL injection in search parameter',
    application: 'Customer Portal',
    url: 'https://portal.example.com/api/search?q=',
    owaspCategory: 'A03:2021 Injection',
    severity: 'critical',
    scanner: 'OWASP ZAP',
    detectedAt: '2026-06-28',
    status: 'in_progress',
    jiraTicketId: 'SEC-1859',
  },
  {
    id: 'dast-002',
    title: 'Missing Content-Security-Policy header',
    application: 'Marketing Site',
    url: 'https://www.example.com',
    owaspCategory: 'A05:2021 Security Misconfiguration',
    severity: 'medium',
    scanner: 'Burp Suite Enterprise',
    detectedAt: '2026-06-25',
    status: 'open',
    jiraTicketId: null,
  },
  {
    id: 'dast-003',
    title: 'Broken access control — IDOR on document download',
    application: 'Document Hub',
    url: 'https://docs.example.com/files/{id}',
    owaspCategory: 'A01:2021 Broken Access Control',
    severity: 'high',
    scanner: 'Burp Suite Enterprise',
    detectedAt: '2026-06-20',
    status: 'in_progress',
    jiraTicketId: 'SEC-1847',
  },
  {
    id: 'dast-004',
    title: 'Reflected XSS in error message parameter',
    application: 'Admin Console',
    url: 'https://admin.example.com/login?error=',
    owaspCategory: 'A03:2021 Injection',
    severity: 'high',
    scanner: 'OWASP ZAP',
    detectedAt: '2026-06-18',
    status: 'open',
    jiraTicketId: 'SEC-1844',
  },
  {
    id: 'dast-005',
    title: 'Sensitive data exposure in API response',
    application: 'Mobile API Gateway',
    url: 'https://api.example.com/v1/users/profile',
    owaspCategory: 'A02:2021 Cryptographic Failures',
    severity: 'medium',
    scanner: 'Acunetix',
    detectedAt: '2026-06-10',
    status: 'remediated',
    jiraTicketId: 'SEC-1822',
  },
  {
    id: 'dast-006',
    title: 'Server version disclosure in HTTP headers',
    application: 'Partner API',
    url: 'https://partner-api.example.com/health',
    owaspCategory: 'A05:2021 Security Misconfiguration',
    severity: 'low',
    scanner: 'OWASP ZAP',
    detectedAt: '2026-06-05',
    status: 'false_positive',
    jiraTicketId: null,
  },
];

export const JIRA_TICKETS: JiraTicket[] = [
  {
    id: 'jira-001',
    key: 'SEC-1861',
    summary: '[VM] Remediate runc container breakout on EKS prod node group',
    project: 'Security Engineering',
    issueType: 'Security',
    priority: 'Highest',
    assignee: 'Platform Engineering',
    status: 'In Progress',
    source: 'infrastructure',
    sourceFindingId: 'infra-006',
    createdAt: '2026-07-02',
    updatedAt: '2026-07-04',
    slaDue: '2026-07-09',
    url: 'https://propelready.atlassian.net/browse/SEC-1861',
  },
  {
    id: 'jira-002',
    key: 'SEC-1859',
    summary: '[DAST] Fix SQL injection in Customer Portal search API',
    project: 'Security Engineering',
    issueType: 'Bug',
    priority: 'Highest',
    assignee: 'AppSec Squad',
    status: 'In Progress',
    source: 'dast',
    sourceFindingId: 'dast-001',
    createdAt: '2026-06-29',
    updatedAt: '2026-07-03',
    slaDue: '2026-07-06',
    url: 'https://propelready.atlassian.net/browse/SEC-1859',
  },
  {
    id: 'jira-003',
    key: 'SEC-1856',
    summary: '[VM] Patch Next.js middleware bypass on prod web cluster',
    project: 'Security Engineering',
    issueType: 'Security',
    priority: 'Highest',
    assignee: 'Web Platform',
    status: 'To Do',
    source: 'infrastructure',
    sourceFindingId: 'infra-002',
    createdAt: '2026-07-02',
    updatedAt: '2026-07-02',
    slaDue: '2026-07-07',
    url: 'https://propelready.atlassian.net/browse/SEC-1856',
  },
  {
    id: 'jira-004',
    key: 'SEC-1847',
    summary: '[DAST] IDOR on Document Hub file download endpoint',
    project: 'Security Engineering',
    issueType: 'Bug',
    priority: 'High',
    assignee: 'Document Hub Team',
    status: 'In Review',
    source: 'dast',
    sourceFindingId: 'dast-003',
    createdAt: '2026-06-21',
    updatedAt: '2026-07-01',
    slaDue: '2026-07-14',
    url: 'https://propelready.atlassian.net/browse/SEC-1847',
  },
  {
    id: 'jira-005',
    key: 'SEC-1844',
    summary: '[DAST] Sanitize reflected XSS in Admin Console login error',
    project: 'Security Engineering',
    issueType: 'Bug',
    priority: 'High',
    assignee: 'Admin Console Team',
    status: 'To Do',
    source: 'dast',
    sourceFindingId: 'dast-004',
    createdAt: '2026-06-19',
    updatedAt: '2026-06-19',
    slaDue: '2026-07-12',
    url: 'https://propelready.atlassian.net/browse/SEC-1844',
  },
  {
    id: 'jira-006',
    key: 'SEC-1842',
    summary: '[VM] Upgrade OpenSSH on prod-api-01 (regreSSHion)',
    project: 'Security Engineering',
    issueType: 'Security',
    priority: 'Highest',
    assignee: 'Infrastructure Ops',
    status: 'In Progress',
    source: 'infrastructure',
    sourceFindingId: 'infra-001',
    createdAt: '2026-03-13',
    updatedAt: '2026-07-04',
    slaDue: '2026-07-05',
    url: 'https://propelready.atlassian.net/browse/SEC-1842',
  },
  {
    id: 'jira-007',
    key: 'SEC-1798',
    summary: '[VM] Apply Kerberos PAC validation patch on AD DC',
    project: 'Security Engineering',
    issueType: 'Security',
    priority: 'High',
    assignee: 'Identity Team',
    status: 'In Progress',
    source: 'infrastructure',
    sourceFindingId: 'infra-003',
    createdAt: '2026-02-19',
    updatedAt: '2026-06-30',
    slaDue: '2026-07-15',
    url: 'https://propelready.atlassian.net/browse/SEC-1798',
  },
  {
    id: 'jira-008',
    key: 'SEC-1720',
    summary: '[VM] FortiOS SSL VPN patch — fw-edge-01',
    project: 'Security Engineering',
    issueType: 'Security',
    priority: 'Highest',
    assignee: 'Network Security',
    status: 'Done',
    source: 'infrastructure',
    sourceFindingId: 'infra-004',
    createdAt: '2026-01-21',
    updatedAt: '2026-06-10',
    slaDue: '2026-02-04',
    url: 'https://propelready.atlassian.net/browse/SEC-1720',
  },
];

export const VULNERABILITY_SEVERITY_STYLES: Record<VulnerabilitySeverity, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const JIRA_STATUS_STYLES: Record<JiraTicket['status'], string> = {
  'To Do': 'bg-slate-100 text-slate-700',
  'In Progress': 'bg-blue-100 text-blue-800',
  'In Review': 'bg-purple-100 text-purple-800',
  Done: 'bg-green-100 text-green-800',
};

export const JIRA_PRIORITY_STYLES: Record<JiraTicket['priority'], string> = {
  Highest: 'bg-red-100 text-red-800',
  High: 'bg-orange-100 text-orange-800',
  Medium: 'bg-amber-100 text-amber-800',
  Low: 'bg-slate-100 text-slate-700',
};

export function getOpenInfrastructureCount() {
  return INFRASTRUCTURE_VULNERABILITIES.filter((v) => v.status === 'open' || v.status === 'in_progress')
    .length;
}

export function getOpenDastCount() {
  return DAST_FINDINGS.filter((f) => f.status === 'open' || f.status === 'in_progress').length;
}

export function getUnlinkedFindingsCount() {
  const infraUnlinked = INFRASTRUCTURE_VULNERABILITIES.filter(
    (v) => !v.jiraTicketId && (v.status === 'open' || v.status === 'in_progress')
  ).length;
  const dastUnlinked = DAST_FINDINGS.filter(
    (f) => !f.jiraTicketId && (f.status === 'open' || f.status === 'in_progress')
  ).length;
  return infraUnlinked + dastUnlinked;
}

export function getJiraTicketByKey(key: string) {
  return JIRA_TICKETS.find((t) => t.key === key) ?? null;
}

export function getJiraTicketUrl(key: string) {
  return getJiraTicketByKey(key)?.url ?? `https://propelready.atlassian.net/browse/${key}`;
}
