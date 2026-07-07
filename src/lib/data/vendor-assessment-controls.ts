import { controlAppliesToTemplate } from '../vendor/vendor-assessment-templates';

export type VendorTier = 'critical' | 'high' | 'medium' | 'low';
export type VendorDataAccess = 'none' | 'internal' | 'pii' | 'regulated';

export interface VendorAssessmentControlDef {
  id: string;
  category: string;
  /** Short checklist line shown in the assessment table */
  checklistLabel: string;
  question: string;
  /** What evidence or documentation satisfies this control */
  evidenceGuidance: string;
  weight: number;
  controlIds: string[];
  controlRefs: string[];
  minTier?: VendorTier;
  dataAccess?: VendorDataAccess[];
}

const TIER_RANK: Record<VendorTier, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/** Pre-defined TPRM vendor assessment checklist mapped to ISO 27001 and SOC 2 controls. */
export const PREDEFINED_VENDOR_ASSESSMENT_CONTROLS: VendorAssessmentControlDef[] = [
  {
    id: 'tprm-supplier-risk',
    category: 'Supplier onboarding',
    checklistLabel: 'Pre-onboarding security risk assessment completed',
    question:
      'Has a formal information security risk assessment been completed before onboarding this supplier, including review of their security posture and service scope?',
    evidenceGuidance: 'Completed risk assessment record, due diligence questionnaire, and approval sign-off.',
    weight: 10,
    controlIds: ['iso-a5-19', 'soc2-cc9-1'],
    controlRefs: ['A.5.19', 'CC9.1'],
    minTier: 'low',
  },
  {
    id: 'tprm-contract-security',
    category: 'Contractual requirements',
    checklistLabel: 'Security clauses included in supplier agreement',
    question:
      'Do supplier agreements include documented information security requirements (confidentiality, breach notification, audit rights, subprocessor approval, and data return/deletion on exit)?',
    evidenceGuidance: 'Executed contract or MSA with information security schedule and breach notification terms.',
    weight: 10,
    controlIds: ['iso-a5-20', 'soc2-cc9-2'],
    controlRefs: ['A.5.20', 'CC9.2'],
    minTier: 'low',
  },
  {
    id: 'tprm-ict-supply-chain',
    category: 'ICT supply chain',
    checklistLabel: 'ICT supply chain risk assessed for critical components',
    question:
      'For ICT products or services, has the organization assessed supply chain integrity, software provenance, and security risks for critical components?',
    evidenceGuidance: 'Supply chain risk assessment, SBOM review, or vendor software integrity attestation.',
    weight: 9,
    controlIds: ['iso-a5-21'],
    controlRefs: ['A.5.21'],
    minTier: 'high',
  },
  {
    id: 'tprm-ongoing-monitoring',
    category: 'Monitoring & review',
    checklistLabel: 'Annual (or triggered) supplier review process defined',
    question:
      'Is there a defined process to monitor, review, and re-assess the supplier at least annually (or on material change), including collection of attestation reports?',
    evidenceGuidance: 'TPRM review calendar, monitoring procedure, and last review date on file.',
    weight: 9,
    controlIds: ['iso-a5-22', 'soc2-cc9-2'],
    controlRefs: ['A.5.22', 'CC9.2'],
    minTier: 'medium',
  },
  {
    id: 'tprm-certification',
    category: 'Assurance & attestation',
    checklistLabel: 'Independent assurance report available (SOC 2 / ISO 27001)',
    question:
      'Does the supplier maintain current independent assurance (e.g. SOC 2 Type II, ISO 27001) covering the services in scope, and can reports be shared under NDA?',
    evidenceGuidance: 'SOC 2 Type II report, ISO 27001 certificate, or equivalent third-party attestation under NDA.',
    weight: 10,
    controlIds: ['iso-a5-22', 'soc2-cc9-2'],
    controlRefs: ['A.5.22', 'CC9.2'],
    minTier: 'medium',
  },
  {
    id: 'tprm-cloud-services',
    category: 'Cloud services',
    checklistLabel: 'Cloud shared responsibility model documented',
    question:
      'If cloud services are used, is the shared responsibility model documented, including configuration hardening, logging, encryption, and exit/data portability?',
    evidenceGuidance: 'Shared responsibility matrix, cloud security addendum, and configuration baseline documentation.',
    weight: 9,
    controlIds: ['iso-a5-23'],
    controlRefs: ['A.5.23'],
    minTier: 'medium',
  },
  {
    id: 'tprm-encryption',
    category: 'Data protection',
    checklistLabel: 'Encryption at rest and in transit confirmed',
    question:
      'How is organizational data encrypted at rest and in transit, and who manages encryption keys?',
    evidenceGuidance: 'Encryption standards document, TLS configuration evidence, and key management description.',
    weight: 9,
    controlIds: ['iso-a5-19', 'soc2-cc9-1'],
    controlRefs: ['A.5.19', 'CC9.1'],
    minTier: 'low',
    dataAccess: ['internal', 'pii', 'regulated'],
  },
  {
    id: 'tprm-privacy-dpa',
    category: 'Privacy & DPA',
    checklistLabel: 'Data Processing Agreement (DPA) in place',
    question:
      'If personal or regulated data is processed, is a Data Processing Agreement (or equivalent) in place covering purpose limitation, subprocessors, cross-border transfers, and breach notification?',
    evidenceGuidance: 'Executed DPA, privacy schedule, and subprocessor list with approval workflow.',
    weight: 10,
    controlIds: ['iso-a5-20', 'soc2-p6-3'],
    controlRefs: ['A.5.20', 'P6.3'],
    minTier: 'low',
    dataAccess: ['pii', 'regulated'],
  },
  {
    id: 'tprm-access-control',
    category: 'Access control',
    checklistLabel: 'Supplier MFA and least-privilege access verified',
    question:
      'Does the supplier enforce MFA, least-privilege access, and logging for personnel with access to your data or systems?',
    evidenceGuidance: 'Access control policy summary, MFA enforcement statement, or audit log retention details.',
    weight: 8,
    controlIds: ['iso-a5-19', 'soc2-cc9-1'],
    controlRefs: ['A.5.19', 'CC9.1'],
    minTier: 'medium',
    dataAccess: ['internal', 'pii', 'regulated'],
  },
  {
    id: 'tprm-incident-notification',
    category: 'Incident response',
    checklistLabel: 'Incident notification SLA and contacts defined',
    question:
      'What is the supplier incident notification SLA, and are roles and communication channels defined for security events affecting your data?',
    evidenceGuidance: 'Contractual breach notification timeline (e.g. 24–72 hours) and security contact details.',
    weight: 8,
    controlIds: ['iso-a5-20', 'iso-a5-22'],
    controlRefs: ['A.5.20', 'A.5.22'],
    minTier: 'medium',
  },
  {
    id: 'tprm-bcp-dr',
    category: 'Business continuity',
    checklistLabel: 'BCP/DR plans tested and aligned to RTOs',
    question:
      'Does the supplier maintain tested business continuity and disaster recovery plans aligned to your recovery time objectives?',
    evidenceGuidance: 'BCP/DR summary, last test date, and RTO/RPO alignment statement.',
    weight: 7,
    controlIds: ['iso-a5-19', 'soc2-cc9-1'],
    controlRefs: ['A.5.19', 'CC9.1'],
    minTier: 'high',
  },
  {
    id: 'tprm-subprocessors',
    category: 'Subprocessors',
    checklistLabel: 'Subprocessors disclosed and contractually bound',
    question:
      'Are subprocessors disclosed, contractually bound to equivalent security requirements, and subject to due diligence before engagement?',
    evidenceGuidance: 'Subprocessor register, notification process, and flow-down security clauses.',
    weight: 8,
    controlIds: ['iso-a5-19', 'iso-a5-21', 'soc2-cc9-2'],
    controlRefs: ['A.5.19', 'A.5.21', 'CC9.2'],
    minTier: 'medium',
    dataAccess: ['pii', 'regulated'],
  },
  {
    id: 'tprm-right-to-audit',
    category: 'Audit rights',
    checklistLabel: 'Right to audit or obtain remediation evidence',
    question:
      'Do contracts grant the right to audit, obtain penetration test summaries, or request remediation evidence for material security gaps?',
    evidenceGuidance: 'Audit rights clause, pen test summary sharing policy, or remediation SLA in contract.',
    weight: 7,
    controlIds: ['iso-a5-20', 'soc2-cc9-2'],
    controlRefs: ['A.5.20', 'CC9.2'],
    minTier: 'high',
  },
  {
    id: 'tprm-data-residency',
    category: 'Data residency',
    checklistLabel: 'Data location, retention, and deletion defined',
    question:
      'Where is data stored and processed (regions/jurisdictions), and are retention and secure deletion requirements contractually defined?',
    evidenceGuidance: 'Data residency statement, retention schedule, and secure deletion procedure.',
    weight: 8,
    controlIds: ['iso-a5-20'],
    controlRefs: ['A.5.20'],
    minTier: 'low',
    dataAccess: ['pii', 'regulated'],
  },
  {
    id: 'tprm-exit-offboarding',
    category: 'Exit & offboarding',
    checklistLabel: 'Supplier exit and data return process documented',
    question:
      'Is there a documented supplier exit process covering credential revocation, data return/deletion, and transition support?',
    evidenceGuidance: 'Exit runbook, data return certificate template, and offboarding checklist.',
    weight: 7,
    controlIds: ['iso-a5-20', 'iso-a5-23'],
    controlRefs: ['A.5.20', 'A.5.23'],
    minTier: 'high',
  },
  {
    id: 'tprm-ai-governance',
    category: 'AI & automation',
    checklistLabel: 'AI use on your data governed and logged',
    question:
      'If the supplier uses AI on your data, how are training data scope, model outputs, human oversight, and logging governed?',
    evidenceGuidance: 'AI governance policy, opt-out/training data scope terms, and output logging controls.',
    weight: 6,
    controlIds: ['iso-a5-19'],
    controlRefs: ['A.5.19'],
    minTier: 'critical',
  },
];

function tierMeetsMinimum(vendorTier: string, minTier: VendorTier | undefined): boolean {
  if (!minTier) return true;
  const vendorRank = TIER_RANK[vendorTier as VendorTier] ?? 2;
  return vendorRank >= TIER_RANK[minTier];
}

function matchesDataAccess(vendorAccess: string, allowed?: VendorDataAccess[]): boolean {
  if (!allowed?.length) return true;
  return allowed.includes(vendorAccess as VendorDataAccess);
}

export function getPredefinedVendorAssessmentQuestions(vendor: {
  tier: string;
  dataAccess: string;
  templateId?: string;
}) {
  const templateId = vendor.templateId ?? 'tprm-standard';
  return PREDEFINED_VENDOR_ASSESSMENT_CONTROLS.filter(
    (control) =>
      tierMeetsMinimum(vendor.tier, control.minTier) &&
      matchesDataAccess(vendor.dataAccess, control.dataAccess)
  )
    .filter((control) => controlAppliesToTemplate(control.id, templateId)).map(
    ({
      id,
      category,
      checklistLabel,
      question,
      evidenceGuidance,
      weight,
      controlIds,
      controlRefs,
    }) => ({
      id,
      category,
      checklistLabel,
      question,
      evidenceGuidance,
      weight,
      controlIds,
      controlRefs,
    })
  );
}

export function getVendorAssessmentControlSummary(): {
  totalControls: number;
  frameworks: string[];
} {
  return {
    totalControls: PREDEFINED_VENDOR_ASSESSMENT_CONTROLS.length,
    frameworks: ['ISO/IEC 27001:2022', 'SOC 2'],
  };
}
