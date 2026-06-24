import type { AccessIntegrationProvider } from '../types';

export const ACCESS_INTEGRATION_PROVIDERS: AccessIntegrationProvider[] = [
  {
    id: 'okta',
    name: 'Okta',
    description: 'Identity provider for SSO, MFA, and user lifecycle management.',
    docsUrl: 'https://help.okta.com/oie/en-us/content/topics/security/mfa/mfa-home.htm',
    consoleUrl: 'https://login.okta.com/',
    setupGuideUrl: 'https://help.okta.com/oie/en-us/content/topics/users-groups-profiles/usgp-group-profile-assign.htm',
    checksProvided: ['MFA enforcement', 'User provisioning', 'Access reviews', 'App assignments'],
  },
  {
    id: 'microsoft_entra',
    name: 'Microsoft Entra ID',
    description: 'Azure AD identity and access management for Microsoft 365 and cloud apps.',
    docsUrl: 'https://learn.microsoft.com/en-us/entra/identity/authentication/concept-mfa-howitworks',
    consoleUrl: 'https://entra.microsoft.com/',
    setupGuideUrl: 'https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/custom-overview',
    checksProvided: ['Conditional Access', 'MFA', 'Privileged Identity Management', 'Guest access'],
  },
  {
    id: 'google_workspace',
    name: 'Google Workspace',
    description: 'Google Admin console for user, group, and security settings.',
    docsUrl: 'https://support.google.com/a/answer/175197',
    consoleUrl: 'https://admin.google.com/',
    setupGuideUrl: 'https://support.google.com/a/answer/7587184',
    checksProvided: ['2-Step Verification', 'Admin roles', 'OAuth app access', 'Password policies'],
  },
  {
    id: 'aws_iam',
    name: 'AWS IAM',
    description: 'AWS Identity and Access Management for cloud resource access control.',
    docsUrl: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html',
    consoleUrl: 'https://console.aws.amazon.com/iam/',
    setupGuideUrl: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-console.html',
    checksProvided: ['Root MFA', 'IAM policies', 'Access keys rotation', 'Permission boundaries'],
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Source code access, branch protection, and organization membership.',
    docsUrl: 'https://docs.github.com/en/organizations/keeping-your-organization-secure',
    consoleUrl: 'https://github.com/settings/organizations',
    setupGuideUrl: 'https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches',
    checksProvided: ['Org MFA requirement', 'Branch protection', 'Outside collaborators', 'SSO enforcement'],
  },
  {
    id: 'azure_ad_pam',
    name: 'Azure PIM / PAM',
    description: 'Privileged access management for just-in-time admin elevation.',
    docsUrl: 'https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure',
    consoleUrl: 'https://entra.microsoft.com/#view/Microsoft_Azure_PIMCommon/ActivationMenuBlade/~/aadmigratedroles',
    setupGuideUrl: 'https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-start-what-is-pim',
    checksProvided: ['Privileged role assignments', 'Activation approvals', 'Access reviews for admins'],
  },
];

export function getAccessProviderById(id: string): AccessIntegrationProvider | undefined {
  return ACCESS_INTEGRATION_PROVIDERS.find((p) => p.id === id);
}
