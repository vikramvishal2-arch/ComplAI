import type { IntegrationDomain, IntegrationDeployment, IntegrationTool } from './integration-catalog';
import { INTEGRATION_DOMAINS } from './integration-catalog';
import { ORGANIZATION_NAME, PRODUCT_NAME } from '../brand';

export interface IntegrationGuideStep {
  title: string;
  description: string;
  substeps?: string[];
}

export interface IntegrationGuide {
  toolId: string;
  toolName: string;
  primaryDomain: IntegrationDomain;
  domains: IntegrationDomain[];
  overview: string;
  productDescription: string;
  deployment: IntegrationDeployment;
  deploymentLabel: string;
  deploymentSummary: string;
  domainLabels: string[];
  capabilities: string[];
  typicalUseCases: string[];
  integrationMethods: string[];
  grcDataPoints: string[];
  documentationTopics: string[];
  prerequisites: string[];
  steps: IntegrationGuideStep[];
  grcBenefits: string[];
  relatedControls: string[];
  verificationChecklist: string[];
  troubleshooting: { issue: string; resolution: string }[];
  lastUpdated: string;
}

const DEPLOYMENT_LABEL: Record<IntegrationDeployment, string> = {
  saas: 'SaaS (cloud)',
  'on-prem': 'On-premises',
  hybrid: 'Hybrid',
  'open-source': 'Open source',
};

const DEPLOYMENT_SUMMARY: Record<IntegrationDeployment, string> = {
  saas: 'Fully managed cloud service — no infrastructure to host. Typically connected via REST APIs, OAuth, or webhooks over HTTPS.',
  'on-prem': 'Installed in your data centre or private cloud. May require an on-network connector, agent, or VPN for ComplAI to reach APIs.',
  hybrid: 'Available as cloud and/or self-hosted components. Confirm which deployment model your organization uses before planning credentials and network paths.',
  'open-source': 'Community or self-supported software. Define internal ownership for patching, upgrades, and security monitoring.',
};

const DOMAIN_USE_CASES: Record<IntegrationDomain, string[]> = {
  hrms: [
    'Authoritative employee records for joiner, mover, and leaver (JML) workflows',
    'Org hierarchy and manager relationships for access approvals',
    'Termination and contractor end dates driving account deprovisioning',
    'Workforce compliance reporting for HR and security audits',
  ],
  idam: [
    'Central directory for users, groups, roles, and entitlements',
    'MFA enforcement and authentication policy evidence',
    'Privileged access management and session audit trails',
    'Access review and certification campaign data',
  ],
  siem: [
    'Centralized log ingestion and retention for security monitoring',
    'Detection rules, alerts, and SOC case management metrics',
    'Incident triage, escalation, and response timelines',
    'Compliance reporting on monitoring coverage and MTTR',
  ],
  vapt: [
    'Vulnerability scanning across infrastructure and applications',
    'Penetration test findings and remediation tracking',
    'Exposure prioritization and risk-based remediation SLAs',
    'Audit evidence for vulnerability management programs',
  ],
  sso: [
    'Federated single sign-on for SaaS and internal applications',
    'Application access inventory for periodic access reviews',
    'MFA and session policies enforced at the identity provider',
    'SAML/OIDC federation metadata and attribute mapping',
  ],
};

const DOMAIN_INTEGRATION_METHODS: Record<IntegrationDomain, string[]> = {
  hrms: ['REST API with OAuth or API keys', 'SCIM outbound provisioning', 'Scheduled CSV/SFTP exports', 'Webhook event notifications'],
  idam: ['REST or Graph API (read-only scopes)', 'SCIM provisioning logs', 'Syslog or SIEM export of auth events', 'CSV entitlement reports'],
  siem: ['REST API for searches and dashboards', 'Webhook or email alert forwarding', 'Scheduled report exports', 'SOAR playbook status APIs'],
  vapt: ['Scanner or platform REST API', 'Scheduled scan result exports', 'Ticketing system webhooks', 'PDF/CSV assessment report upload'],
  sso: ['SAML/OIDC metadata exchange', 'IdP admin API for app assignments', 'SCIM app provisioning logs', 'Access report exports'],
};

const DOMAIN_GRC_DATA: Record<IntegrationDomain, string[]> = {
  hrms: ['Employee status and termination dates', 'Department and role changes', 'Manager approval chains', 'Integration sync audit logs'],
  idam: ['User and group inventory', 'MFA enrollment status', 'Sign-in and privileged access logs', 'Access review completion rates'],
  siem: ['Log source health and ingestion volume', 'Detection rule coverage', 'Open and closed incident counts', 'Mean time to detect/respond'],
  vapt: ['Open findings by severity', 'Scan coverage and frequency', 'Remediation SLA compliance', 'Penetration test summaries'],
  sso: ['Federated application catalog', 'User-to-app assignments', 'MFA policy compliance', 'Failed authentication trends'],
};

const DOMAIN_GRC_BENEFITS: Record<IntegrationDomain, string[]> = {
  hrms: [
    'Automated joiner/mover/leaver feeds for access provisioning and deprovisioning',
    'Evidence for ISO 27001 A.5.15–A.5.18 and SOC 2 CC6.2 personnel controls',
    'Audit trail linking HR termination dates to IAM account disablement',
  ],
  idam: [
    'Centralized identity evidence for access control and privileged access audits',
    'MFA, lifecycle, and access review metrics mapped to ISO Annex A.5 and A.8',
    'Continuous control monitoring for authentication and authorization policies',
  ],
  siem: [
    'Log retention and monitoring evidence for A.8.15–A.8.16 and SOC 2 CC7.2',
    'Incident detection and response workflow integration',
    'SOC metrics and detection coverage for leadership dashboards',
  ],
  vapt: [
    'Vulnerability scan results and remediation SLAs for risk treatment',
    'Penetration test evidence for external assessment requirements',
    'Continuous exposure management aligned to ISO 27001 risk treatment (Clause 6)',
  ],
  sso: [
    'Federated authentication evidence for access control policies',
    'Reduced password sprawl and enforced MFA at the identity provider',
    'Application access inventory for access reviews and SOC 2 CC6.1',
  ],
};

const DOMAIN_RELATED_CONTROLS: Record<IntegrationDomain, string[]> = {
  hrms: ['ISO A.5.15', 'ISO A.5.16', 'ISO A.5.17', 'ISO A.5.18', 'SOC 2 CC6.2'],
  idam: ['ISO A.5.15', 'ISO A.5.16', 'ISO A.5.17', 'ISO A.5.18', 'ISO A.8.2', 'ISO A.8.5', 'SOC 2 CC6.1–CC6.3'],
  siem: ['ISO A.8.15', 'ISO A.8.16', 'ISO A.5.24–A.5.28', 'SOC 2 CC7.2', 'SOC 2 CC7.3'],
  vapt: ['ISO A.8.8', 'ISO A.5.7', 'ISO 8.1', 'SOC 2 CC7.1', 'SOC 2 CC4.1'],
  sso: ['ISO A.5.15', 'ISO A.5.16', 'ISO A.8.5', 'SOC 2 CC6.1', 'SOC 2 CC6.6'],
};

const DOMAIN_STEPS: Record<IntegrationDomain, IntegrationGuideStep[]> = {
  hrms: [
    {
      title: 'Define scope and data contract',
      description:
        'Identify which HR events (hire, transfer, termination, contractor end) must sync to identity and access systems.',
      substeps: [
        'Document authoritative HR source fields (employee ID, department, manager, status, last day)',
        'Agree retention and privacy classification for HR data in transit',
        'Map events to IAM provisioning actions in ComplAI',
      ],
    },
    {
      title: 'Configure API or file integration',
      description:
        'Establish a secure connection from the HRMS to ComplAI or your IAM middleware using vendor-supported APIs, SCIM, or scheduled SFTP.',
      substeps: [
        'Create a dedicated integration service account with least privilege',
        'Enable audit logging on the integration account',
        'Configure IP allowlists or OAuth client credentials as required',
      ],
    },
    {
      title: 'Validate joiner/mover/leaver workflows',
      description:
        'Run test employees through hire, role change, and termination scenarios and confirm downstream access changes within SLA.',
    },
    {
      title: 'Enable monitoring and evidence collection',
      description:
        'Schedule daily sync health checks and store integration run logs as compliance evidence in ComplAI.',
    },
  ],
  idam: [
    {
      title: 'Register the identity provider in ComplAI',
      description:
        'Add the IDAM platform as a connected integration and record the tenant URL, admin contact, and environment (prod/test).',
    },
    {
      title: 'Configure read-only API access',
      description:
        'Create API credentials or OAuth application with read scopes for users, groups, roles, MFA status, and sign-in logs.',
      substeps: [
        'Restrict credentials to read-only where possible',
        'Store secrets in your corporate vault — never in ComplAI plaintext fields',
        'Set credential rotation schedule (90 days recommended)',
      ],
    },
    {
      title: 'Map identity objects to controls',
      description:
        'Link MFA enforcement, privileged roles, and access review policies to ISO/SOC controls in the ComplAI control library.',
    },
    {
      title: 'Run initial sync and reconcile',
      description:
        'Import user/group inventory, resolve duplicates, and baseline access state before enabling continuous monitoring.',
    },
  ],
  siem: [
    {
      title: 'Identify log sources and parsing requirements',
      description:
        'Inventory systems whose logs must reach the SIEM (IdP, EDR, cloud audit, firewalls, applications) and confirm parsing/normalization.',
    },
    {
      title: 'Connect ComplAI to SIEM export or API',
      description:
        'Configure API keys or webhook forwarding so ComplAI can read detection metrics, case status, and log ingestion health.',
      substeps: [
        'Enable read access to dashboards or saved searches for control evidence',
        'Document retention periods aligned to policy (typically 12+ months)',
        'Validate timezone and timestamp normalization (UTC recommended)',
      ],
    },
    {
      title: 'Align detections to control objectives',
      description:
        'Map critical detection rules to ISO A.8.15/A.8.16 and incident response procedures.',
    },
    {
      title: 'Establish SOC runbooks',
      description:
        'Document triage, escalation, and closure steps; store runbook links in ComplAI control evidence.',
    },
  ],
  vapt: [
    {
      title: 'Define assessment scope',
      description:
        'Document in-scope assets, environments (prod/staging), and testing windows approved by change management.',
    },
    {
      title: 'Connect scanner or PT platform API',
      description:
        'Integrate vulnerability or pentest platform to pull findings, severity, CVSS, and remediation status into ComplAI.',
      substeps: [
        'Use read-only API tokens scoped to relevant business units',
        'Configure finding severity thresholds for risk register auto-ticket rules',
        'Exclude credentials from scan configs stored in ComplAI',
      ],
    },
    {
      title: 'Set remediation SLAs',
      description:
        'Map critical/high/medium findings to remediation timelines per your Vulnerability Management Policy.',
    },
    {
      title: 'Export evidence for audits',
      description:
        'Schedule monthly exports of scan coverage, mean-time-to-remediate, and open critical findings.',
    },
  ],
  sso: [
    {
      title: 'Inventory federated applications',
      description:
        'List all SaaS and internal apps using SSO; record SAML/OIDC metadata URLs and attribute mappings.',
    },
    {
      title: 'Configure SSO federation metadata',
      description:
        'Exchange IdP/SP metadata with application owners and enforce MFA at the identity provider for all SSO apps.',
      substeps: [
        'Validate NameID / subject mapping for each application',
        'Disable local accounts where SSO is mandatory',
        'Configure session timeout and re-authentication for sensitive apps',
      ],
    },
    {
      title: 'Connect ComplAI for access evidence',
      description:
        'Pull application assignment reports from the SSO/IdP platform to support access reviews.',
    },
    {
      title: 'Test failover and break-glass',
      description:
        'Document emergency access procedures and test break-glass accounts quarterly.',
    },
  ],
};

const COMMON_PREREQUISITES = [
  `Named integration owner and backup contact at ${ORGANIZATION_NAME}`,
  `Change request approved per ${ORGANIZATION_NAME} change management policy`,
  'Network egress allowlisting completed if required by vendor',
  `${PRODUCT_NAME} organization administrator access`,
];

export function buildIntegrationGuide(tool: IntegrationTool): IntegrationGuide {
  const primaryDomain = tool.domains[0];
  const domainSteps = DOMAIN_STEPS[primaryDomain] ?? DOMAIN_STEPS.idam;
  const domainLabels = tool.domains.map(
    (id) => INTEGRATION_DOMAINS.find((d) => d.id === id)?.label ?? id.toUpperCase()
  );

  const documentationTopics = [
    'Admin console setup and service account creation',
    'API authentication, scopes, and rate limits',
    ...(tool.docsUrl ? ['Product API reference and integration guides'] : []),
    'Audit log export and retention settings',
    'Security hardening and least-privilege configuration',
  ];

  return {
    toolId: tool.id,
    toolName: tool.name,
    primaryDomain,
    domains: tool.domains,
    productDescription: tool.description,
    deployment: tool.deployment,
    deploymentLabel: DEPLOYMENT_LABEL[tool.deployment],
    deploymentSummary: DEPLOYMENT_SUMMARY[tool.deployment],
    domainLabels,
    capabilities: tool.capabilities,
    typicalUseCases: [
      ...DOMAIN_USE_CASES[primaryDomain].slice(0, 2),
      ...tool.domains.slice(1).flatMap((d) => DOMAIN_USE_CASES[d].slice(0, 1)),
    ],
    integrationMethods: DOMAIN_INTEGRATION_METHODS[primaryDomain],
    grcDataPoints: [
      ...DOMAIN_GRC_DATA[primaryDomain],
      ...tool.capabilities.slice(0, 2).map((cap) => `${cap} metrics and configuration evidence`),
    ],
    documentationTopics,
    overview: `${tool.name} integrates with ${PRODUCT_NAME} to support ${ORGANIZATION_NAME}'s GRC program. ${tool.description} This guide covers product context, the recommended connection process, prerequisites, and verification steps for audit-ready evidence collection.`,
    prerequisites: [
      ...COMMON_PREREQUISITES,
      `Admin or integration-builder role in ${tool.name}`,
      `${tool.name} product documentation reviewed (see Documentation topics below)`,
      ...(tool.deployment === 'on-prem'
        ? ['On-premises connector or agent deployed in approved network zone']
        : []),
      ...(tool.deployment === 'open-source'
        ? ['Internal support model defined for open-source components']
        : []),
    ],
    steps: [
      {
        title: `Plan ${tool.name} integration scope`,
        description: `Confirm which ${tool.capabilities.slice(0, 2).join(' and ')} capabilities will be connected first. Start with read-only ingestion before enabling write actions.`,
      },
      ...domainSteps,
      {
        title: 'Mark integration complete in ComplAI',
        description:
          'Update integration status to Connected, attach configuration evidence, and link mapped controls in the Controls library.',
      },
    ],
    grcBenefits: [
      ...DOMAIN_GRC_BENEFITS[primaryDomain],
      ...tool.domains
        .slice(1)
        .flatMap((d) => DOMAIN_GRC_BENEFITS[d].slice(0, 1)),
    ],
    relatedControls: [
      ...new Set([
        ...DOMAIN_RELATED_CONTROLS[primaryDomain],
        ...tool.domains.slice(1).flatMap((d) => DOMAIN_RELATED_CONTROLS[d].slice(0, 2)),
      ]),
    ],
    verificationChecklist: [
      'Integration credentials stored securely and rotation scheduled',
      'Test sync completed successfully with sample records',
      'Error alerting configured for failed sync or API rate limits',
      'Control mappings documented in ComplAI',
      'Evidence sample exported and reviewed by control owner',
      'Runbook link attached to related controls',
    ],
    troubleshooting: [
      {
        issue: 'Authentication or API permission errors',
        resolution:
          'Verify API scopes, token expiry, and service account status in the vendor admin console. Regenerate credentials if needed.',
      },
      {
        issue: 'Partial or stale data in ComplAI',
        resolution:
          'Check sync schedule, pagination limits, and filter rules. Run a full reconciliation sync after correcting configuration.',
      },
      {
        issue: 'Network connectivity failures',
        resolution:
          'Confirm firewall egress rules, proxy settings, and IP allowlists on both sides of the integration.',
      },
    ],
    lastUpdated: '2026-06-24',
  };
}

export function getIntegrationGuide(toolId: string, tools: IntegrationTool[]): IntegrationGuide | null {
  const tool = tools.find((t) => t.id === toolId);
  if (!tool) return null;
  return buildIntegrationGuide(tool);
}
