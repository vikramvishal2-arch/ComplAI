import { integrationHelpGuidePath, integrationHelpGuideUrl } from '../brand';

export type IntegrationDomain = 'hrms' | 'idam' | 'siem' | 'vapt' | 'sso';

export type IntegrationDeployment = 'saas' | 'on-prem' | 'hybrid' | 'open-source';

export interface IntegrationDomainMeta {
  id: IntegrationDomain;
  label: string;
  description: string;
}

export interface IntegrationTool {
  id: string;
  name: string;
  domains: IntegrationDomain[];
  description: string;
  websiteUrl: string;
  docsUrl?: string;
  deployment: IntegrationDeployment;
  capabilities: string[];
  helpGuidePath: string;
  helpGuideUrl: string;
}

export const INTEGRATION_DOMAINS: IntegrationDomainMeta[] = [
  {
    id: 'hrms',
    label: 'HRMS',
    description: 'Human resource management — hire-to-retire lifecycle, org data, and offboarding feeds for access control.',
  },
  {
    id: 'idam',
    label: 'IDAM',
    description: 'Identity and access management — directories, provisioning, MFA, PAM, and governance.',
  },
  {
    id: 'siem',
    label: 'SIEM',
    description: 'Security information and event management — log ingestion, detection, investigation, and SOC workflows.',
  },
  {
    id: 'vapt',
    label: 'VAPT',
    description: 'Vulnerability assessment and penetration testing — scanning, DAST/SAST, and offensive security.',
  },
  {
    id: 'sso',
    label: 'SSO',
    description: 'Single sign-on and federation — SAML, OIDC, passwordless, and application access.',
  },
];

function withHelpLinks(tool: Omit<IntegrationTool, 'helpGuidePath' | 'helpGuideUrl'>): IntegrationTool {
  return {
    ...tool,
    helpGuidePath: integrationHelpGuidePath(tool.id),
    helpGuideUrl: integrationHelpGuideUrl(tool.id),
  };
}

const INTEGRATION_TOOLS_RAW: Omit<IntegrationTool, 'helpGuidePath' | 'helpGuideUrl'>[] = [
  // ── HRMS ──
  { id: 'workday', name: 'Workday', domains: ['hrms'], description: 'Enterprise cloud HCM for core HR, payroll, and workforce planning.', websiteUrl: 'https://www.workday.com', docsUrl: 'https://doc.workday.com', deployment: 'saas', capabilities: ['Employee records', 'Org hierarchy', 'Termination workflows', 'API provisioning feeds'] },
  { id: 'sap-successfactors', name: 'SAP SuccessFactors', domains: ['hrms'], description: 'SAP cloud suite for talent, performance, and employee central.', websiteUrl: 'https://www.sap.com/products/hcm.html', deployment: 'saas', capabilities: ['Employee central', 'Onboarding', 'SCIM provisioning', 'Audit exports'] },
  { id: 'oracle-hcm', name: 'Oracle Fusion Cloud HCM', domains: ['hrms'], description: 'Oracle cloud human capital management and payroll.', websiteUrl: 'https://www.oracle.com/human-capital-management/', deployment: 'saas', capabilities: ['Global HR', 'Payroll', 'HCM analytics', 'Integration with IAM'] },
  { id: 'adp-workforce', name: 'ADP Workforce Now', domains: ['hrms'], description: 'Payroll and HR platform for mid-market and enterprise.', websiteUrl: 'https://www.adp.com/solutions/products/workforce-now.aspx', deployment: 'saas', capabilities: ['Payroll', 'Time & attendance', 'Offboarding triggers', 'Reporting'] },
  { id: 'bamboohr', name: 'BambooHR', domains: ['hrms'], description: 'SMB-focused HRIS with applicant tracking and e-signatures.', websiteUrl: 'https://www.bamboohr.com', deployment: 'saas', capabilities: ['Employee database', 'PTO tracking', 'Onboarding checklists', 'Webhooks'] },
  { id: 'rippling', name: 'Rippling', domains: ['hrms', 'idam'], description: 'Unified HR, IT, and app provisioning from hire to retire.', websiteUrl: 'https://www.rippling.com', deployment: 'saas', capabilities: ['Device management', 'App provisioning', 'Payroll', 'Automated deprovisioning'] },
  { id: 'ukg-pro', name: 'UKG Pro', domains: ['hrms'], description: 'Workforce management and human capital management (formerly UltiPro).', websiteUrl: 'https://www.ukg.com', deployment: 'saas', capabilities: ['HR', 'Payroll', 'Scheduling', 'Compliance reporting'] },
  { id: 'zoho-people', name: 'Zoho People', domains: ['hrms'], description: 'Cloud HR software for leave, attendance, and performance.', websiteUrl: 'https://www.zoho.com/people/', deployment: 'saas', capabilities: ['Leave management', 'Timesheets', 'Employee self-service', 'API access'] },
  { id: 'darwinbox', name: 'Darwinbox', domains: ['hrms'], description: 'AI-powered HCM platform popular in India and APAC enterprises.', websiteUrl: 'https://darwinbox.com', deployment: 'saas', capabilities: ['Core HR', 'Recruitment', 'Payroll', 'Mobile-first HR'] },
  { id: 'keka', name: 'Keka', domains: ['hrms'], description: 'Modern HR and payroll platform for Indian SMBs and mid-market.', websiteUrl: 'https://www.keka.com', deployment: 'saas', capabilities: ['Payroll', 'Attendance', 'Performance', 'Compliance (India)'] },
  { id: 'greythr', name: 'greytHR', domains: ['hrms'], description: 'Cloud HR and payroll for Indian businesses.', websiteUrl: 'https://www.greythr.com', deployment: 'saas', capabilities: ['Payroll', 'Leave', 'Statutory compliance', 'Employee portal'] },
  { id: 'personio', name: 'Personio', domains: ['hrms'], description: 'European HR platform for recruiting, onboarding, and payroll.', websiteUrl: 'https://www.personio.com', deployment: 'saas', capabilities: ['Recruiting', 'Onboarding', 'Absence management', 'GDPR-ready HR data'] },
  { id: 'hibob', name: 'HiBob', domains: ['hrms'], description: 'Modern people management platform for distributed companies.', websiteUrl: 'https://www.hibob.com', deployment: 'saas', capabilities: ['Core HR', 'Workflow automation', 'Analytics', 'Integrations marketplace'] },
  { id: 'dayforce', name: 'Ceridian Dayforce', domains: ['hrms'], description: 'Continuous-payroll HCM with workforce management.', websiteUrl: 'https://www.dayforce.com', deployment: 'saas', capabilities: ['Payroll', 'Workforce management', 'Benefits', 'Global compliance'] },
  { id: 'dynamics-hr', name: 'Microsoft Dynamics 365 HR', domains: ['hrms'], description: 'HR module within Dynamics 365 for core HR processes.', websiteUrl: 'https://dynamics.microsoft.com/human-resources/overview/', deployment: 'saas', capabilities: ['Employee self-service', 'Leave', 'Entra ID sync', 'Power Platform'] },
  { id: 'deel', name: 'Deel', domains: ['hrms'], description: 'Global payroll, EOR, and contractor management.', websiteUrl: 'https://www.deel.com', deployment: 'saas', capabilities: ['Contractor payments', 'EOR', 'Compliance', 'Global hiring'] },
  { id: 'namely', name: 'Namely', domains: ['hrms'], description: 'HR platform for mid-sized companies with benefits administration.', websiteUrl: 'https://namely.com', deployment: 'saas', capabilities: ['Benefits', 'Payroll', 'Performance', 'Time tracking'] },

  // ── IDAM ──
  { id: 'okta', name: 'Okta', domains: ['idam', 'sso'], description: 'Leading cloud identity platform for workforce and customer identity.', websiteUrl: 'https://www.okta.com', docsUrl: 'https://help.okta.com', deployment: 'saas', capabilities: ['SSO', 'MFA', 'Lifecycle provisioning', 'Access governance'] },
  { id: 'microsoft-entra', name: 'Microsoft Entra ID', domains: ['idam', 'sso'], description: 'Azure AD identity and access for Microsoft 365 and cloud apps.', websiteUrl: 'https://www.microsoft.com/en-us/security/business/identity-access/microsoft-entra-id', docsUrl: 'https://learn.microsoft.com/en-us/entra/', deployment: 'saas', capabilities: ['Conditional Access', 'MFA', 'PIM', 'B2B guest access'] },
  { id: 'ping-identity', name: 'Ping Identity', domains: ['idam', 'sso'], description: 'Enterprise identity for workforce, customer, and partner access.', websiteUrl: 'https://www.pingidentity.com', deployment: 'hybrid', capabilities: ['PingFederate', 'PingOne', 'Directory', 'API security'] },
  { id: 'forgerock', name: 'ForgeRock', domains: ['idam', 'sso'], description: 'Identity platform for customer and workforce IAM at scale.', websiteUrl: 'https://www.forgerock.com', deployment: 'hybrid', capabilities: ['CIAM', 'Access management', 'Directory services', 'Identity governance'] },
  { id: 'sailpoint', name: 'SailPoint IdentityIQ', domains: ['idam'], description: 'Identity governance and administration (IGA) for access certifications.', websiteUrl: 'https://www.sailpoint.com', deployment: 'hybrid', capabilities: ['Access reviews', 'Role mining', 'Provisioning', 'Compliance reporting'] },
  { id: 'saviynt', name: 'Saviynt', domains: ['idam'], description: 'Cloud-native IGA and privileged access for enterprises.', websiteUrl: 'https://saviynt.com', deployment: 'saas', capabilities: ['IGA', 'PAM', 'Cloud entitlement management', 'Risk analytics'] },
  { id: 'one-identity', name: 'One Identity', domains: ['idam'], description: 'Active Directory management, governance, and PAM.', websiteUrl: 'https://www.oneidentity.com', deployment: 'hybrid', capabilities: ['AD management', 'PAM', 'Identity Manager', 'Safeguard'] },
  { id: 'cyberark', name: 'CyberArk', domains: ['idam'], description: 'Privileged access management and secrets vault.', websiteUrl: 'https://www.cyberark.com', deployment: 'hybrid', capabilities: ['PAM', 'Secrets Manager', 'Session recording', 'Just-in-time access'] },
  { id: 'beyondtrust', name: 'BeyondTrust', domains: ['idam'], description: 'PAM, remote access, and password management.', websiteUrl: 'https://www.beyondtrust.com', deployment: 'hybrid', capabilities: ['PAM', 'Remote support', 'Password safe', 'Endpoint privilege'] },
  { id: 'jumpcloud', name: 'JumpCloud', domains: ['idam', 'sso'], description: 'Open directory platform for devices, users, and SSO.', websiteUrl: 'https://jumpcloud.com', deployment: 'saas', capabilities: ['LDAP', 'SSO', 'MDM', 'Cross-platform directory'] },
  { id: 'aws-iam-ic', name: 'AWS IAM Identity Center', domains: ['idam', 'sso'], description: 'AWS SSO and multi-account access management.', websiteUrl: 'https://aws.amazon.com/iam/identity-center/', deployment: 'saas', capabilities: ['AWS SSO', 'Permission sets', 'SCIM', 'Multi-account access'] },
  { id: 'google-workspace', name: 'Google Workspace', domains: ['idam', 'sso'], description: 'Google Admin directory, groups, and security controls.', websiteUrl: 'https://workspace.google.com', deployment: 'saas', capabilities: ['User lifecycle', '2SV enforcement', 'OAuth controls', 'Context-aware access'] },
  { id: 'oracle-identity', name: 'Oracle Identity Cloud', domains: ['idam', 'sso'], description: 'Oracle cloud IAM with adaptive access and governance.', websiteUrl: 'https://www.oracle.com/security/cloud-security/identity-cloud/', deployment: 'saas', capabilities: ['SSO', 'MFA', 'Adaptive access', 'Identity governance'] },
  { id: 'ibm-verify', name: 'IBM Security Verify', domains: ['idam', 'sso'], description: 'Cloud IAM with AI-driven risk and decentralized identity.', websiteUrl: 'https://www.ibm.com/products/verify-identity', deployment: 'saas', capabilities: ['CIAM', 'Workforce SSO', 'Risk-based auth', 'Passwordless'] },
  { id: 'hashicorp-vault', name: 'HashiCorp Vault', domains: ['idam'], description: 'Secrets management and dynamic credentials.', websiteUrl: 'https://www.hashicorp.com/products/vault', deployment: 'hybrid', capabilities: ['Secrets engine', 'Dynamic secrets', 'Encryption', 'PKI'] },
  { id: 'duo', name: 'Cisco Duo', domains: ['idam', 'sso'], description: 'Multi-factor authentication and device trust.', websiteUrl: 'https://duo.com', deployment: 'saas', capabilities: ['MFA', 'Device health', 'SSO integration', 'Adaptive policies'] },
  { id: 'aws-iam', name: 'AWS IAM', domains: ['idam'], description: 'AWS native identity and access management for cloud resources.', websiteUrl: 'https://aws.amazon.com/iam/', deployment: 'saas', capabilities: ['IAM policies', 'Roles', 'Access keys', 'Permission boundaries'] },
  { id: 'azure-pim', name: 'Microsoft Entra PIM', domains: ['idam'], description: 'Privileged identity management with just-in-time elevation.', websiteUrl: 'https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/', deployment: 'saas', capabilities: ['JIT access', 'Activation approval', 'Access reviews', 'Audit logs'] },
  { id: 'github-iam', name: 'GitHub Organizations', domains: ['idam'], description: 'Source code access, teams, and org security policies.', websiteUrl: 'https://github.com', docsUrl: 'https://docs.github.com/en/organizations', deployment: 'saas', capabilities: ['Org MFA', 'Team permissions', 'SSO enforcement', 'Audit log'] },

  // ── SIEM ──
  { id: 'splunk-es', name: 'Splunk Enterprise Security', domains: ['siem'], description: 'Market-leading SIEM with correlation, SOAR, and UEBA.', websiteUrl: 'https://www.splunk.com/en_us/products/enterprise-security.html', deployment: 'hybrid', capabilities: ['Correlation searches', 'Notable events', 'Risk-based alerting', 'SOAR integration'] },
  { id: 'microsoft-sentinel', name: 'Microsoft Sentinel', domains: ['siem'], description: 'Cloud-native SIEM and SOAR on Azure with AI analytics.', websiteUrl: 'https://azure.microsoft.com/en-us/products/microsoft-sentinel', deployment: 'saas', capabilities: ['Log Analytics', 'KQL', 'Workbooks', 'Logic Apps automation'] },
  { id: 'google-chronicle', name: 'Google SecOps (Chronicle)', domains: ['siem'], description: 'Google Security Operations SIEM with UDM and YARA-L detection.', websiteUrl: 'https://cloud.google.com/chronicle', deployment: 'saas', capabilities: ['UDM normalization', 'Detection rules', 'Entity graph', 'Case management'] },
  { id: 'ibm-qradar', name: 'IBM QRadar', domains: ['siem'], description: 'Enterprise SIEM with flow and event correlation.', websiteUrl: 'https://www.ibm.com/products/qradar-siem', deployment: 'hybrid', capabilities: ['Offense management', 'Log sources', 'Risk scoring', 'SOAR'] },
  { id: 'elastic-security', name: 'Elastic Security', domains: ['siem'], description: 'Open SIEM and endpoint detection on the Elastic Stack.', websiteUrl: 'https://www.elastic.co/security', deployment: 'hybrid', capabilities: ['Detection engine', 'Timeline analysis', 'Cases', 'Fleet management'] },
  { id: 'sumo-logic', name: 'Sumo Logic Cloud SIEM', domains: ['siem'], description: 'Cloud-native machine data analytics and SIEM.', websiteUrl: 'https://www.sumologic.com/solutions/cloud-siem/', deployment: 'saas', capabilities: ['Cloud SIEM', 'UEBA', 'Compliance apps', 'Global intelligence'] },
  { id: 'logrhythm', name: 'LogRhythm SIEM', domains: ['siem'], description: 'Integrated SIEM platform with NetMon and UEBA.', websiteUrl: 'https://logrhythm.com/products/siem/', deployment: 'hybrid', capabilities: ['AI Engine', 'NetMon', 'Case management', 'Compliance modules'] },
  { id: 'securonix', name: 'Securonix Unified Defense SIEM', domains: ['siem'], description: 'Cloud-native SIEM with UEBA and SOAR.', websiteUrl: 'https://www.securonix.com', deployment: 'saas', capabilities: ['Threat detection', 'Insider threat', 'SOAR', 'Data lake'] },
  { id: 'exabeam', name: 'Exabeam Fusion SIEM', domains: ['siem'], description: 'Behavioral analytics SIEM with Smart Timelines.', websiteUrl: 'https://www.exabeam.com', deployment: 'saas', capabilities: ['UEBA', 'Smart Timelines', 'SOAR', 'Cloud-native'] },
  { id: 'rapid7-insightidr', name: 'Rapid7 InsightIDR', domains: ['siem'], description: 'Cloud SIEM with user behavior analytics and deception.', websiteUrl: 'https://www.rapid7.com/products/insightidr/', deployment: 'saas', capabilities: ['Attacker behavior', 'Deception', 'Log search', 'Incident detection'] },
  { id: 'devo', name: 'Devo', domains: ['siem'], description: 'Cloud-native logging and real-time security analytics.', websiteUrl: 'https://www.devo.com', deployment: 'saas', capabilities: ['Real-time analytics', 'High-volume ingestion', 'SOAR', 'Compliance'] },
  { id: 'wazuh', name: 'Wazuh', domains: ['siem'], description: 'Open-source XDR and SIEM for endpoints and cloud.', websiteUrl: 'https://wazuh.com', deployment: 'open-source', capabilities: ['HIDS', 'FIM', 'Vulnerability detection', 'Compliance'] },
  { id: 'crowdstrike-logscale', name: 'CrowdStrike Falcon LogScale', domains: ['siem'], description: 'Log management and SIEM from CrowdStrike (formerly Humio).', websiteUrl: 'https://www.crowdstrike.com/platform/next-gen-siem/', deployment: 'saas', capabilities: ['LogScale', 'Threat hunting', 'Falcon integration', 'Real-time ingest'] },
  { id: 'datadog-cloud-siem', name: 'Datadog Cloud SIEM', domains: ['siem'], description: 'Cloud SIEM built on observability data and detection rules.', websiteUrl: 'https://www.datadoghq.com/product/cloud-siem/', deployment: 'saas', capabilities: ['Detection rules', 'Signal correlation', 'CloudTrail/Azure/GCP', 'Case management'] },
  { id: 'graylog', name: 'Graylog', domains: ['siem'], description: 'Open-source and enterprise log management with SIEM features.', websiteUrl: 'https://graylog.org', deployment: 'hybrid', capabilities: ['Log aggregation', 'Streams', 'Alerts', 'Security analytics'] },
  { id: 'sentinelone-sdl', name: 'SentinelOne Singularity Data Lake', domains: ['siem'], description: 'XDR data lake with AI-powered detection and hunting.', websiteUrl: 'https://www.sentinelone.com/platform/singularity-data-lake/', deployment: 'saas', capabilities: ['XDR telemetry', 'AI detection', 'Threat hunting', 'Third-party ingest'] },
  { id: 'arcsight', name: 'OpenText ArcSight', domains: ['siem'], description: 'Enterprise SIEM with CEF normalization and correlation.', websiteUrl: 'https://www.microfocus.com/en-us/cyberres/security-information-event-management', deployment: 'on-prem', capabilities: ['CEF', 'Correlation', 'Logger', 'ESM'] },
  { id: 'alienvault-usm', name: 'AT&T AlienVault USM', domains: ['siem'], description: 'Unified security management with SIEM, IDS, and vulnerability scanning.', websiteUrl: 'https://cybersecurity.att.com/products/usm-anywhere', deployment: 'saas', capabilities: ['SIEM', 'Asset discovery', 'Vulnerability scanning', 'OTX threat intel'] },

  // ── VAPT ──
  { id: 'tenable-io', name: 'Tenable.io', domains: ['vapt'], description: 'Exposure management and vulnerability assessment platform.', websiteUrl: 'https://www.tenable.com/products/tenable-io', deployment: 'saas', capabilities: ['VM scanning', 'Web app scanning', 'Lateral movement', 'Prioritization'] },
  { id: 'nessus', name: 'Tenable Nessus', domains: ['vapt'], description: 'Industry-standard vulnerability scanner for networks and systems.', websiteUrl: 'https://www.tenable.com/products/nessus', deployment: 'hybrid', capabilities: ['Network scan', 'Compliance audits', 'Plugin feed', 'Agent-based scan'] },
  { id: 'qualys-vmdr', name: 'Qualys VMDR', domains: ['vapt'], description: 'Vulnerability management, detection, and response in the cloud.', websiteUrl: 'https://www.qualys.com/apps/vulnerability-management-detection-response/', deployment: 'saas', capabilities: ['Continuous monitoring', 'Patch management', 'Web app scanning', 'TruRisk scoring'] },
  { id: 'rapid7-insightvm', name: 'Rapid7 InsightVM', domains: ['vapt'], description: 'Live vulnerability management with remediation workflows.', websiteUrl: 'https://www.rapid7.com/products/insightvm/', deployment: 'hybrid', capabilities: ['Live dashboards', 'Remediation projects', 'Agent scan', 'Integrations'] },
  { id: 'burp-suite', name: 'Burp Suite Enterprise', domains: ['vapt'], description: 'DAST and manual testing platform from PortSwigger.', websiteUrl: 'https://portswigger.net/burp/enterprise', deployment: 'hybrid', capabilities: ['Web app scan', 'CI/CD integration', 'Manual testing', 'Issue tracking'] },
  { id: 'metasploit', name: 'Metasploit Pro', domains: ['vapt'], description: 'Penetration testing framework for exploit validation.', websiteUrl: 'https://www.metasploit.com', deployment: 'hybrid', capabilities: ['Exploit modules', 'Social engineering', 'Pivoting', 'Reporting'] },
  { id: 'acunetix', name: 'Acunetix', domains: ['vapt'], description: 'Automated web vulnerability scanner for DAST.', websiteUrl: 'https://www.acunetix.com', deployment: 'hybrid', capabilities: ['Web scan', 'API scan', 'CI/CD', 'Compliance reports'] },
  { id: 'invicti', name: 'Invicti (Netsparker)', domains: ['vapt'], description: 'Proof-based DAST for web applications.', websiteUrl: 'https://www.invicti.com', deployment: 'saas', capabilities: ['Proof-based scanning', 'IAST', 'API security', 'DevSecOps'] },
  { id: 'openvas', name: 'Greenbone OpenVAS', domains: ['vapt'], description: 'Open-source vulnerability scanner and management.', websiteUrl: 'https://www.greenbone.net/en/community/', deployment: 'open-source', capabilities: ['Network VTs', 'Scheduled scans', 'Reports', 'GSA/GVM'] },
  { id: 'nuclei', name: 'Nuclei', domains: ['vapt'], description: 'Fast template-based vulnerability scanner from ProjectDiscovery.', websiteUrl: 'https://nuclei.projectdiscovery.io', deployment: 'open-source', capabilities: ['Template library', 'CI integration', 'Custom checks', 'Cloud scan'] },
  { id: 'cobalt', name: 'Cobalt', domains: ['vapt'], description: 'Pentest-as-a-Service with vetted researchers.', websiteUrl: 'https://www.cobalt.io', deployment: 'saas', capabilities: ['Pentest platform', 'Retest workflow', 'Findings API', 'Compliance mapping'] },
  { id: 'synack', name: 'Synack', domains: ['vapt'], description: 'Crowdsourced security testing with continuous assessment.', websiteUrl: 'https://www.synack.com', deployment: 'saas', capabilities: ['Crowd pentest', 'SmartScan', 'LaunchPoint agents', 'SRT researchers'] },
  { id: 'intruder', name: 'Intruder', domains: ['vapt'], description: 'Cloud-based vulnerability scanner for external attack surface.', websiteUrl: 'https://www.intruder.io', deployment: 'saas', capabilities: ['External scan', 'Emerging threats', 'Slack alerts', 'Compliance'] },
  { id: 'detectify', name: 'Detectify', domains: ['vapt'], description: 'External attack surface management and web app scanning.', websiteUrl: 'https://detectify.com', deployment: 'saas', capabilities: ['Surface monitoring', 'Crowdsource payloads', 'Asset inventory', 'Automated scanning'] },
  { id: 'veracode', name: 'Veracode', domains: ['vapt'], description: 'Application security platform for SAST, DAST, and SCA.', websiteUrl: 'https://www.veracode.com', deployment: 'saas', capabilities: ['SAST', 'DAST', 'SCA', 'Pen testing'] },
  { id: 'checkmarx', name: 'Checkmarx One', domains: ['vapt'], description: 'DevSecOps platform for code, supply chain, and cloud security.', websiteUrl: 'https://checkmarx.com', deployment: 'saas', capabilities: ['SAST', 'SCA', 'IaC scan', 'API security'] },
  { id: 'snyk', name: 'Snyk', domains: ['vapt'], description: 'Developer-first security for code, dependencies, and cloud.', websiteUrl: 'https://snyk.io', deployment: 'saas', capabilities: ['SCA', 'SAST', 'Container scan', 'IaC'] },
  { id: 'hcl-appscan', name: 'HCL AppScan', domains: ['vapt'], description: 'Enterprise application security testing suite.', websiteUrl: 'https://www.hcltech.com/appscan', deployment: 'hybrid', capabilities: ['SAST', 'DAST', 'IAST', 'Software composition'] },
  { id: 'owasp-zap', name: 'OWASP ZAP', domains: ['vapt'], description: 'Free open-source web application security scanner.', websiteUrl: 'https://www.zaproxy.org', deployment: 'open-source', capabilities: ['Passive scan', 'Active scan', 'API support', 'Automation framework'] },
  { id: 'immuniweb', name: 'ImmuniWeb', domains: ['vapt'], description: 'AI-driven web and mobile app security testing.', websiteUrl: 'https://www.immuniweb.com', deployment: 'saas', capabilities: ['Web scan', 'Dark web monitoring', 'Compliance', 'AI triage'] },

  // ── SSO ──
  { id: 'auth0', name: 'Auth0', domains: ['sso'], description: 'Customer identity platform with SSO, MFA, and social login.', websiteUrl: 'https://auth0.com', deployment: 'saas', capabilities: ['OIDC/SAML', 'Universal login', 'Actions', 'Organizations'] },
  { id: 'onelogin', name: 'OneLogin', domains: ['sso', 'idam'], description: 'Unified access management and SSO for cloud apps.', websiteUrl: 'https://www.onelogin.com', deployment: 'saas', capabilities: ['App catalog', 'SSO', 'MFA', 'Directory integration'] },
  { id: 'pingfederate', name: 'PingFederate', domains: ['sso'], description: 'Enterprise federation server for SAML and OIDC.', websiteUrl: 'https://www.pingidentity.com/en/platform/capabilities/pingfederate.html', deployment: 'hybrid', capabilities: ['SAML IdP/SP', 'OIDC', 'OAuth', 'Token exchange'] },
  { id: 'pingone', name: 'PingOne', domains: ['sso', 'idam'], description: 'PingIdentity cloud identity suite.', websiteUrl: 'https://www.pingidentity.com/en/platform.html', deployment: 'saas', capabilities: ['SSO', 'MFA', 'Directory', 'DaVinci orchestration'] },
  { id: 'keycloak', name: 'Keycloak', domains: ['sso', 'idam'], description: 'Open-source identity and access management with SSO.', websiteUrl: 'https://www.keycloak.org', deployment: 'open-source', capabilities: ['SAML/OIDC', 'Social login', 'User federation', 'Fine-grained authz'] },
  { id: 'adfs', name: 'Microsoft AD FS', domains: ['sso'], description: 'Active Directory Federation Services for on-premises SSO.', websiteUrl: 'https://learn.microsoft.com/en-us/windows-server/identity/ad-fs/ad-fs-overview', deployment: 'on-prem', capabilities: ['SAML', 'WS-Federation', 'AD integration', 'Claims rules'] },
  { id: 'cloudflare-access', name: 'Cloudflare Access', domains: ['sso'], description: 'Zero Trust network access with identity-aware proxy.', websiteUrl: 'https://www.cloudflare.com/products/zero-trust/access/', deployment: 'saas', capabilities: ['ZTNA', 'IdP integration', 'Device posture', 'App launcher'] },
  { id: 'zscaler-zpa', name: 'Zscaler Private Access', domains: ['sso'], description: 'Zero Trust access to private apps without VPN.', websiteUrl: 'https://www.zscaler.com/products/zscaler-private-access', deployment: 'saas', capabilities: ['App segmentation', 'IdP SSO', 'Posture check', 'Browser isolation'] },
  { id: 'lastpass-sso', name: 'LastPass Business SSO', domains: ['sso'], description: 'Password manager with SSO and provisioning for teams.', websiteUrl: 'https://www.lastpass.com/business', deployment: 'saas', capabilities: ['SSO', 'Password vault', 'MFA', 'Directory sync'] },
  { id: 'salesforce-identity', name: 'Salesforce Identity', domains: ['sso'], description: 'SSO and identity for Salesforce and connected apps.', websiteUrl: 'https://www.salesforce.com/products/platform/products/identity/', deployment: 'saas', capabilities: ['SAML SSO', 'Connected apps', 'Login flows', 'Experience Cloud'] },
  { id: 'cas-apereo', name: 'Apereo CAS', domains: ['sso'], description: 'Open-source enterprise single sign-on server.', websiteUrl: 'https://apereo.github.io/cas/', deployment: 'open-source', capabilities: ['SAML/OIDC', 'MFA', 'Delegated auth', 'Service registry'] },
  { id: 'miniOrange', name: 'miniOrange', domains: ['sso'], description: 'SSO and MFA solutions for cloud and on-prem apps.', websiteUrl: 'https://www.miniorange.com', deployment: 'saas', capabilities: ['SSO', 'MFA', 'Adaptive auth', 'Provisioning'] },
  { id: 'gluu', name: 'Gluu', domains: ['sso', 'idam'], description: 'Open-source identity platform for SSO and access management.', websiteUrl: 'https://gluu.org', deployment: 'open-source', capabilities: ['SAML/OIDC', 'FAPI', 'Consent', 'SCIM'] },
];

export const INTEGRATION_TOOLS: IntegrationTool[] = INTEGRATION_TOOLS_RAW.map(withHelpLinks);

export function getIntegrationDomains() {
  return INTEGRATION_DOMAINS;
}

export function getIntegrationTools(domain?: IntegrationDomain) {
  if (!domain) return INTEGRATION_TOOLS;
  return INTEGRATION_TOOLS.filter((t) => t.domains.includes(domain));
}

export function getIntegrationToolById(id: string) {
  return INTEGRATION_TOOLS.find((t) => t.id === id);
}

export function getIntegrationCatalogStats() {
  const byDomain = INTEGRATION_DOMAINS.map((d) => ({
    ...d,
    count: INTEGRATION_TOOLS.filter((t) => t.domains.includes(d.id)).length,
  }));
  return {
    totalTools: INTEGRATION_TOOLS.length,
    domains: byDomain,
  };
}
