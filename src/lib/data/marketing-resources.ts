export type FrameworkGuide = {
  slug: string;
  frameworkId: string;
  title: string;
  shortName: string;
  tagline: string;
  overview: string;
  whoNeedsIt: string;
  keyTopics: string[];
  auditTimeline: string;
  howComplAIHelps: string[];
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const MARKETING_FAQS: FaqItem[] = [
  {
    id: 'what-is-grc',
    question: 'What is GRC and why does it matter?',
    answer:
      'GRC stands for Governance, Risk, and Compliance. It is the practice of aligning security controls, risk management, and regulatory requirements so your organization can operate with confidence. A structured GRC program helps you pass audits, win customer trust, and reduce security incidents — without relying on spreadsheets and email threads.',
  },
  {
    id: 'what-is-complai',
    question: 'What is ComplAI?',
    answer:
      'ComplAI is the GRC compliance platform from Propel Ready Solutions. It brings together security frameworks, ISMS policy templates, multi-stage approvals, control evidence, risk registers, vendor assessments, integrations, and AI-assisted intelligence in one workspace — so teams stay continuously audit-ready.',
  },
  {
    id: 'soc2-vs-iso',
    question: 'What is the difference between SOC 2 and ISO 27001?',
    answer:
      'SOC 2 is a US-focused attestation report based on the AICPA Trust Services Criteria, commonly requested by SaaS buyers. ISO 27001 is an international certification standard for an Information Security Management System (ISMS). Many companies pursue both: SOC 2 for sales velocity in North America, and ISO 27001 for global certification and structured ISMS maturity.',
  },
  {
    id: 'how-long-soc2',
    question: 'How long does SOC 2 Type II typically take?',
    answer:
      'Most organizations need 3–6 months to prepare for a first SOC 2 Type II audit, including a minimum observation period (often 3–12 months depending on scope). Timeline depends on existing controls, team bandwidth, and scope (Security-only vs. additional trust principles). ComplAI helps accelerate readiness with pre-mapped controls, policy templates, and evidence tracking.',
  },
  {
    id: 'iso27001-certification',
    question: 'How do you get ISO 27001 certified?',
    answer:
      'ISO 27001 certification requires establishing an ISMS, conducting a risk assessment, implementing Annex A controls, running internal audits, and passing a two-stage external audit by an accredited certification body. ComplAI provides ISO 27001-mapped controls and 100+ Annex A-aligned ISMS policy and procedure templates to support each stage.',
  },
  {
    id: 'india-frameworks',
    question: 'Does ComplAI support India-specific regulations?',
    answer:
      'Yes. ComplAI includes frameworks and templates for India DPDP (Digital Personal Data Protection), SEBI CSCRF, and related regional requirements alongside global standards like SOC 2, ISO 27001, and GDPR.',
  },
  {
    id: 'approvals',
    question: 'How do policy approval workflows work?',
    answer:
      'ComplAI supports configurable approval matrices with prepare and review steps. Authors prepare and submit policy versions; designated reviewers approve or reject in sequence. Each employee has a My Approvals inbox for pending actions, with progress tracking and document review built in.',
  },
  {
    id: 'integrations',
    question: 'Can ComplAI connect to our HRMS, IAM, and SIEM tools?',
    answer:
      'ComplAI includes an integrations catalog covering HRMS, IDAM, SIEM, VAPT, and SSO vendors. Each integration links to step-by-step setup guides at propelreadysolutions.in/help/integrations, covering deployment models and capability mapping for evidence collection.',
  },
  {
    id: 'demo',
    question: 'How do I request a demo or speak with Propel Ready Solutions?',
    answer:
      'Visit our Company page and open the contact form with your name, phone, email, and requirements. Our team will respond to discuss ComplAI, GRC advisory, and the frameworks relevant to your business.',
  },
];

export const FRAMEWORK_GUIDES: FrameworkGuide[] = [
  {
    slug: 'soc-2',
    frameworkId: 'soc2-type2',
    title: 'SOC 2 Compliance Hub',
    shortName: 'SOC 2',
    tagline: 'Your starting line for SOC 2 Type II readiness',
    overview:
      'SOC 2 (System and Organization Controls 2) is an attestation framework developed by the AICPA. It evaluates how a service organization manages customer data based on Trust Services Criteria: Security (required), and optionally Availability, Processing Integrity, Confidentiality, and Privacy.',
    whoNeedsIt:
      'SaaS companies, cloud service providers, and technology vendors selling to enterprise customers — especially in North America — when prospects or security questionnaires ask for a SOC 2 report.',
    keyTopics: [
      'Trust Services Criteria (Security, Availability, Confidentiality, Privacy)',
      'Type I vs Type II observation periods',
      'Control environment and access management',
      'Change management and vendor oversight',
      'Evidence collection for auditor testing',
    ],
    auditTimeline:
      'Typical first-time Type II readiness: 3–6 months of preparation plus a 3–12 month observation window, depending on auditor and scope.',
    howComplAIHelps: [
      'Pre-mapped SOC 2 controls with implementation tracking',
      'ISMS policy templates aligned to common SOC 2 control themes',
      'Evidence upload and issue tracking per control',
      'Executive dashboard with framework readiness RAG status',
      'Approval workflows for policy sign-off before audit',
    ],
  },
  {
    slug: 'iso-27001',
    frameworkId: 'iso27001',
    title: 'ISO 27001 Compliance Hub',
    shortName: 'ISO 27001',
    tagline: 'Your guide to getting ISO 27001:2022 ready',
    overview:
      'ISO/IEC 27001:2022 is the international standard for Information Security Management Systems (ISMS). Certification demonstrates a systematic approach to managing sensitive information through risk assessment and a set of Annex A security controls.',
    whoNeedsIt:
      'Organizations seeking globally recognized certification — especially those operating across regions, bidding on regulated contracts, or maturing beyond ad-hoc security practices into a formal ISMS.',
    keyTopics: [
      'ISMS scope and context (Clause 4)',
      'Leadership and policy (Clause 5)',
      'Risk assessment and treatment (Clause 6)',
      'Annex A control set (2022 edition — 93 controls in 4 themes)',
      'Internal audit and management review',
      'Certification audit (Stage 1 and Stage 2)',
    ],
    auditTimeline:
      'Most organizations require 6–12 months to implement an ISMS and pass certification, depending on starting maturity and scope.',
    howComplAIHelps: [
      'Full ISO 27001:2022 framework with mapped controls',
      '100+ Annex A-aligned ISMS policy and procedure templates',
      'Word export and in-app editing for auditor-ready documents',
      'Risk register linked to controls and treatment plans',
      'Multi-stage policy approval matrix',
    ],
  },
  {
    slug: 'gdpr',
    frameworkId: 'gdpr',
    title: 'GDPR Compliance Hub',
    shortName: 'GDPR',
    tagline: 'Privacy compliance for EU personal data',
    overview:
      'The General Data Protection Regulation (GDPR) governs how organizations collect, process, store, and transfer personal data of individuals in the European Union. It emphasizes lawful basis, data subject rights, privacy by design, and accountability.',
    whoNeedsIt:
      'Any organization offering goods or services to EU residents, monitoring their behaviour, or processing EU personal data — regardless of where the company is headquartered.',
    keyTopics: [
      'Lawful basis for processing',
      'Data subject rights (access, erasure, portability)',
      'Data Protection Impact Assessments (DPIA)',
      'Processor agreements and cross-border transfers',
      'Breach notification (72-hour rule)',
      'Records of processing activities (RoPA)',
    ],
    auditTimeline:
      'GDPR is not a certifiable standard but requires ongoing compliance. Supervisory authority investigations can happen at any time; DPIAs and RoPA should be maintained continuously.',
    howComplAIHelps: [
      'GDPR-mapped controls and privacy policy templates',
      'Vendor assessment workflows for processor due diligence',
      'Evidence and documentation tracking for accountability',
      'Cross-mapping with ISO 27701 and ISO 27001 controls',
    ],
  },
  {
    slug: 'hipaa',
    frameworkId: 'hipaa',
    title: 'HIPAA Compliance Hub',
    shortName: 'HIPAA',
    tagline: 'Healthcare data protection in the United States',
    overview:
      'The Health Insurance Portability and Accountability Act (HIPAA) Security Rule sets national standards for protecting electronic protected health information (ePHI). Covered entities and business associates must implement administrative, physical, and technical safeguards.',
    whoNeedsIt:
      'Healthcare providers, health plans, healthcare clearinghouses, and business associates that create, receive, maintain, or transmit ePHI in the United States.',
    keyTopics: [
      'Administrative safeguards (risk analysis, workforce training)',
      'Physical safeguards (facility access, device media controls)',
      'Technical safeguards (access control, audit controls, encryption)',
      'Business Associate Agreements (BAAs)',
      'Breach notification under the HITECH Act',
    ],
    auditTimeline:
      'HIPAA compliance is ongoing. OCR investigations follow complaints or breaches; HITRUST or SOC 2 + HIPAA mappings are common attestation paths for vendors.',
    howComplAIHelps: [
      'HIPAA Security Rule mapped controls',
      'Policy templates for workforce and access management',
      'Vendor risk assessments for business associates',
      'Evidence collection for safeguard implementation',
    ],
  },
  {
    slug: 'pci-dss',
    frameworkId: 'pci-dss',
    title: 'PCI DSS Compliance Hub',
    shortName: 'PCI DSS',
    tagline: 'Payment card data security standard',
    overview:
      'PCI DSS (Payment Card Industry Data Security Standard) v4.0 defines technical and operational requirements for organizations that store, process, or transmit cardholder data. Compliance level depends on transaction volume and acquirer requirements.',
    whoNeedsIt:
      'Merchants, payment processors, and any organization handling payment card data — required by card brands and acquirer agreements.',
    keyTopics: [
      'Network segmentation and firewall configuration',
      'Protecting stored cardholder data',
      'Encryption of transmission across public networks',
      'Access control and authentication',
      'Logging, monitoring, and vulnerability management',
      'SAQ vs ROC assessment types',
    ],
    auditTimeline:
      'Annual validation required (SAQ or ROC depending on level). Initial gap remediation typically takes 2–4 months for Level 1 merchants.',
    howComplAIHelps: [
      'PCI DSS v4.0 control library with evidence tracking',
      'Remediation playbooks for failing controls',
      'Integration catalog for SIEM and vulnerability tools',
      'Executive visibility into open gaps and audit readiness',
    ],
  },
  {
    slug: 'iso-27701',
    frameworkId: 'iso27701',
    title: 'ISO 27701 Privacy Hub',
    shortName: 'ISO 27701',
    tagline: 'Privacy extension to your ISMS',
    overview:
      'ISO/IEC 27701 extends ISO 27001 and ISO 27002 with privacy-specific controls for PII controllers and processors. It provides a certifiable privacy management framework aligned with GDPR and global privacy expectations.',
    whoNeedsIt:
      'Organizations already pursuing or certified to ISO 27001 that need a structured privacy program — especially those processing personal data across multiple jurisdictions.',
    keyTopics: [
      'PII controller vs processor controls',
      'Privacy policy and consent management',
      'PII transfer and sub-processor oversight',
      'Privacy impact assessment alignment',
      'Extension audit to existing ISO 27001 certification',
    ],
    auditTimeline:
      'Often pursued as an extension after ISO 27001; add 2–4 months for privacy control implementation and extension audit.',
    howComplAIHelps: [
      'ISO 27701 mapped controls alongside ISO 27001',
      'Privacy policy templates and DPIA documentation support',
      'Unified control mapping to reduce duplicate evidence',
    ],
  },
];

export function getFrameworkGuide(slug: string): FrameworkGuide | undefined {
  return FRAMEWORK_GUIDES.find((g) => g.slug === slug);
}

export function getAllFrameworkGuideSlugs(): string[] {
  return FRAMEWORK_GUIDES.map((g) => g.slug);
}

export const MARKETING_SOLUTIONS = [
  {
    id: 'compliance',
    title: 'Simplify compliance',
    description:
      'Get and stay compliant across SOC 2, ISO 27001, GDPR, HIPAA, PCI DSS, and regional frameworks — with pre-mapped controls and clear implementation guidance.',
    href: '/solutions#compliance',
  },
  {
    id: 'audits',
    title: 'Streamline audits',
    description:
      'Track evidence, policy approvals, and control status in one place. Export auditor-ready Word documents and breeze through internal and external reviews.',
    href: '/solutions#audits',
  },
  {
    id: 'policies',
    title: 'Policy & ISMS management',
    description:
      '100+ ISO 27001 Annex A templates, multi-stage approval workflows, My Approvals inbox, and in-app editing with Word export.',
    href: '/solutions#policies',
  },
  {
    id: 'risk',
    title: 'Monitor cyber risk',
    description:
      'Maintain a living risk register with scoring and treatment status, linked to controls and surfaced on the leadership dashboard.',
    href: '/solutions#risk',
  },
  {
    id: 'vendors',
    title: 'Assess third-party risk',
    description:
      'Track vendor assessments, due diligence status, and compliance posture alongside your internal control program.',
    href: '/solutions#vendors',
  },
  {
    id: 'integrations',
    title: 'Integrate your tech stack',
    description:
      'Connect HRMS, IAM, SIEM, VAPT, and SSO tools with setup guides for automated evidence and continuous monitoring.',
    href: '/platform#integrations',
  },
  {
    id: 'intelligence',
    title: 'AI-powered GRC',
    description:
      'Gap analysis, security questionnaires, remediation guidance, and SecOps intelligence — embedded in the platform.',
    href: '/solutions#intelligence',
  },
  {
    id: 'dashboard',
    title: 'Leadership visibility',
    description:
      'CISO and CIO dashboard with RAG status by domain, framework readiness, risk summary, and prioritized actions.',
    href: '/solutions#dashboard',
  },
];
