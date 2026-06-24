export interface AwsMonitorConfig {
  enabled: boolean;
  configured: boolean;
  region: string;
}

export interface AzureMonitorConfig {
  enabled: boolean;
  configured: boolean;
  subscriptionId: string;
  tenantId: string;
}

export function getAwsMonitorConfig(): AwsMonitorConfig {
  const enabled = process.env.AWS_MONITOR_ENABLED === 'true';
  const hasCreds = Boolean(
    process.env.AWS_ACCESS_KEY_ID?.trim() && process.env.AWS_SECRET_ACCESS_KEY?.trim()
  );
  return {
    enabled,
    configured: enabled && hasCreds,
    region: process.env.AWS_REGION?.trim() || process.env.AWS_DEFAULT_REGION?.trim() || 'us-east-1',
  };
}

export function getAzureMonitorConfig(): AzureMonitorConfig {
  const enabled = process.env.AZURE_MONITOR_ENABLED === 'true';
  const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID?.trim() ?? '';
  const tenantId = process.env.AZURE_TENANT_ID?.trim() ?? '';
  const hasCreds = Boolean(
    subscriptionId &&
      tenantId &&
      process.env.AZURE_CLIENT_ID?.trim() &&
      process.env.AZURE_CLIENT_SECRET?.trim()
  );
  return {
    enabled,
    configured: enabled && hasCreds,
    subscriptionId,
    tenantId,
  };
}

export function getMonitoringStatus() {
  const aws = getAwsMonitorConfig();
  const azure = getAzureMonitorConfig();
  return {
    aws,
    azure,
    anyConfigured: aws.configured || azure.configured,
  };
}
