import {
  COMPLIANCE_METHOD_LABELS,
  DOMAIN_LABELS,
  type ComplianceMethod,
  type Control,
  type ControlDomain,
} from '@/lib/types';

export type ComplianceRecommendation = {
  title: string;
  detail: string;
};

export type ControlComplianceGuidance = {
  summary: string;
  detailedDescription: string;
  whyItMatters: string;
  recommendedMethods: {
    method: ComplianceMethod;
    label: string;
    recommendation: string;
  }[];
  steps: ComplianceRecommendation[];
  evidence: string[];
  auditorFocus: string[];
};

const METHOD_RECOMMENDATIONS: Record<ComplianceMethod, string> = {
  policy:
    'Publish an approved policy that states the requirement, ownership, scope, and review cadence. Map the policy to this control reference.',
  procedure:
    'Document a step-by-step operating procedure covering who does what, when, and how exceptions are handled.',
  technical_control:
    'Implement and configure a technical safeguard (tooling, configuration baseline, or system control) that enforces the requirement.',
  manual_process:
    'Define a repeatable manual workflow with checklists, approvals, and retention of completed records.',
  automated_monitoring:
    'Enable continuous monitoring/alerting and retain logs that prove the control is operating as intended.',
  third_party_attestation:
    'Obtain and review an independent attestation (e.g. SOC 2, ISO certificate, pen-test report) covering this requirement.',
  training_awareness:
    'Deliver role-based training, track completion, and retain attendance or LMS evidence.',
  contractual:
    'Capture the obligation in contracts, DPAs, or SLAs and verify flow-down to relevant vendors.',
  custom:
    'Document a custom compensating approach with risk acceptance and residual risk treatment.',
  not_applicable:
    'Document a clear N/A justification with scope rationale and management approval.',
};

const DOMAIN_WHY: Record<ControlDomain, string> = {
  access_control:
    'Weak access control is a leading cause of breaches and audit findings. Auditors expect least privilege, MFA, and periodic access reviews.',
  asset_management:
    'You cannot protect what you cannot inventory. Auditors look for complete asset ownership, classification, and lifecycle tracking.',
  audit_logging:
    'Logs prove control operation and support investigations. Auditors expect retention, integrity protection, and review evidence.',
  business_continuity:
    'Resilience requirements protect critical services. Auditors expect BIA, RTO/RPO, tested recovery, and documented plans.',
  change_management:
    'Uncontrolled change introduces risk. Auditors expect approvals, testing, rollback, and change records.',
  cryptography:
    'Encryption protects confidentiality and integrity. Auditors expect key management, algorithm standards, and coverage of sensitive data.',
  data_protection:
    'Privacy and data-handling obligations are high scrutiny. Auditors expect lawful processing, retention, and subject-rights evidence.',
  governance:
    'Governance shows management accountability. Auditors expect policies, roles, oversight forums, and decision records.',
  human_resources:
    'People risk is material. Auditors expect screening, onboarding/offboarding, and security awareness evidence.',
  incident_response:
    'Response readiness limits impact. Auditors expect playbooks, roles, notification timelines, and post-incident reviews.',
  network_security:
    'Network exposure is a common attack path. Auditors expect segmentation, perimeter controls, and secure remote access.',
  physical_security:
    'Physical access can bypass digital controls. Auditors expect facility controls, visitor logs, and media handling.',
  risk_management:
    'Risk-based decisions justify control investment. Auditors expect assessments, treatment plans, and residual risk acceptance.',
  vendor_management:
    'Third parties extend your attack surface. Auditors expect due diligence, contracts, and ongoing monitoring.',
  vulnerability_management:
    'Unpatched systems are frequently exploited. Auditors expect scanning, prioritization, and remediation SLAs.',
  other:
    'This control supports overall compliance posture. Document ownership, operating evidence, and periodic review.',
};

const DOMAIN_EVIDENCE: Record<ControlDomain, string[]> = {
  access_control: [
    'Access control policy and RBAC matrix',
    'MFA enforcement screenshots or IdP reports',
    'Quarterly access review sign-off',
    'Privileged account inventory and PAM logs',
  ],
  asset_management: [
    'Asset inventory export with owners',
    'Classification labels and handling standard',
    'Onboarding/decommission checklist samples',
  ],
  audit_logging: [
    'Logging standard and retention configuration',
    'SIEM use-case list and sample alerts',
    'Log integrity / immutability evidence',
  ],
  business_continuity: [
    'BIA and RTO/RPO register',
    'BCP/DR plan and last test report',
    'Backup restore test evidence',
  ],
  change_management: [
    'Change policy and CAB minutes',
    'Sample change tickets with approvals and rollback',
    'Release / deployment records',
  ],
  cryptography: [
    'Cryptography / key management standard',
    'TLS and encryption-at-rest configuration evidence',
    'Key rotation records',
  ],
  data_protection: [
    'Privacy notice / RoPA excerpts',
    'Retention and deletion evidence',
    'DSAR workflow samples',
  ],
  governance: [
    'Approved policy and ownership RACI',
    'Management review minutes',
    'Control mapping to this framework reference',
  ],
  human_resources: [
    'Background check / onboarding checklist',
    'Security awareness completion report',
    'Offboarding access revocation evidence',
  ],
  incident_response: [
    'IR plan and playbooks',
    'Tabletop exercise report',
    'Incident tickets and post-incident reviews',
  ],
  network_security: [
    'Network diagram and segmentation evidence',
    'Firewall / WAF rule reviews',
    'VPN / remote access configuration',
  ],
  physical_security: [
    'Facility access policy',
    'Badge / visitor logs',
    'Secure media disposal certificates',
  ],
  risk_management: [
    'Risk assessment methodology',
    'Risk register entries linked to this control',
    'Treatment plans and residual risk acceptance',
  ],
  vendor_management: [
    'Vendor risk assessment / questionnaire',
    'Contract security schedule or DPA',
    'Ongoing monitoring / review records',
  ],
  vulnerability_management: [
    'Vulnerability scan reports',
    'Patch SLA metrics and exception register',
    'Remediation tickets for critical findings',
  ],
  other: [
    'Approved procedure covering this control',
    'Operating evidence for the last review period',
    'Owner attestation or management sign-off',
  ],
};

function expandDescription(control: Control): string {
  const domain = DOMAIN_LABELS[control.domain];
  const methods = control.suggestedMethods
    .filter((m) => m !== 'not_applicable')
    .map((m) => COMPLIANCE_METHOD_LABELS[m])
    .join(', ');

  return [
    control.description.trim(),
    '',
    `This control sits in the ${domain} domain and is typically demonstrated through: ${methods || 'documented process and operating evidence'}.`,
    control.guidance?.trim()
      ? `Framework guidance for this control: ${control.guidance.trim()}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function buildSteps(control: Control): ComplianceRecommendation[] {
  const methods = control.suggestedMethods.filter((m) => m !== 'not_applicable');
  const primary = methods[0];

  return [
    {
      title: 'Confirm applicability and ownership',
      detail: `Confirm the control applies to your environment, assign an owner for ${DOMAIN_LABELS[control.domain]}, and record the framework reference ${control.reference}.`,
    },
    {
      title: 'Select a primary compliance method',
      detail: primary
        ? `Start with ${COMPLIANCE_METHOD_LABELS[primary]} as the primary method, then layer supporting methods where needed.`
        : 'Choose the compliance method that best matches how your organization operates this control.',
    },
    {
      title: 'Implement the control',
      detail:
        control.guidance?.trim() ||
        `Implement safeguards that fully address: ${control.title}. Cover people, process, and technology as applicable.`,
    },
    {
      title: 'Collect operating evidence',
      detail:
        'Retain artifacts that prove design and operating effectiveness for the current audit period (policies, tickets, configs, logs, attestations).',
    },
    {
      title: 'Review and mark audit-ready',
      detail:
        'Perform a periodic effectiveness review, close related issues/risks, upload evidence, and update the compliance plan narrative.',
    },
  ];
}

export function buildControlComplianceGuidance(control: Control): ControlComplianceGuidance {
  const methods = (control.suggestedMethods.length
    ? control.suggestedMethods
    : (['policy', 'procedure', 'technical_control'] as ComplianceMethod[])
  ).filter((m) => m !== 'not_applicable');

  return {
    summary: control.description,
    detailedDescription: expandDescription(control),
    whyItMatters: DOMAIN_WHY[control.domain],
    recommendedMethods: methods.map((method) => ({
      method,
      label: COMPLIANCE_METHOD_LABELS[method],
      recommendation: METHOD_RECOMMENDATIONS[method],
    })),
    steps: buildSteps(control),
    evidence: DOMAIN_EVIDENCE[control.domain],
    auditorFocus: [
      `Requirement coverage for ${control.reference} — ${control.title}`,
      'Named owner and current compliance status',
      'Evidence that the control operated during the review period',
      'Treatment of related open risks or issues before audit-ready status',
    ],
  };
}
