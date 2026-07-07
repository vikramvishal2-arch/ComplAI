import type { PrivacyModule } from '../types';

export const PRIVACY_MODULES: PrivacyModule[] = [
  {
    id: 'governance',
    name: 'Governance & Accountability',
    shortName: 'Governance',
    description:
      'Privacy program charter, roles (DPO/Privacy Lead), policies, accountability structures, and board reporting.',
    nistFunction: 'govern-p',
    icon: 'Landmark',
    capabilities: [
      'Privacy program charter and scope',
      'DPO / Privacy Lead appointment',
      'Privacy policy framework',
      'Accountability and board reporting',
      'Regulatory engagement register',
    ],
    controlCount: 0,
  },
  {
    id: 'data-inventory',
    name: 'Data Inventory & RoPA',
    shortName: 'Data Inventory',
    description:
      'Records of Processing Activities, data flow mapping, system inventory, and data categorization.',
    nistFunction: 'identify-p',
    icon: 'Database',
    capabilities: [
      'Records of Processing Activities (RoPA)',
      'Data flow and lineage mapping',
      'Personal data categories and fields',
      'Processing purpose registry',
      'System and application inventory',
    ],
    controlCount: 0,
  },
  {
    id: 'data-discovery',
    name: 'Data Discovery',
    shortName: 'Discovery',
    description:
      'Automated and manual discovery of personal data across databases, file shares, SaaS, and cloud — feeding RoPA and classification.',
    nistFunction: 'identify-p',
    icon: 'Search',
    capabilities: [
      'Discovery scope and data source registry',
      'Structured database and warehouse scanning',
      'Unstructured files, email, and cloud SaaS discovery',
      'Shadow IT and unsanctioned tool detection',
      'Discovery-to-RoPA reconciliation workflow',
    ],
    controlCount: 0,
  },
  {
    id: 'data-classification',
    name: 'Data Classification',
    shortName: 'Classification',
    description:
      'Taxonomy, labeling, and handling rules for personal and sensitive data — manual and automated classification with accuracy review.',
    nistFunction: 'identify-p',
    icon: 'Tags',
    capabilities: [
      'Classification taxonomy (public, internal, confidential, restricted)',
      'PII / sensitive data labels and handling rules',
      'Automated classification rules and DLP integration',
      'Special category and children data tagging',
      'Classification accuracy review and reclassification',
    ],
    controlCount: 0,
  },
  {
    id: 'risk-dpia',
    name: 'Privacy Risk & DPIA',
    shortName: 'Risk & DPIA',
    description:
      'Privacy risk assessments, Data Protection Impact Assessments, Legitimate Interest Assessments, and risk treatment.',
    nistFunction: 'identify-p',
    icon: 'ShieldAlert',
    capabilities: [
      'Privacy risk register',
      'DPIA / PIA workflow and templates',
      'Legitimate Interest Assessment (LIA)',
      'Risk treatment and residual risk acceptance',
      'High-risk processing triggers',
    ],
    controlCount: 0,
  },
  {
    id: 'consent-legal-basis',
    name: 'Consent & Legal Basis',
    shortName: 'Consent',
    description:
      'Lawful basis determination, consent capture and withdrawal, preference management, and legitimate use documentation.',
    nistFunction: 'control-p',
    icon: 'CheckCircle2',
    capabilities: [
      'Lawful basis per processing activity',
      'Consent management platform integration',
      'Granular consent and preference center',
      'Consent withdrawal propagation',
      'Legitimate use / legitimate interest documentation',
    ],
    controlCount: 0,
  },
  {
    id: 'transparency',
    name: 'Transparency & Notices',
    shortName: 'Transparency',
    description:
      'Privacy notices, layered notices, cookie policies, employee privacy notices, and transparency at collection points.',
    nistFunction: 'communicate-p',
    icon: 'FileText',
    capabilities: [
      'External privacy notice management',
      'Layered / just-in-time notices',
      'Cookie and tracking disclosures',
      'Employee and candidate privacy notices',
      'Notice version control and publication',
    ],
    controlCount: 0,
  },
  {
    id: 'data-subject-rights',
    name: 'Data Subject Rights',
    shortName: 'DSAR',
    description:
      'Data Subject Access Requests and rights fulfillment — access, rectification, erasure, portability, objection, and restriction.',
    nistFunction: 'control-p',
    icon: 'UserCheck',
    capabilities: [
      'DSAR intake and identity verification',
      'Access, rectification, erasure workflows',
      'Data portability export',
      'Objection and restriction handling',
      'SLA tracking and regulatory timelines',
    ],
    controlCount: 0,
  },
  {
    id: 'privacy-by-design',
    name: 'Privacy by Design & Default',
    shortName: 'PbD',
    description:
      'Privacy embedded in SDLC, product reviews, default settings, minimization, and pseudonymization controls.',
    nistFunction: 'control-p',
    icon: 'Layers',
    capabilities: [
      'Privacy review in SDLC gates',
      'Data minimization checklist',
      'Default privacy settings validation',
      'Pseudonymization and anonymization standards',
      'AI / automated decision-making reviews',
    ],
    controlCount: 0,
  },
  {
    id: 'processors-vendors',
    name: 'Processors & Vendors',
    shortName: 'Processors',
    description:
      'Data Processing Agreements, sub-processor management, vendor privacy assessments, and processor oversight.',
    nistFunction: 'govern-p',
    icon: 'Building2',
    capabilities: [
      'Processor and sub-processor register',
      'DPA template and execution tracking',
      'Vendor privacy assessment questionnaires',
      'Sub-processor change notification',
      'Processor audit and assurance evidence',
    ],
    controlCount: 0,
  },
  {
    id: 'cross-border-transfers',
    name: 'Cross-Border Transfers',
    shortName: 'Transfers',
    description:
      'International data transfer mechanisms — SCCs, adequacy, BCRs, Transfer Impact Assessments, and localization.',
    nistFunction: 'control-p',
    icon: 'Globe',
    capabilities: [
      'Transfer register and destination mapping',
      'Standard Contractual Clauses (SCCs)',
      'Transfer Impact Assessment (TIA)',
      'Adequacy and localization decisions',
      'Government access request procedures',
    ],
    controlCount: 0,
  },
  {
    id: 'breach-response',
    name: 'Breach Response & Notification',
    shortName: 'Breach',
    description:
      'Personal data breach detection, assessment, containment, regulatory notification, and data principal communication.',
    nistFunction: 'protect-p',
    icon: 'Siren',
    capabilities: [
      'Breach detection and triage playbook',
      '72-hour / DPDP notification timelines',
      'Breach severity and risk assessment',
      'Regulatory and Data Principal notification',
      'Breach register and post-incident review',
    ],
    controlCount: 0,
  },
  {
    id: 'retention-disposal',
    name: 'Retention & Disposal',
    shortName: 'Retention',
    description:
      'Retention schedules, automated deletion, secure disposal, and archival policies for personal data.',
    nistFunction: 'control-p',
    icon: 'Archive',
    capabilities: [
      'Retention schedule by data category',
      'Automated deletion and expiry jobs',
      'Secure disposal and media sanitization',
      'Legal hold exception management',
      'Retention evidence and audit trail',
    ],
    controlCount: 0,
  },
  {
    id: 'training-awareness',
    name: 'Training & Awareness',
    shortName: 'Training',
    description:
      'Privacy awareness training, role-based curricula, phishing simulations, and workforce attestation.',
    nistFunction: 'govern-p',
    icon: 'GraduationCap',
    capabilities: [
      'Annual privacy training program',
      'Role-based training (engineering, HR, sales)',
      'New hire privacy onboarding',
      'Training completion tracking',
      'Awareness campaigns and phishing tests',
    ],
    controlCount: 0,
  },
  {
    id: 'monitoring-audit',
    name: 'Monitoring & Audit',
    shortName: 'Audit',
    description:
      'Continuous compliance monitoring, internal audits, metrics and KPIs, and external certification readiness.',
    nistFunction: 'govern-p',
    icon: 'BarChart3',
    capabilities: [
      'Privacy program KPIs and dashboards',
      'Internal privacy audit schedule',
      'Control effectiveness testing',
      'Regulatory inspection readiness',
      'ISO 27701 / certification evidence pack',
    ],
    controlCount: 0,
  },
];

export function getModuleById(id: string) {
  return PRIVACY_MODULES.find((m) => m.id === id);
}
