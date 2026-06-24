export interface ChronicleConfig {
  enabled: boolean;
  configured: boolean;
  gcpProjectId: string;
  instance: string;
  region: string;
  hasCredentials: boolean;
}

export function getChronicleConfig(): ChronicleConfig {
  const enabled = process.env.CHRONICLE_ENABLED === 'true';
  const gcpProjectId = process.env.CHRONICLE_GCP_PROJECT_ID?.trim() ?? '';
  const instance = process.env.CHRONICLE_INSTANCE?.trim() ?? '';
  const region = process.env.CHRONICLE_REGION?.trim() || 'us';
  const hasCredentials = Boolean(
    process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim() ||
      process.env.CHRONICLE_SERVICE_ACCOUNT_JSON?.trim()
  );

  return {
    enabled,
    configured: enabled && Boolean(gcpProjectId && instance),
    gcpProjectId,
    instance,
    region,
    hasCredentials,
  };
}
