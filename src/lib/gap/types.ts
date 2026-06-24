import type { RagStatus } from '../types';

export type GapSeverity = 'critical' | 'high' | 'medium' | 'low';
export type GapCategory =
  | 'missing_method'
  | 'missing_owner'
  | 'missing_approach'
  | 'missing_evidence'
  | 'open_issues'
  | 'open_risks'
  | 'weak_documentation'
  | 'audit_blocker';

export interface ComplianceGap {
  controlId: string;
  controlReference: string;
  controlTitle: string;
  frameworkId: string;
  frameworkName: string;
  ragStatus: RagStatus;
  category: GapCategory;
  severity: GapSeverity;
  message: string;
  suggestedActions: string[];
}

export interface GapAnalysisReport {
  organizationName: string;
  generatedAt: string;
  summary: {
    totalControls: number;
    gapsFound: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    byCategory: Record<GapCategory, number>;
  };
  policyGaps: ComplianceGap[];
  evidenceGaps: ComplianceGap[];
  priorityGaps: ComplianceGap[];
  allGaps: ComplianceGap[];
}
