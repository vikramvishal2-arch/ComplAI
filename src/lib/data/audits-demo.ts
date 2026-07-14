export type AuditEngagement = {
  id: string;
  name: string;
  framework: string;
  auditor: string;
  type: 'internal' | 'external';
  status: 'planning' | 'fieldwork' | 'reporting' | 'closed';
  startDate: string;
  endDate: string;
  readiness: number;
};

export type AuditFinding = {
  id: string;
  source: 'internal' | 'external';
  engagement: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  controlRef: string;
  owner: string;
  status: 'open' | 'in_progress' | 'remediated' | 'accepted';
  dueDate: string;
};

export type InternalAuditProgram = {
  id: string;
  name: string;
  scope: string;
  lead: string;
  status: 'scheduled' | 'in_progress' | 'complete';
  startDate: string;
  endDate: string;
  coverage: number;
};

export type AuditRiskGap = {
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'closed';
};

export type AuditRiskAssessment = {
  id: string;
  area: string;
  summary: string;
  inherentRisk: 'critical' | 'high' | 'medium' | 'low';
  residualRisk: 'critical' | 'high' | 'medium' | 'low';
  controlsTested: number;
  gapsIdentified: number;
  owner: string;
  lastReviewed: string;
  controlsInScope: string[];
  gaps: AuditRiskGap[];
  recommendations: string[];
  linkedFindingIds: string[];
};

/** ISO 31000-style process phases created when launching a risk assessment cycle. */
export const RISK_ASSESSMENT_PROCESS_PHASES: Omit<AuditRiskAssessment, 'id'>[] = [
  {
    area: '1. Risk Identification',
    summary:
      'The goal of this step is to find, recognize, and describe risks that might help or prevent an organization from achieving its objectives.',
    inherentRisk: 'medium',
    residualRisk: 'medium',
    controlsTested: 0,
    gapsIdentified: 0,
    owner: 'GRC / Risk Management',
    lastReviewed: '',
    controlsInScope: [],
    gaps: [],
    recommendations: [
      'Identify sources: Pinpoint internal and external triggers, vulnerabilities, and threats.',
      'Determine consequences: Map out potential impacts, ripple effects, and cascaded results.',
      'Track tangibles & intangibles: Account for hardware, software, reputation, and brand trust.',
      'Use diverse tools: Apply checklists, historical data analysis, and expert interviews.',
      'Involve stakeholders: Gather cross-functional teams to prevent blind spots.',
    ],
    linkedFindingIds: [],
  },
  {
    area: '2. Risk Analysis',
    summary:
      'This step focuses on understanding the nature, characteristics, and level of the identified risks.',
    inherentRisk: 'medium',
    residualRisk: 'medium',
    controlsTested: 0,
    gapsIdentified: 0,
    owner: 'GRC / Risk Management',
    lastReviewed: '',
    controlsInScope: [],
    gaps: [],
    recommendations: [
      'Determine likelihood: Calculate how often or how likely an event is to occur.',
      'Assess consequences: Quantify or qualify the severity of the potential impact.',
      'Analyze controls: Evaluate the effectiveness of current measures already in place.',
      'Review complexities: Look at dependencies, system connections, and risk combinations.',
      'Select methods: Choose qualitative, semi-quantitative, or highly detailed quantitative techniques.',
    ],
    linkedFindingIds: [],
  },
  {
    area: '3. Risk Evaluation',
    summary:
      'The final step uses the insights from the analysis to support decision-making about future actions.',
    inherentRisk: 'medium',
    residualRisk: 'medium',
    controlsTested: 0,
    gapsIdentified: 0,
    owner: 'GRC / Risk Management',
    lastReviewed: '',
    controlsInScope: [],
    gaps: [],
    recommendations: [
      'Compare results: Benchmark analyzed risk levels against established organizational risk criteria.',
      'Prioritize risks: Rank issues to determine which require urgent treatment.',
      'Make decisions: Determine if a risk is acceptable or requires further mitigation.',
      'Log outcomes: Document the evaluation to provide a transparent audit trail.',
    ],
    linkedFindingIds: [],
  },
];

export type ExternalReadinessItem = {
  id: string;
  category: string;
  task: string;
  framework: string;
  owner: string;
  status: 'not_started' | 'in_progress' | 'ready' | 'blocked';
  dueDate: string;
};

export type EvidenceRequest = {
  id: string;
  engagement: string;
  request: string;
  controlRef: string;
  assignee: string;
  status: 'pending' | 'submitted' | 'accepted' | 'rejected';
  dueDate: string;
};

export type AuditMilestone = {
  id: string;
  engagement: string;
  label: string;
  date: string;
  status: 'upcoming' | 'in_progress' | 'complete';
};

export const INTERNAL_AUDIT_PROGRAMS: InternalAuditProgram[] = [
  {
    id: 'ia-q2-access',
    name: 'Q2 Access Management Review',
    scope: 'Privileged accounts, IAM provisioning, quarterly access recertification',
    lead: 'Internal Audit — Priya Sharma',
    status: 'in_progress',
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    coverage: 62,
  },
  {
    id: 'ia-q2-change',
    name: 'Change & Release Controls',
    scope: 'Production change tickets, CAB approvals, emergency change follow-up',
    lead: 'Internal Audit — James Okonkwo',
    status: 'scheduled',
    startDate: '2026-05-05',
    endDate: '2026-05-28',
    coverage: 0,
  },
  {
    id: 'ia-q1-vendor',
    name: 'Q1 Vendor Due Diligence',
    scope: 'Critical SaaS vendors, SOC report freshness, DPAs on file',
    lead: 'Internal Audit — Priya Sharma',
    status: 'complete',
    startDate: '2026-01-08',
    endDate: '2026-02-14',
    coverage: 100,
  },
];

export const AUDIT_RISK_ASSESSMENTS: AuditRiskAssessment[] = [
  {
    id: 'ra-iam',
    area: 'Identity & access management',
    summary:
      'Covers privileged access, joiner-mover-leaver, and quarterly recertification ahead of SOC 2 CC6 testing.',
    inherentRisk: 'high',
    residualRisk: 'medium',
    controlsTested: 14,
    gapsIdentified: 2,
    owner: 'IAM Team',
    lastReviewed: '2026-04-08',
    controlsInScope: ['CC6.1', 'CC6.2', 'CC6.3', 'CC6.7', 'A.5.15', 'A.5.16'],
    gaps: [
      {
        title: '12 privileged accounts missing Q1 recertification sign-off',
        severity: 'high',
        status: 'in_progress',
      },
      {
        title: 'Stale service accounts in non-prod linked to retired integrations',
        severity: 'medium',
        status: 'open',
      },
    ],
    recommendations: [
      'Automate recertification reminders 14 days before quarter close.',
      'Run monthly stale-account report for privileged groups.',
    ],
    linkedFindingIds: ['IA-021', 'F-1042'],
  },
  {
    id: 'ra-vendor',
    area: 'Third-party / vendor risk',
    summary:
      'Validates critical SaaS processor due diligence, SOC report freshness, and contract clauses for data processing.',
    inherentRisk: 'high',
    residualRisk: 'high',
    controlsTested: 9,
    gapsIdentified: 3,
    owner: 'Vendor Management',
    lastReviewed: '2026-04-05',
    controlsInScope: ['CC9.2', 'A.5.19', 'A.5.20', 'A.5.21'],
    gaps: [
      {
        title: 'Two critical vendors lack current SOC 2 report on file',
        severity: 'high',
        status: 'open',
      },
      {
        title: 'New analytics subprocessors not mapped to inventory',
        severity: 'medium',
        status: 'open',
      },
      {
        title: 'Annual vendor risk questionnaire overdue for HRMS provider',
        severity: 'medium',
        status: 'in_progress',
      },
    ],
    recommendations: [
      'Require SOC 2 Type II less than 12 months old before contract renewal.',
      'Sync vendor inventory with procurement onboarding workflow.',
    ],
    linkedFindingIds: ['IA-019', 'F-1043'],
  },
  {
    id: 'ra-incident',
    area: 'Incident response & logging',
    summary:
      'Reviews SIEM coverage, alert routing, tabletop exercises, and retention for audit evidence.',
    inherentRisk: 'medium',
    residualRisk: 'low',
    controlsTested: 11,
    gapsIdentified: 1,
    owner: 'SOC Lead',
    lastReviewed: '2026-03-28',
    controlsInScope: ['CC7.2', 'CC7.3', 'CC7.4', 'A.5.24', 'A.5.25'],
    gaps: [
      {
        title: 'Tabletop attendance roster not attached to IR policy evidence pack',
        severity: 'low',
        status: 'in_progress',
      },
    ],
    recommendations: ['Attach tabletop roster to ComplAI evidence folder after each exercise.'],
    linkedFindingIds: [],
  },
  {
    id: 'ra-bcp',
    area: 'Business continuity & backup',
    summary:
      'Assesses backup restore testing, RTO/RPO documentation, and failover runbooks for production workloads.',
    inherentRisk: 'medium',
    residualRisk: 'medium',
    controlsTested: 8,
    gapsIdentified: 2,
    owner: 'Platform Ops',
    lastReviewed: '2026-03-20',
    controlsInScope: ['A.5.29', 'A.5.30', 'A.8.13', 'A.8.14'],
    gaps: [
      {
        title: 'Restore test for primary DB not completed in current quarter',
        severity: 'medium',
        status: 'open',
      },
      {
        title: 'DR runbook owner not assigned for analytics cluster',
        severity: 'low',
        status: 'open',
      },
    ],
    recommendations: [
      'Schedule quarterly restore test with signed results stored in ComplAI.',
      'Assign DR runbook owners in the asset inventory.',
    ],
    linkedFindingIds: [],
  },
];

export const EXTERNAL_READINESS_CHECKLIST: ExternalReadinessItem[] = [
  {
    id: 'er-1',
    category: 'Policies & ISMS',
    task: 'Publish approved policy set with version history linked to controls',
    framework: 'SOC 2 / ISO 27001',
    owner: 'GRC Program',
    status: 'in_progress',
    dueDate: '2026-04-20',
  },
  {
    id: 'er-2',
    category: 'Evidence pack',
    task: 'Compile Q1 access review sign-offs and PAM session exports',
    framework: 'SOC 2',
    owner: 'IAM Team',
    status: 'in_progress',
    dueDate: '2026-04-15',
  },
  {
    id: 'er-3',
    category: 'Control testing',
    task: 'Close open CC6.1 and CC9.2 findings before external fieldwork',
    framework: 'SOC 2',
    owner: 'Security Engineering',
    status: 'blocked',
    dueDate: '2026-04-18',
  },
  {
    id: 'er-4',
    category: 'Stakeholder readiness',
    task: 'Schedule control owner walkthroughs with external auditor',
    framework: 'SOC 2',
    owner: 'GRC Program',
    status: 'ready',
    dueDate: '2026-04-10',
  },
  {
    id: 'er-5',
    category: 'ISO surveillance',
    task: 'Map Annex A controls to updated risk treatment plan',
    framework: 'ISO 27001',
    owner: 'Risk & Compliance',
    status: 'not_started',
    dueDate: '2026-06-01',
  },
];

export const AUDIT_ENGAGEMENTS: AuditEngagement[] = [
  {
    id: 'soc2-2026',
    name: 'SOC 2 Type II — FY2026',
    framework: 'SOC 2',
    auditor: 'Deloitte Cyber Risk',
    type: 'external',
    status: 'fieldwork',
    startDate: '2026-03-01',
    endDate: '2026-05-30',
    readiness: 78,
  },
  {
    id: 'iso-2026',
    name: 'ISO 27001 surveillance',
    framework: 'ISO 27001',
    auditor: 'BSI Group',
    type: 'external',
    status: 'planning',
    startDate: '2026-06-15',
    endDate: '2026-07-20',
    readiness: 64,
  },
  {
    id: 'ia-annual',
    name: 'Annual internal audit plan',
    framework: 'Multi-framework',
    auditor: 'Internal Audit function',
    type: 'internal',
    status: 'fieldwork',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    readiness: 54,
  },
];

export const AUDIT_FINDINGS: AuditFinding[] = [
  {
    id: 'IA-021',
    source: 'internal',
    engagement: 'Q2 Access Management Review',
    severity: 'high',
    title: '12 privileged accounts missing quarterly recertification',
    controlRef: 'CC6.1',
    owner: 'IAM Team',
    status: 'in_progress',
    dueDate: '2026-04-18',
  },
  {
    id: 'IA-019',
    source: 'internal',
    engagement: 'Q1 Vendor Due Diligence',
    severity: 'medium',
    title: 'Two critical vendors lack current SOC 2 report on file',
    controlRef: 'CC9.2',
    owner: 'Vendor Management',
    status: 'open',
    dueDate: '2026-04-25',
  },
  {
    id: 'F-1042',
    source: 'external',
    engagement: 'SOC 2 Type II — FY2026',
    severity: 'high',
    title: 'Access review evidence incomplete for Q1 privileged accounts',
    controlRef: 'CC6.1',
    owner: 'IAM Team',
    status: 'in_progress',
    dueDate: '2026-04-18',
  },
  {
    id: 'F-1043',
    source: 'external',
    engagement: 'SOC 2 Type II — FY2026',
    severity: 'medium',
    title: 'Vendor risk assessment missing for new SaaS processor',
    controlRef: 'CC9.2',
    owner: 'Vendor Management',
    status: 'open',
    dueDate: '2026-04-22',
  },
  {
    id: 'F-1038',
    source: 'external',
    engagement: 'ISO 27001 surveillance',
    severity: 'low',
    title: 'Policy version history not linked in evidence pack',
    controlRef: 'A.5.1',
    owner: 'GRC Program',
    status: 'open',
    dueDate: '2026-06-01',
  },
];

export const EVIDENCE_REQUESTS: EvidenceRequest[] = [
  {
    id: 'ER-89',
    engagement: 'SOC 2 Type II — FY2026',
    request: 'MFA enrollment report and authentication logs for workforce SSO',
    controlRef: 'CC6.1',
    assignee: 'IAM Team',
    status: 'accepted',
    dueDate: '2026-04-10',
  },
  {
    id: 'ER-90',
    engagement: 'SOC 2 Type II — FY2026',
    request: 'PAM session logs for admin accounts (Jan–Mar 2026)',
    controlRef: 'CC6.7',
    assignee: 'Security Engineering',
    status: 'submitted',
    dueDate: '2026-04-12',
  },
  {
    id: 'ER-91',
    engagement: 'SOC 2 Type II — FY2026',
    request: 'Change management tickets for production deployments',
    controlRef: 'CC8.1',
    assignee: 'Platform Ops',
    status: 'pending',
    dueDate: '2026-04-15',
  },
  {
    id: 'ER-94',
    engagement: 'ISO 27001 surveillance',
    request: 'Incident response tabletop exercise attendance',
    controlRef: 'A.5.24',
    assignee: 'SOC Lead',
    status: 'pending',
    dueDate: '2026-06-10',
  },
];

export const AUDIT_MILESTONES: AuditMilestone[] = [
  {
    id: 'M1',
    engagement: 'SOC 2 Type II — FY2026',
    label: 'Kick-off & scope confirmation',
    date: '2026-03-03',
    status: 'complete',
  },
  {
    id: 'M2',
    engagement: 'SOC 2 Type II — FY2026',
    label: 'Control walkthroughs',
    date: '2026-03-24',
    status: 'complete',
  },
  {
    id: 'M3',
    engagement: 'SOC 2 Type II — FY2026',
    label: 'Evidence sampling & testing',
    date: '2026-04-14',
    status: 'in_progress',
  },
  {
    id: 'M4',
    engagement: 'SOC 2 Type II — FY2026',
    label: 'Draft report review',
    date: '2026-05-12',
    status: 'upcoming',
  },
  {
    id: 'M5',
    engagement: 'ISO 27001 surveillance',
    label: 'Stage 1 documentation review',
    date: '2026-06-18',
    status: 'upcoming',
  },
];

export const AUDIT_STATUS_LABELS: Record<AuditEngagement['status'], string> = {
  planning: 'Planning',
  fieldwork: 'Fieldwork',
  reporting: 'Reporting',
  closed: 'Closed',
};

export const INTERNAL_PROGRAM_STATUS_LABELS: Record<InternalAuditProgram['status'], string> = {
  scheduled: 'Scheduled',
  in_progress: 'In progress',
  complete: 'Complete',
};

export const READINESS_STATUS_LABELS: Record<ExternalReadinessItem['status'], string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  ready: 'Ready',
  blocked: 'Blocked',
};

export const FINDING_SEVERITY_STYLES: Record<AuditFinding['severity'], string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const RISK_LEVEL_STYLES: Record<AuditRiskAssessment['inherentRisk'], string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-green-100 text-green-800',
};

export const READINESS_STATUS_STYLES: Record<ExternalReadinessItem['status'], string> = {
  not_started: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-800',
  ready: 'bg-green-100 text-green-800',
  blocked: 'bg-red-100 text-red-800',
};

export function getAuditRiskAssessmentById(id: string) {
  return AUDIT_RISK_ASSESSMENTS.find((row) => row.id === id);
}
