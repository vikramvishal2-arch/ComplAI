export type PolicyReviewCategory =
  | 'missing_section'
  | 'control_requirement'
  | 'framework_gap'
  | 'metadata'
  | 'best_practice';

export type PolicyReviewSeverity = 'critical' | 'high' | 'medium' | 'low';

export type PolicyReviewStatus = 'open' | 'applied' | 'dismissed';

export interface PolicyReviewRecommendation {
  id: string;
  category: PolicyReviewCategory;
  severity: PolicyReviewSeverity;
  standardRef: string;
  framework: string;
  title: string;
  finding: string;
  recommendation: string;
  suggestedText?: string;
  sectionHeading?: string;
  status: PolicyReviewStatus;
  appliedAt?: string;
}

export interface PolicyStandardsReview {
  reviewedAt: string;
  standards: string[];
  recommendations: PolicyReviewRecommendation[];
}

export function parseStandardsReview(raw: unknown): PolicyStandardsReview | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.reviewedAt !== 'string' || !Array.isArray(obj.recommendations)) return null;
  return {
    reviewedAt: obj.reviewedAt,
    standards: Array.isArray(obj.standards) ? obj.standards.map(String) : [],
    recommendations: obj.recommendations as PolicyReviewRecommendation[],
  };
}
