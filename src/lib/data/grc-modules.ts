import { AUDIT_NAV_ITEMS } from '@/lib/data/audit-nav';
import { ASSURANCE_NAV_ITEMS } from '@/lib/data/assurance-nav';

export type GrcModuleCategory = 'govern' | 'identify' | 'protect' | 'detect' | 'respond';

export type GrcModuleLink = { href: string; label: string };

export type GrcModule = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  href: string;
  category: GrcModuleCategory;
  capabilities: string[];
  subLinks?: GrcModuleLink[];
};

export const GRC_MODULE_CATEGORY_LABELS: Record<GrcModuleCategory, string> = {
  govern: 'Govern',
  identify: 'Identify',
  protect: 'Protect',
  detect: 'Detect',
  respond: 'Respond',
};

export const GRC_MODULES: GrcModule[] = [
  {
    id: 'compliance',
    name: 'Compliance & Controls',
    shortName: 'Compliance',
    description:
      'Framework coverage, control implementation status, RAG posture, and evidence readiness across SOC 2, ISO 27001, and more.',
    href: '/controls',
    category: 'govern',
    capabilities: [
      'Multi-framework control catalog',
      'RAG status and readiness scoring',
      'Evidence and implementation tracking',
      'Gap analysis alignment',
    ],
    subLinks: [
      { href: '/frameworks', label: 'Frameworks' },
      { href: '/controls', label: 'Control library' },
      { href: '/evidence', label: 'Evidence briefcase' },
    ],
  },
  {
    id: 'evidence',
    name: 'Evidence Briefcase',
    shortName: 'Evidence',
    description:
      'Search evidence across controls, risk, TPRM, internal audit, risk assessments, and policies in one place.',
    href: '/evidence',
    category: 'govern',
    capabilities: [
      'Unified evidence index',
      'Keyword search assistant',
      'Cross-module discovery',
      'Download and source links',
    ],
  },
  {
    id: 'policies',
    name: 'Policies & Standards',
    shortName: 'Policies',
    description:
      'Policy lifecycle, standards mapping, version control, and approval workflows for your security and compliance program.',
    href: '/policies',
    category: 'govern',
    capabilities: [
      'Policy template library',
      'Standards review and mapping',
      'Version and owner tracking',
      'Approval routing',
    ],
    subLinks: [
      { href: '/policies', label: 'Policy library' },
      { href: '/policies/approvals', label: 'My approvals' },
    ],
  },
  {
    id: 'risk',
    name: 'Risk Register',
    shortName: 'Risk',
    description:
      'Enterprise risk register with inherent and residual scoring, treatment plans, and linkage to controls and audits.',
    href: '/risk-register',
    category: 'identify',
    capabilities: [
      'Risk identification and categorization',
      'Inherent vs residual scoring',
      'Treatment and ownership',
      'CSV import and export',
    ],
  },
  {
    id: 'tprm',
    name: 'Third-Party Risk (TPRM)',
    shortName: 'TPRM',
    description:
      'Vendor security ratings, questionnaires, findings, and remediation for your third-party and supply chain program.',
    href: '/vendors',
    category: 'identify',
    capabilities: [
      'Vendor portfolio and tiering',
      'Security questionnaires',
      'External intelligence ratings',
      'Findings and remediation tracking',
    ],
    subLinks: [
      { href: '/vendors', label: 'Vendor portfolio' },
      { href: '/vendors/questionnaires', label: 'Questionnaires' },
      { href: '/vendors/remediation', label: 'Remediation' },
    ],
  },
  {
    id: 'assurance',
    name: 'Assurance & Vulnerability Management',
    shortName: 'Assurance',
    description:
      'SAST, DAST, infrastructure, and cloud scanning with VA tool integrations and Jira-backed remediation for open vulnerabilities.',
    href: '/assurance',
    category: 'detect',
    capabilities: [
      'SAST, DAST, infra, and cloud findings',
      'Unified open vulnerability view',
      'Nessus, Qualys, AppScan, Nmap API sync',
      'Jira ticket workflow',
    ],
    subLinks: ASSURANCE_NAV_ITEMS.filter((item) => item.href !== '/assurance').map((item) => ({
      href: item.href,
      label: item.label,
    })),
  },
  {
    id: 'audits',
    name: 'Audits & Readiness',
    shortName: 'Audits',
    description:
      'Internal audit programs, risk assessments, findings tracking, and external audit preparedness.',
    href: '/audits',
    category: 'detect',
    capabilities: [
      'Internal audit planning',
      'Risk assessment workflows',
      'Findings and remediation',
      'External audit readiness checklist',
    ],
    subLinks: AUDIT_NAV_ITEMS.filter((item) => item.href !== '/audits').map((item) => ({
      href: item.href,
      label: item.label,
    })),
  },
  {
    id: 'cycles',
    name: 'Annual Program Cycle',
    shortName: 'Cycles',
    description:
      'Recurring GRC program milestones — internal audit, risk assessment, policy review, and external audit cycles.',
    href: '/cycles',
    category: 'govern',
    capabilities: [
      'Program cycle scheduling',
      'Owner and due date tracking',
      'Reminder notifications',
      'Leadership dashboard visibility',
    ],
  },
  {
    id: 'learning',
    name: 'Security Learning',
    shortName: 'Learning',
    description:
      'Interactive security awareness training, scenario-based modules, and completion tracking for workforce programs.',
    href: '/security-learning',
    category: 'protect',
    capabilities: [
      'Scenario-based training modules',
      'Role-aligned content',
      'Completion tracking',
      'Audit-ready training evidence',
    ],
  },
  {
    id: 'intelligence',
    name: 'ComplAI Intelligence',
    shortName: 'Intelligence',
    description:
      'AI copilot, gap analysis, security questionnaires, Google Chronicle integration, and continuous monitoring.',
    href: '/intelligence',
    category: 'detect',
    capabilities: [
      'AI-assisted gap analysis',
      'Questionnaire auto-fill',
      'SecOps intelligence context',
      'Remediation guidance',
    ],
  },
  {
    id: 'integrations',
    name: 'Integrations',
    shortName: 'Integrations',
    description:
      'Connect HRMS, IDAM, SIEM, VAPT, and SSO tools — catalog, guides, and connector configuration.',
    href: '/integrations',
    category: 'protect',
    capabilities: [
      'Integration catalog by domain',
      'Setup guides and use cases',
      'Chronicle and analytics connectors',
      'VA tool API connections',
    ],
  },
];

export function getGrcModuleById(id: string) {
  return GRC_MODULES.find((m) => m.id === id);
}
