export type VendorRiskDomain = 'security' | 'privacy' | 'compliance' | 'resilience' | 'operations';

export type VendorFindingSeverity = 'critical' | 'high' | 'medium' | 'low';

export type VendorFindingStatus =
  | 'open'
  | 'remediation_requested'
  | 'in_progress'
  | 'resolved'
  | 'accepted';

export type VendorRemediationStatus = 'pending' | 'in_progress' | 'completed' | 'waived';

export type VendorCertificationStatus = 'verified' | 'claimed' | 'expired' | 'in_progress';

export interface VendorCertification {
  id: string;
  name: string;
  framework: string;
  status: VendorCertificationStatus;
  scope?: string;
  issuedAt?: string;
  expiresAt?: string;
  sourceName?: string;
  sourceUrl?: string;
  verifiedAt?: string;
}

export interface VendorDomainScore {
  domain: VendorRiskDomain;
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
  findingsCount: number;
}

export interface VendorFinding {
  id: string;
  questionId: string;
  domain: VendorRiskDomain;
  title: string;
  description: string;
  recommendation: string;
  severity: VendorFindingSeverity;
  status: VendorFindingStatus;
  controlIds: string[];
  controlRefs: string[];
  detectedAt: string;
  dueDate?: string;
  owner?: string;
}

export interface VendorRemediationItem {
  id: string;
  findingId: string;
  title: string;
  description: string;
  severity: VendorFindingSeverity;
  status: VendorRemediationStatus;
  owner: string;
  dueDate?: string;
  requestedAt: string;
  completedAt?: string;
  notes: string;
}

export interface VendorAssessmentTemplate {
  id: string;
  name: string;
  description: string;
  framework: string;
  estimatedMinutes: number;
  controlCount: number;
}

export interface VendorRatingSnapshot {
  score: number;
  grade: string;
  upguardScale: number;
  trend: 'up' | 'down' | 'stable';
  assessedAt: string | null;
}

export const DOMAIN_LABELS: Record<VendorRiskDomain, string> = {
  security: 'Security',
  privacy: 'Privacy',
  compliance: 'Compliance & Legal',
  resilience: 'Resilience & BCP',
  operations: 'Operations',
};

export function parseFindings(raw: unknown): VendorFinding[] {
  if (!Array.isArray(raw)) return [];
  return raw as VendorFinding[];
}

export function parseRemediationItems(raw: unknown): VendorRemediationItem[] {
  if (!Array.isArray(raw)) return [];
  return raw as VendorRemediationItem[];
}

export function parseCertifications(raw: unknown): VendorCertification[] {
  if (!Array.isArray(raw)) return [];
  return raw as VendorCertification[];
}

export function parseDomainScores(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object') return {};
  return raw as Record<string, number>;
}
