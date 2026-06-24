import type { Control, ControlDomain, RemediationPlaybookLink } from '../types';

const DOMAIN_PLAYBOOKS: Record<ControlDomain, RemediationPlaybookLink[]> = {
  access_control: [
    {
      id: 'ac-rbac',
      title: 'Implement RBAC and least privilege',
      description: 'Define roles, assign minimum permissions, and document access matrix.',
      url: 'https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final',
      linkLabel: 'NIST AC controls reference',
      category: 'Access Control',
    },
    {
      id: 'ac-mfa',
      title: 'Enforce MFA for all users',
      description: 'Require phishing-resistant MFA for workforce and privileged accounts.',
      url: 'https://www.cisa.gov/resources-tools/resources/multi-factor-authentication',
      linkLabel: 'CISA MFA guidance',
      category: 'Access Control',
    },
    {
      id: 'ac-jml',
      title: 'Joiner-Mover-Leaver process',
      description: 'Automate provisioning and deprovisioning tied to HRIS events.',
      url: 'https://learn.microsoft.com/en-us/security/zero-trust/deploy/identity',
      linkLabel: 'Zero Trust identity deployment',
      category: 'Access Control',
    },
    {
      id: 'ac-review',
      title: 'Quarterly access recertification',
      description: 'Managers review and attest user access; revoke stale permissions.',
      url: 'https://www.soc2certification.com/soc-2-access-control-requirements',
      linkLabel: 'SOC 2 access review guide',
      category: 'Access Control',
    },
  ],
  audit_logging: [
    {
      id: 'log-central',
      title: 'Centralize audit logging',
      description: 'Aggregate logs from apps, IdP, and infrastructure into SIEM.',
      url: 'https://www.cisecurity.org/controls/cis-controls-list',
      linkLabel: 'CIS Control 8 — Audit log management',
      category: 'Logging',
    },
  ],
  vulnerability_management: [
    {
      id: 'vuln-scan',
      title: 'Vulnerability scanning program',
      description: 'Run authenticated scans and remediate by severity SLA.',
      url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',
      linkLabel: 'CISA KEV catalog',
      category: 'Vulnerability',
    },
  ],
  incident_response: [
    {
      id: 'ir-plan',
      title: 'Incident response plan',
      description: 'Document IR phases, roles, and communication templates.',
      url: 'https://www.nist.gov/publications/computer-security-incident-handling-guide',
      linkLabel: 'NIST SP 800-61',
      category: 'Incident Response',
    },
  ],
  data_protection: [
    {
      id: 'dp-encrypt',
      title: 'Encrypt data at rest and in transit',
      description: 'Apply TLS 1.2+ and AES-256 for sensitive data stores.',
      url: 'https://www.nist.gov/publications/guideline-sp-800-175b-guideline-using-cryptographic-standards-federal-government',
      linkLabel: 'NIST crypto guidelines',
      category: 'Data Protection',
    },
  ],
  governance: [],
  asset_management: [],
  business_continuity: [],
  change_management: [],
  cryptography: [],
  human_resources: [],
  network_security: [],
  physical_security: [],
  risk_management: [],
  vendor_management: [],
  other: [],
};

const CONTROL_SPECIFIC: Record<string, RemediationPlaybookLink[]> = {
  'soc2-cc6-1': [
    {
      id: 'soc2-cc6-1-okta',
      title: 'Configure Okta RBAC groups',
      description: 'Map application roles to least-privilege Okta groups.',
      url: 'https://help.okta.com/oie/en-us/content/topics/users-groups-profiles/usgp-group-rules.htm',
      linkLabel: 'Okta group rules',
      category: 'Okta',
    },
    {
      id: 'soc2-cc6-1-aws',
      title: 'Review AWS IAM policies',
      description: 'Remove wildcard permissions; enforce permission boundaries.',
      url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_job-functions.html',
      linkLabel: 'AWS job function policies',
      category: 'AWS IAM',
    },
  ],
  'soc2-cc6-5': [
    {
      id: 'soc2-cc6-5-mfa',
      title: 'Enable MFA policy in IdP',
      description: 'Require MFA for all users; block access without enrollment.',
      url: 'https://help.okta.com/oie/en-us/content/topics/security/mfa/multifactor-authentication-policy.htm',
      linkLabel: 'Okta MFA policy',
      category: 'MFA',
    },
  ],
  'soc2-cc6-2': [
    {
      id: 'soc2-cc6-2-prov',
      title: 'Formal access provisioning workflow',
      description: 'Ticket-based approval before IdP group assignment.',
      url: 'https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-external-users',
      linkLabel: 'Entra entitlement management',
      category: 'Provisioning',
    },
  ],
  'soc2-cc6-3': [
    {
      id: 'soc2-cc6-3-deprov',
      title: 'Automated deprovisioning',
      description: 'Disable accounts within 24h of termination via HRIS integration.',
      url: 'https://help.okta.com/oie/en-us/content/topics/users-groups-profiles/usgp-lifecycle-main.htm',
      linkLabel: 'Okta lifecycle management',
      category: 'Deprovisioning',
    },
  ],
  'iso-a5-15': [
    {
      id: 'iso-a5-15-policy',
      title: 'Publish access control policy',
      description: 'Document physical and logical access rules; get management approval.',
      url: 'https://www.iso27001security.com/html/27001.html',
      linkLabel: 'ISO 27001 access control overview',
      category: 'Policy',
    },
  ],
  'iso-a5-18': [
    {
      id: 'iso-a5-18-review',
      title: 'Schedule access reviews',
      description: 'Quarterly recertification for all privileged and standard accounts.',
      url: 'https://learn.microsoft.com/en-us/entra/id-governance/access-reviews-overview',
      linkLabel: 'Entra access reviews',
      category: 'Access Review',
    },
  ],
  'iso-a8-2': [
    {
      id: 'iso-a8-2-pam',
      title: 'Deploy PAM for privileged access',
      description: 'Just-in-time elevation with session logging.',
      url: 'https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure',
      linkLabel: 'Configure Privileged Identity Management',
      category: 'PAM',
    },
  ],
};

const DEFAULT_PLAYBOOKS: RemediationPlaybookLink[] = [
  {
    id: 'default-policy',
    title: 'Document control in security policy',
    description: 'Update relevant policy/SOP and obtain management sign-off.',
    url: 'https://www.sans.org/white-papers/2235/',
    linkLabel: 'SANS policy writing guide',
    category: 'General',
  },
  {
    id: 'default-evidence',
    title: 'Collect audit evidence',
    description: 'Gather screenshots, exports, or logs demonstrating control operation.',
    url: 'https://www.aicpa.org/resources/article/soc-2-evidence-collection-best-practices',
    linkLabel: 'SOC 2 evidence best practices',
    category: 'General',
  },
];

export function getRemediationPlaybook(control: Control): RemediationPlaybookLink[] {
  const specific = CONTROL_SPECIFIC[control.id] ?? [];
  const domain = DOMAIN_PLAYBOOKS[control.domain] ?? [];
  const combined = [...specific, ...domain, ...DEFAULT_PLAYBOOKS];
  const seen = new Set<string>();
  return combined.filter((link) => {
    if (seen.has(link.id)) return false;
    seen.add(link.id);
    return true;
  });
}

export function isAccessControlDomain(domain: ControlDomain): boolean {
  return domain === 'access_control';
}
