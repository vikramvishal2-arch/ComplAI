/** Maps access-control remediation provider IDs to catalog / IDAM tool IDs. */
export const ACCESS_PROVIDER_TO_IDAM_TOOL: Record<string, string> = {
  okta: 'okta',
  microsoft_entra: 'microsoft-entra',
  google_workspace: 'google-workspace',
  aws_iam: 'aws-iam',
  github: 'github-iam',
  azure_ad_pam: 'azure-pim',
};

export const IDAM_TOOL_TO_ACCESS_PROVIDER: Record<string, string> = Object.fromEntries(
  Object.entries(ACCESS_PROVIDER_TO_IDAM_TOOL).map(([provider, tool]) => [tool, provider])
);

export function toIdamToolId(providerOrToolId: string): string {
  return ACCESS_PROVIDER_TO_IDAM_TOOL[providerOrToolId] ?? providerOrToolId;
}

export function toAccessProviderId(toolId: string): string | undefined {
  return IDAM_TOOL_TO_ACCESS_PROVIDER[toolId];
}
