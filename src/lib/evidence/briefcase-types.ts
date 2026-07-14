export type EvidenceBriefcaseModule =
  | 'controls'
  | 'risk'
  | 'tprm'
  | 'internal_audit'
  | 'risk_assessment'
  | 'policy'
  | 'assurance';

export interface EvidenceBriefcaseItem {
  id: string;
  module: EvidenceBriefcaseModule;
  title: string;
  summary: string;
  controlId?: string;
  controlRef?: string;
  controlTitle?: string;
  status?: string;
  owner?: string;
  recordedAt?: string;
  href: string;
  downloadHref?: string;
  tags: string[];
  /** Lowercased concatenation used for keyword scoring */
  searchableText: string;
}

export interface EvidenceBriefcaseIndex {
  generatedAt: string;
  total: number;
  byModule: Record<EvidenceBriefcaseModule, number>;
  items: EvidenceBriefcaseItem[];
}

export interface EvidenceBriefcaseSearchResult {
  query: string;
  keywords: string[];
  total: number;
  items: EvidenceBriefcaseItem[];
  reply: string;
}
