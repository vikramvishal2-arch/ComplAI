export type PrivacyFrameworkId = 'nist-privacy' | 'iso27701' | 'gdpr' | 'india-dpdp';

export type NistFunction = 'identify-p' | 'govern-p' | 'control-p' | 'communicate-p' | 'protect-p';

export type PrivacyModuleId =
  | 'governance'
  | 'data-inventory'
  | 'data-discovery'
  | 'data-classification'
  | 'risk-dpia'
  | 'consent-legal-basis'
  | 'transparency'
  | 'data-subject-rights'
  | 'privacy-by-design'
  | 'processors-vendors'
  | 'cross-border-transfers'
  | 'breach-response'
  | 'retention-disposal'
  | 'training-awareness'
  | 'monitoring-audit';

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
  | 'training_awareness'
  | 'contractual'
  | 'custom'
  | 'not_applicable';

export interface PrivacyFramework {
  id: PrivacyFrameworkId;
  name: string;
  shortName: string;
  description: string;
  region: string;
  version: string;
  controlCount: number;
}

export interface PrivacyModule {
  id: PrivacyModuleId;
  name: string;
  shortName: string;
  description: string;
  nistFunction: NistFunction;
  icon: string;
  capabilities: string[];
  controlCount: number;
}

export interface FrameworkMapping {
  frameworkId: PrivacyFrameworkId;
  reference: string;
}

export interface PrivacyControl {
  id: string;
  moduleId: PrivacyModuleId;
  reference: string;
  title: string;
  description: string;
  guidance: string;
  frameworkMappings: FrameworkMapping[];
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
  byModule: {
    moduleId: string;
    readiness: number;
    total: number;
    ready: number;
  }[];
}

export const NIST_FUNCTION_LABELS: Record<NistFunction, string> = {
  'identify-p': 'Identify-P',
  'govern-p': 'Govern-P',
  'control-p': 'Control-P',
  'communicate-p': 'Communicate-P',
  'protect-p': 'Protect-P',
};

export const COMPLIANCE_STATUS_LABELS: Record<ComplianceStatus, string> = {
  not_started: 'Not started',
  planning: 'Planning',
  implementing: 'Implementing',
  implemented: 'Implemented',
  needs_review: 'Needs review',
  audit_ready: 'Audit ready',
  not_applicable: 'N/A',
};

export const COMPLIANCE_METHOD_LABELS: Record<ComplianceMethod, string> = {
  policy: 'Policy',
  procedure: 'Procedure',
  technical_control: 'Technical control',
  manual_process: 'Manual process',
  training_awareness: 'Training',
  contractual: 'Contractual',
  custom: 'Custom',
  not_applicable: 'N/A',
};

export type RemediationActionStatus = 'open' | 'in_progress' | 'completed';

export type ControlIssueSeverity = 'critical' | 'high' | 'medium' | 'low';

export type ControlIssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export type EvidenceContext = 'compliance' | 'remediation' | 'issues';

export type RagStatus = 'green' | 'amber' | 'red';

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

export interface ControlRemediation {
  controlId: string;
  actions: RemediationAction[];
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

export interface ExecutiveModuleSummary {
  moduleId: string;
  moduleLabel: string;
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
  green: number;
  amber: number;
  red: number;
  total: number;
  readinessPercent: number;
  modules: ExecutiveModuleSummary[];
}

export interface LeadershipAttentionItem {
  id: string;
  severity: 'high' | 'medium' | 'low';
  category: 'control' | 'module' | 'framework';
  title: string;
  description: string;
  frameworkShortName: string;
  controlId?: string;
  controlReference?: string;
  href: string;
}

export interface ExecutiveDashboard {
  organizationName: string;
  totalControls: number;
  green: number;
  amber: number;
  red: number;
  healthScore: number;
  frameworks: ExecutiveFrameworkView[];
  leadershipAttention: LeadershipAttentionItem[];
  priorityActions: string[];
}

export const REMEDIATION_STATUS_LABELS: Record<RemediationActionStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  completed: 'Completed',
};

export const ISSUE_SEVERITY_LABELS: Record<ControlIssueSeverity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const ISSUE_STATUS_LABELS: Record<ControlIssueStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const RAG_LABELS: Record<RagStatus, string> = {
  green: 'Green — Audit ready',
  amber: 'Amber — In progress',
  red: 'Red — Needs action',
};

// ── Privacy Risk Register & DPIA ────────────────────────────────────────────

export type PrivacyRiskLikelihood =
  | 'rare'
  | 'unlikely'
  | 'possible'
  | 'likely'
  | 'almost_certain';

export type PrivacyRiskImpact =
  | 'negligible'
  | 'minor'
  | 'moderate'
  | 'major'
  | 'critical';

export type PrivacyRiskSource =
  | 'dpia'
  | 'vendor_review'
  | 'system_audit'
  | 'incident'
  | 'ropa_review'
  | 'other';

export type DataLifecyclePhase =
  | 'collection'
  | 'processing'
  | 'storage'
  | 'sharing'
  | 'retention'
  | 'disposal'
  | 'cross_border';

export type PrivacyTreatmentStrategy = 'mitigate' | 'accept' | 'transfer' | 'avoid';

export type PrivacyRiskStatus = 'open' | 'in_treatment' | 'monitoring' | 'closed';

export type DpiaStatus =
  | 'draft'
  | 'in_review'
  | 'dpo_consulted'
  | 'approved'
  | 'rejected'
  | 'sa_consultation_required'
  | 'closed';

export interface PrivacyRiskRegisterEntry {
  id: string;
  riskReference: string;
  source: PrivacyRiskSource;
  affectedIndividualsAssets: string;
  description: string;
  dataLifecyclePhase: DataLifecyclePhase;
  inherentLikelihood: PrivacyRiskLikelihood;
  inherentImpact: PrivacyRiskImpact;
  inherentRiskRating: string;
  existingControls: string;
  treatmentPlan: string;
  treatmentStrategy: PrivacyTreatmentStrategy;
  owner: string;
  targetDueDate: string | null;
  residualLikelihood: PrivacyRiskLikelihood | null;
  residualImpact: PrivacyRiskImpact | null;
  residualRiskRating: string;
  status: PrivacyRiskStatus;
  lastReviewDate: string | null;
  nextReviewDate: string | null;
  linkedRopaRefs: string;
  linkedDpiaRefs: string;
  createdAt: string;
  updatedAt: string;
}

export interface DpiaRecord {
  id: string;
  dpiaReference: string;
  processingActivityName: string;
  description: string;
  triggerReason: string;
  necessityProportionality: string;
  dataCategories: string;
  affectedIndividuals: string;
  riskDescription: string;
  dataLifecyclePhase: DataLifecyclePhase;
  inherentLikelihood: PrivacyRiskLikelihood;
  inherentImpact: PrivacyRiskImpact;
  inherentRiskRating: string;
  measuresToMitigate: string;
  dpoConsultation: string;
  residualLikelihood: PrivacyRiskLikelihood | null;
  residualImpact: PrivacyRiskImpact | null;
  residualRiskRating: string;
  status: DpiaStatus;
  owner: string;
  initiatedDate: string | null;
  targetCompletionDate: string | null;
  completedDate: string | null;
  lastReviewDate: string | null;
  nextReviewDate: string | null;
  linkedRopaRefs: string;
  linkedRiskRefs: string;
  createdAt: string;
  updatedAt: string;
}

export const PRIVACY_RISK_LIKELIHOOD_LABELS: Record<PrivacyRiskLikelihood, string> = {
  rare: 'Rare',
  unlikely: 'Unlikely',
  possible: 'Possible',
  likely: 'Likely',
  almost_certain: 'Almost certain',
};

export const PRIVACY_RISK_IMPACT_LABELS: Record<PrivacyRiskImpact, string> = {
  negligible: 'Negligible',
  minor: 'Minor',
  moderate: 'Moderate',
  major: 'Major',
  critical: 'Critical',
};

export const PRIVACY_RISK_SOURCE_LABELS: Record<PrivacyRiskSource, string> = {
  dpia: 'DPIA',
  vendor_review: 'Vendor review',
  system_audit: 'System audit',
  incident: 'Incident',
  ropa_review: 'RoPA review',
  other: 'Other',
};

export const DATA_LIFECYCLE_LABELS: Record<DataLifecyclePhase, string> = {
  collection: 'Collection',
  processing: 'Processing',
  storage: 'Storage',
  sharing: 'Sharing',
  retention: 'Retention',
  disposal: 'Disposal',
  cross_border: 'Cross-border transfer',
};

export const PRIVACY_TREATMENT_LABELS: Record<PrivacyTreatmentStrategy, string> = {
  mitigate: 'Mitigate',
  accept: 'Accept',
  transfer: 'Transfer',
  avoid: 'Avoid',
};

export const PRIVACY_RISK_STATUS_LABELS: Record<PrivacyRiskStatus, string> = {
  open: 'Open',
  in_treatment: 'In treatment',
  monitoring: 'Monitoring',
  closed: 'Closed',
};

export const DPIA_STATUS_LABELS: Record<DpiaStatus, string> = {
  draft: 'Draft',
  in_review: 'In review',
  dpo_consulted: 'DPO consulted',
  approved: 'Approved',
  rejected: 'Rejected',
  sa_consultation_required: 'SA consultation required',
  closed: 'Closed',
};
