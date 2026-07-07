export type FrameworkCategory =
  | 'security'
  | 'privacy'
  | 'healthcare'
  | 'financial'
  | 'government'
  | 'ai';

export type ControlDomain =
  | 'access_control'
  | 'asset_management'
  | 'audit_logging'
  | 'business_continuity'
  | 'change_management'
  | 'cryptography'
  | 'data_protection'
  | 'governance'
  | 'human_resources'
  | 'incident_response'
  | 'network_security'
  | 'physical_security'
  | 'risk_management'
  | 'vendor_management'
  | 'vulnerability_management'
  | 'other';

export type ComplianceStatus =
  | 'not_started'
  | 'planning'
  | 'implementing'
  | 'implemented'
  | 'needs_review'
  | 'audit_ready'
  | 'not_applicable';

export type ComplianceMethod =
  | 'policy'
  | 'procedure'
  | 'technical_control'
  | 'manual_process'
  | 'automated_monitoring'
  | 'third_party_attestation'
  | 'training_awareness'
  | 'contractual'
  | 'custom'
  | 'not_applicable';

export interface Framework {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: FrameworkCategory;
  region: string;
  version: string;
  controlCount: number;
  popular: boolean;
  tags: string[];
}

export interface Control {
  id: string;
  frameworkId: string;
  reference: string;
  title: string;
  description: string;
  domain: ControlDomain;
  guidance: string;
  suggestedMethods: ComplianceMethod[];
}

export interface ControlCompliance {
  controlId: string;
  status: ComplianceStatus;
  complianceMethod: ComplianceMethod | null;
  implementationApproach: string;
  owner: string;
  targetDate: string | null;
  evidenceNotes: string;
  naJustification: string;
  lastUpdated: string;
}

export type RemediationActionStatus = 'open' | 'in_progress' | 'completed';

export type ControlIssueSeverity = 'critical' | 'high' | 'medium' | 'low';

export type ControlIssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export type EvidenceContext = 'compliance' | 'remediation' | 'issues';

export interface RemediationAction {
  id: string;
  title: string;
  description: string;
  remediationLink: string;
  linkLabel: string;
  status: RemediationActionStatus;
  assignee: string;
  dueDate: string | null;
  notes: string;
}

export type AccessConnectionStatus = 'not_connected' | 'connected' | 'pending' | 'error';

export interface AccessConnection {
  providerId: string;
  status: AccessConnectionStatus;
  accountIdentifier: string;
  adminContact: string;
  connectedAt: string | null;
  notes: string;
}

export interface ControlRemediation {
  controlId: string;
  actions: RemediationAction[];
  accessConnections: AccessConnection[];
  lastUpdated: string;
}

export interface ControlIssue {
  id: string;
  controlId: string;
  title: string;
  description: string;
  severity: ControlIssueSeverity;
  status: ControlIssueStatus;
  raisedBy: string;
  assignee: string;
  dueDate: string | null;
  resolutionNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ControlEvidence {
  id: string;
  controlId: string;
  context: EvidenceContext;
  issueId: string | null;
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  description: string;
  uploadedAt: string;
}

export type RiskLikelihood =
  | 'rare'
  | 'unlikely'
  | 'possible'
  | 'likely'
  | 'almost_certain';

export type RiskImpact = 'negligible' | 'minor' | 'moderate' | 'major' | 'critical';

export type RiskTreatment = 'mitigate' | 'accept' | 'transfer' | 'avoid';

export type RiskStatus = 'identified' | 'assessing' | 'treating' | 'accepted' | 'closed';

export interface Risk {
  id: string;
  controlId: string;
  title: string;
  description: string;
  category: string;
  likelihood: RiskLikelihood;
  impact: RiskImpact;
  riskScore: number;
  residualLikelihood: RiskLikelihood | null;
  residualImpact: RiskImpact | null;
  residualRiskScore: number | null;
  treatment: RiskTreatment;
  status: RiskStatus;
  owner: string;
  dueDate: string | null;
  mitigationPlan: string;
  createdAt: string;
  updatedAt: string;
}

export type RiskRegisterEntryType = 'risk' | 'issue';

export interface RiskRegisterEntry {
  id: string;
  entryType: RiskRegisterEntryType;
  controlId: string;
  controlReference: string;
  controlTitle: string;
  frameworkId: string;
  frameworkShortName: string;
  title: string;
  description: string;
  /** @deprecated Use inherentRisk / presentRisk for risk entries */
  severityOrScore: string;
  inherentRisk: string | null;
  presentRisk: string | null;
  status: string;
  owner: string;
  assignee: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RemediationPlaybookLink {
  id: string;
  title: string;
  description: string;
  url: string;
  linkLabel: string;
  category: string;
}

export interface AccessIntegrationProvider {
  id: string;
  name: string;
  description: string;
  docsUrl: string;
  consoleUrl: string;
  setupGuideUrl: string;
  checksProvided: string[];
}

export interface FrameworkActivation {
  frameworkId: string;
  activatedAt: string;
  targetAuditDate: string | null;
}

export interface DashboardSummary {
  activatedFrameworks: number;
  totalControls: number;
  auditReady: number;
  implementing: number;
  notStarted: number;
  notApplicable: number;
  overallReadiness: number;
  byFramework: {
    frameworkId: string;
    frameworkName: string;
    readiness: number;
    total: number;
    ready: number;
  }[];
  riskSummary: DashboardRiskSummary;
}

export interface DashboardRiskItem {
  id: string;
  title: string;
  status: string;
  frameworkShortName: string;
  controlReference: string;
  inherentRisk: string;
  presentRisk: string;
}

export interface DashboardRiskSummary {
  totalRisks: number;
  openRisks: number;
  inherentHighOrCritical: number;
  presentHighOrCritical: number;
  items: DashboardRiskItem[];
}

export type RagStatus = 'green' | 'amber' | 'red';

export interface ExecutiveDomainSummary {
  domain: ControlDomain;
  domainLabel: string;
  green: number;
  amber: number;
  red: number;
  total: number;
  readinessPercent: number;
  goGreenActions: string[];
}

export interface ExecutiveFrameworkView {
  frameworkId: string;
  frameworkName: string;
  readiness: number;
  green: number;
  amber: number;
  red: number;
  total: number;
  domains: ExecutiveDomainSummary[];
}

export interface LeadershipAttentionItem {
  id: string;
  severity: 'critical' | 'high' | 'medium';
  category: 'risk' | 'issue' | 'control' | 'domain';
  title: string;
  description: string;
  frameworkShortName: string;
  controlId?: string;
  controlReference?: string;
  href: string;
}

export interface ExecutiveDashboard {
  organizationName: string;
  frameworks: ExecutiveFrameworkView[];
  totals: {
    green: number;
    amber: number;
    red: number;
    total: number;
    readinessPercent: number;
  };
  leadershipAttention: LeadershipAttentionItem[];
  priorityGoGreenActions: string[];
  riskSummary: DashboardRiskSummary;
  programs?: LeadershipProgramSummaries;
}

export interface LeadershipGapItem {
  controlId: string;
  controlReference: string;
  title: string;
  severity: string;
  message: string;
}

export interface LeadershipAuditFindingItem {
  id: string;
  title: string;
  severity: string;
  source: string;
}

export interface LeadershipProgramSummaries {
  compliance: {
    auditReady: number;
    implementing: number;
    notStarted: number;
    overallReadiness: number;
    totalControls: number;
  };
  tprm: {
    vendorCount: number;
    monitoredCount: number;
    averageRating950: number | null;
    criticalFindings: number;
    pendingQuestionnaires: number;
    openRemediations: number;
  };
  gaps: {
    gapsFound: number;
    critical: number;
    policyGaps: number;
    evidenceGaps: number;
    topGaps: LeadershipGapItem[];
  };
  audits: {
    activeInternalPrograms: number;
    riskAreasAssessed: number;
    openFindings: number;
    externalReadinessReady: number;
    externalReadinessTotal: number;
    topFindings: LeadershipAuditFindingItem[];
  };
  policies: {
    total: number;
    draft: number;
    inReview: number;
    approved: number;
    archived: number;
  };
  monitoring: {
    awsConfigured: boolean;
    azureConfigured: boolean;
    awsPassed: number | null;
    awsFailed: number | null;
    azurePassed: number | null;
    azureFailed: number | null;
  };
}

export type ProgramType =
  | 'internal_audit'
  | 'external_audit'
  | 'risk_assessment'
  | 'vendor_assessment'
  | 'risk_register_update';

export type CycleStatus = 'upcoming' | 'in_progress' | 'completed' | 'overdue';

export interface ProgramCycle {
  id: string;
  programType: ProgramType;
  title: string;
  description: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  status: CycleStatus;
  owner: string;
  lastCompletedAt: string | null;
  completedAt: string | null;
  reminderDays: number[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CycleReminder {
  id: string;
  cycleId: string;
  channel: 'in_app' | 'email';
  reminderType: string;
  recipientEmail: string;
  sentAt: string;
  acknowledged: boolean;
  acknowledgedAt: string | null;
}

export interface CycleWithReminders extends ProgramCycle {
  reminders: CycleReminder[];
  daysUntilDue: number;
  isOverdue: boolean;
  activeReminderCount: number;
}

export const PROGRAM_TYPE_LABELS: Record<ProgramType, string> = {
  internal_audit: 'Annual Internal Audit',
  external_audit: 'External Audit',
  risk_assessment: 'Risk Assessment',
  vendor_assessment: 'Vendor Annual Assessment',
  risk_register_update: 'Risk Register Update',
};

export const PROGRAM_TYPE_ICONS: Record<ProgramType, string> = {
  internal_audit: 'ClipboardCheck',
  external_audit: 'ShieldCheck',
  risk_assessment: 'Target',
  vendor_assessment: 'Building2',
  risk_register_update: 'ShieldAlert',
};

export const CYCLE_STATUS_LABELS: Record<CycleStatus, string> = {
  upcoming: 'Upcoming',
  in_progress: 'In Progress',
  completed: 'Completed',
  overdue: 'Overdue',
};

export const COMPLIANCE_STATUS_LABELS: Record<ComplianceStatus, string> = {
  not_started: 'Not Started',
  planning: 'Planning',
  implementing: 'Implementing',
  implemented: 'Implemented',
  needs_review: 'Needs Review',
  audit_ready: 'Audit Ready',
  not_applicable: 'Not Applicable',
};

export const COMPLIANCE_METHOD_LABELS: Record<ComplianceMethod, string> = {
  policy: 'Policy Document',
  procedure: 'Standard Operating Procedure',
  technical_control: 'Technical Control',
  manual_process: 'Manual Process',
  automated_monitoring: 'Automated Monitoring',
  third_party_attestation: 'Third-Party Attestation',
  training_awareness: 'Training & Awareness',
  contractual: 'Contractual Requirement',
  custom: 'Custom Approach',
  not_applicable: 'Not Applicable',
};

export const DOMAIN_LABELS: Record<ControlDomain, string> = {
  access_control: 'Access Control',
  asset_management: 'Asset Management',
  audit_logging: 'Audit & Logging',
  business_continuity: 'Business Continuity',
  change_management: 'Change Management',
  cryptography: 'Cryptography',
  data_protection: 'Data Protection',
  governance: 'Governance',
  human_resources: 'Human Resources',
  incident_response: 'Incident Response',
  network_security: 'Network Security',
  physical_security: 'Physical Security',
  risk_management: 'Risk Management',
  vendor_management: 'TPRM',
  vulnerability_management: 'Vulnerability Management',
  other: 'Other',
};

export const CATEGORY_LABELS: Record<FrameworkCategory, string> = {
  security: 'Security',
  privacy: 'Privacy',
  healthcare: 'Healthcare',
  financial: 'Financial',
  government: 'Government',
  ai: 'AI & Emerging',
};

export const REMEDIATION_STATUS_LABELS: Record<RemediationActionStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export const ACCESS_CONNECTION_STATUS_LABELS: Record<AccessConnectionStatus, string> = {
  not_connected: 'Not Connected',
  connected: 'Connected',
  pending: 'Pending Setup',
  error: 'Connection Error',
};

export const ISSUE_SEVERITY_LABELS: Record<ControlIssueSeverity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const ISSUE_STATUS_LABELS: Record<ControlIssueStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const RISK_LIKELIHOOD_LABELS: Record<RiskLikelihood, string> = {
  rare: 'Rare',
  unlikely: 'Unlikely',
  possible: 'Possible',
  likely: 'Likely',
  almost_certain: 'Almost Certain',
};

export const RISK_IMPACT_LABELS: Record<RiskImpact, string> = {
  negligible: 'Negligible',
  minor: 'Minor',
  moderate: 'Moderate',
  major: 'Major',
  critical: 'Critical',
};

export const RISK_TREATMENT_LABELS: Record<RiskTreatment, string> = {
  mitigate: 'Mitigate',
  accept: 'Accept',
  transfer: 'Transfer',
  avoid: 'Avoid',
};

export const RISK_STATUS_LABELS: Record<RiskStatus, string> = {
  identified: 'Identified',
  assessing: 'Assessing',
  treating: 'Treating',
  accepted: 'Accepted',
  closed: 'Closed',
};

export const RISK_CATEGORY_OPTIONS = [
  'compliance',
  'security',
  'operational',
  'financial',
  'reputational',
  'legal',
  'third_party',
] as const;
