import type { IntegrationDeployment } from '@/lib/data/integration-catalog';

export type IdamApiField = {
  id: string;
  label: string;
  type: 'text' | 'password' | 'url';
  placeholder: string;
  required: boolean;
  helpText?: string;
  agentOnly?: boolean;
};

export type IdamConnectionMode = 'api' | 'agent' | 'both';

export type IdamToolDefinition = {
  id: string;
  name: string;
  description: string;
  docsUrl: string;
  deployment: IntegrationDeployment;
  connectionMode: IdamConnectionMode;
  agentRequired: boolean;
  defaultTenantUrl: string;
  authType: 'api-key' | 'oauth' | 'service-account' | 'scim';
  fields: IdamApiField[];
  syncCapabilities: string[];
  checksProvided: string[];
  agentCapabilities: string[];
};

export const IDAM_TOOL_DEFINITIONS: IdamToolDefinition[] = [
  {
    id: 'okta',
    name: 'Okta',
    description: 'Workforce identity — users, groups, MFA enrollment, and sign-in logs.',
    docsUrl: 'https://developer.okta.com/docs/reference/',
    deployment: 'saas',
    connectionMode: 'both',
    agentRequired: false,
    defaultTenantUrl: 'https://your-org.okta.com',
    authType: 'api-key',
    fields: [
      {
        id: 'tenantUrl',
        label: 'Okta domain',
        type: 'url',
        placeholder: 'https://your-org.okta.com',
        required: true,
      },
      {
        id: 'apiToken',
        label: 'API token (read-only)',
        type: 'password',
        placeholder: 'Okta SSWS API token',
        required: true,
        helpText: 'Admin → Security → API → Tokens with read-only scopes',
      },
    ],
    syncCapabilities: ['User inventory', 'Group membership', 'MFA status', 'Sign-in logs', 'App assignments'],
    checksProvided: ['MFA enforcement', 'User provisioning', 'Access reviews', 'App assignments'],
    agentCapabilities: ['Local session correlation', 'Device posture relay', 'Offline evidence cache'],
  },
  {
    id: 'microsoft-entra',
    name: 'Microsoft Entra ID',
    description: 'Azure AD directory, Conditional Access, and privileged roles.',
    docsUrl: 'https://learn.microsoft.com/en-us/graph/api/overview',
    deployment: 'saas',
    connectionMode: 'both',
    agentRequired: false,
    defaultTenantUrl: 'https://entra.microsoft.com',
    authType: 'oauth',
    fields: [
      {
        id: 'tenantId',
        label: 'Directory (tenant) ID',
        type: 'text',
        placeholder: '00000000-0000-0000-0000-000000000000',
        required: true,
      },
      {
        id: 'clientId',
        label: 'App registration client ID',
        type: 'text',
        placeholder: 'Application (client) ID',
        required: true,
      },
      {
        id: 'clientSecret',
        label: 'Client secret',
        type: 'password',
        placeholder: 'Client secret value',
        required: true,
      },
    ],
    syncCapabilities: ['Users & guests', 'Conditional Access', 'PIM roles', 'Sign-in risk', 'Group membership'],
    checksProvided: ['Conditional Access', 'MFA', 'Privileged Identity Management', 'Guest access'],
    agentCapabilities: ['Entra device compliance relay', 'Windows Hello attestation', 'Local admin audit'],
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    description: 'Google Admin directory, 2SV enforcement, and OAuth app controls.',
    docsUrl: 'https://developers.google.com/admin-sdk',
    deployment: 'saas',
    connectionMode: 'api',
    agentRequired: false,
    defaultTenantUrl: 'https://admin.google.com',
    authType: 'service-account',
    fields: [
      {
        id: 'domain',
        label: 'Primary domain',
        type: 'text',
        placeholder: 'company.com',
        required: true,
      },
      {
        id: 'serviceAccountEmail',
        label: 'Service account email',
        type: 'text',
        placeholder: 'complai-sync@project.iam.gserviceaccount.com',
        required: true,
      },
      {
        id: 'privateKey',
        label: 'Service account private key (JSON)',
        type: 'password',
        placeholder: '-----BEGIN PRIVATE KEY-----',
        required: true,
      },
      {
        id: 'adminEmail',
        label: 'Delegated admin email',
        type: 'text',
        placeholder: 'admin@company.com',
        required: true,
        helpText: 'Super-admin user the service account impersonates',
      },
    ],
    syncCapabilities: ['User lifecycle', '2SV status', 'Admin roles', 'OAuth token audit'],
    checksProvided: ['2-Step Verification', 'Admin roles', 'OAuth app access', 'Password policies'],
    agentCapabilities: [],
  },
  {
    id: 'aws-iam',
    name: 'AWS IAM',
    description: 'AWS accounts, IAM users/roles, and Identity Center federation.',
    docsUrl: 'https://docs.aws.amazon.com/IAM/latest/APIReference/',
    deployment: 'saas',
    connectionMode: 'both',
    agentRequired: true,
    defaultTenantUrl: 'https://console.aws.amazon.com/iam/',
    authType: 'service-account',
    fields: [
      {
        id: 'accountId',
        label: 'AWS account ID',
        type: 'text',
        placeholder: '123456789012',
        required: true,
      },
      {
        id: 'roleArn',
        label: 'Cross-account role ARN',
        type: 'text',
        placeholder: 'arn:aws:iam::123456789012:role/ComplAIReadOnly',
        required: true,
      },
      {
        id: 'externalId',
        label: 'External ID',
        type: 'password',
        placeholder: 'ComplAI external ID',
        required: true,
      },
      {
        id: 'region',
        label: 'Primary region',
        type: 'text',
        placeholder: 'ap-south-1',
        required: false,
      },
    ],
    syncCapabilities: ['IAM users & roles', 'Access keys age', 'Permission boundaries', 'Identity Center'],
    checksProvided: ['Root MFA', 'IAM policies', 'Access keys rotation', 'Permission boundaries'],
    agentCapabilities: ['EC2 instance role inventory', 'Local credential scan', 'STS session evidence'],
  },
  {
    id: 'github-iam',
    name: 'GitHub Organizations',
    description: 'Org membership, team permissions, and SSO enforcement.',
    docsUrl: 'https://docs.github.com/en/rest',
    deployment: 'saas',
    connectionMode: 'api',
    agentRequired: false,
    defaultTenantUrl: 'https://github.com/orgs',
    authType: 'api-key',
    fields: [
      {
        id: 'orgSlug',
        label: 'Organization slug',
        type: 'text',
        placeholder: 'your-org',
        required: true,
      },
      {
        id: 'personalAccessToken',
        label: 'Fine-grained PAT (read org)',
        type: 'password',
        placeholder: 'github_pat_…',
        required: true,
      },
    ],
    syncCapabilities: ['Org members', 'Outside collaborators', 'Team permissions', 'Audit log export'],
    checksProvided: ['Org MFA requirement', 'Branch protection', 'Outside collaborators', 'SSO enforcement'],
    agentCapabilities: [],
  },
  {
    id: 'azure-pim',
    name: 'Microsoft Entra PIM',
    description: 'Privileged role activations and JIT access reviews.',
    docsUrl: 'https://learn.microsoft.com/en-us/graph/api/resources/privilegedidentitymanagementv3-overview',
    deployment: 'saas',
    connectionMode: 'api',
    agentRequired: false,
    defaultTenantUrl: 'https://entra.microsoft.com',
    authType: 'oauth',
    fields: [
      {
        id: 'tenantId',
        label: 'Directory (tenant) ID',
        type: 'text',
        placeholder: '00000000-0000-0000-0000-000000000000',
        required: true,
      },
      {
        id: 'clientId',
        label: 'App registration client ID',
        type: 'text',
        placeholder: 'Application (client) ID',
        required: true,
      },
      {
        id: 'clientSecret',
        label: 'Client secret',
        type: 'password',
        placeholder: 'Client secret value',
        required: true,
      },
    ],
    syncCapabilities: ['Eligible assignments', 'Activation history', 'Access reviews', 'Audit events'],
    checksProvided: ['Privileged role assignments', 'Activation approvals', 'Access reviews for admins'],
    agentCapabilities: [],
  },
  {
    id: 'jumpcloud',
    name: 'JumpCloud',
    description: 'Directory, device management, and cross-platform SSO.',
    docsUrl: 'https://docs.jumpcloud.com/api/',
    deployment: 'saas',
    connectionMode: 'both',
    agentRequired: true,
    defaultTenantUrl: 'https://console.jumpcloud.com',
    authType: 'api-key',
    fields: [
      {
        id: 'apiKey',
        label: 'API key',
        type: 'password',
        placeholder: 'JumpCloud API key',
        required: true,
      },
      {
        id: 'orgId',
        label: 'Organization ID',
        type: 'text',
        placeholder: 'JumpCloud org ID',
        required: false,
      },
    ],
    syncCapabilities: ['Users & systems', 'MDM compliance', 'SSO apps', 'Password policies'],
    checksProvided: ['Device compliance', 'User lifecycle', 'SSO enforcement', 'MFA policies'],
    agentCapabilities: ['Device agent pairing', 'Local policy enforcement', 'Command audit relay'],
  },
  {
    id: 'cyberark',
    name: 'CyberArk',
    description: 'Privileged access management and secrets vault.',
    docsUrl: 'https://docs.cyberark.com/',
    deployment: 'hybrid',
    connectionMode: 'agent',
    agentRequired: true,
    defaultTenantUrl: 'https://pvwa.yourcompany.local',
    authType: 'api-key',
    fields: [
      {
        id: 'pvwaUrl',
        label: 'PVWA URL',
        type: 'url',
        placeholder: 'https://pvwa.yourcompany.local',
        required: true,
        agentOnly: true,
        helpText: 'Reachable from the endpoint agent on the corporate network',
      },
      {
        id: 'username',
        label: 'Service account',
        type: 'text',
        placeholder: 'complai-readonly',
        required: true,
        agentOnly: true,
      },
      {
        id: 'password',
        label: 'Password',
        type: 'password',
        placeholder: 'Service account password',
        required: true,
        agentOnly: true,
      },
    ],
    syncCapabilities: ['Safe inventory', 'Session recordings', 'JIT access', 'Account discovery'],
    checksProvided: ['PAM coverage', 'Session recording', 'Secrets rotation', 'JIT access'],
    agentCapabilities: ['On-prem PVWA relay', 'Session metadata', 'Local privileged account scan'],
  },
  {
    id: 'ping-identity',
    name: 'Ping Identity',
    description: 'Enterprise federation and workforce identity.',
    docsUrl: 'https://docs.pingidentity.com/',
    deployment: 'hybrid',
    connectionMode: 'agent',
    agentRequired: true,
    defaultTenantUrl: 'https://auth.yourcompany.com',
    authType: 'oauth',
    fields: [
      {
        id: 'environmentUrl',
        label: 'Ping environment URL',
        type: 'url',
        placeholder: 'https://auth.yourcompany.com',
        required: true,
        agentOnly: true,
      },
      {
        id: 'clientId',
        label: 'Client ID',
        type: 'text',
        placeholder: 'OAuth client ID',
        required: true,
      },
      {
        id: 'clientSecret',
        label: 'Client secret',
        type: 'password',
        placeholder: 'OAuth client secret',
        required: true,
        agentOnly: true,
      },
    ],
    syncCapabilities: ['Federation partners', 'Token policies', 'User sessions', 'Risk events'],
    checksProvided: ['Federation health', 'MFA policies', 'Token lifetime', 'Partner trust'],
    agentCapabilities: ['On-network API relay', 'Auth event correlation'],
  },
];

export function getIdamToolById(id: string): IdamToolDefinition | undefined {
  return IDAM_TOOL_DEFINITIONS.find((t) => t.id === id);
}

export function getIdamToolsRequiringAgent(): IdamToolDefinition[] {
  return IDAM_TOOL_DEFINITIONS.filter((t) => t.agentRequired || t.connectionMode === 'agent');
}
