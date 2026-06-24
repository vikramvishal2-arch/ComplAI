import 'server-only';
import { getAzureMonitorConfig } from '../config';
import type { MonitorCheckOutcome } from '../types';
import { AZURE_CHECKS } from './definitions';

async function getAzureToken(): Promise<string> {
  const config = getAzureMonitorConfig();
  const body = new URLSearchParams({
    client_id: process.env.AZURE_CLIENT_ID!.trim(),
    client_secret: process.env.AZURE_CLIENT_SECRET!.trim(),
    scope: 'https://management.azure.com/.default',
    grant_type: 'client_credentials',
  });

  const res = await fetch(
    `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    }
  );

  if (!res.ok) {
    throw new Error(`Azure auth failed (${res.status})`);
  }

  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error('Azure token missing');
  return data.access_token;
}

export async function runAzureChecks(): Promise<MonitorCheckOutcome[]> {
  const config = getAzureMonitorConfig();
  if (!config.configured) {
    throw new Error(
      'Azure monitoring not configured. Set AZURE_MONITOR_ENABLED=true and service principal credentials in .env'
    );
  }

  const token = await getAzureToken();
  const api = (path: string) =>
    fetch(`https://management.azure.com${path}?api-version=2023-01-01`, {
      headers: { Authorization: `Bearer ${token}` },
    });

  const outcomes: MonitorCheckOutcome[] = [];

  // Storage accounts — public blob access
  try {
    const def = AZURE_CHECKS.find((c) => c.id === 'azure-storage-public')!;
    const res = await api(
      `/subscriptions/${config.subscriptionId}/providers/Microsoft.Storage/storageAccounts`
    );
    const data = (await res.json()) as {
      value?: { name: string; properties?: { allowBlobPublicAccess?: boolean } }[];
    };
    const publicAccounts = (data.value ?? []).filter(
      (sa) => sa.properties?.allowBlobPublicAccess !== false
    );
    outcomes.push({
      checkId: def.id,
      checkName: def.name,
      controlId: def.controlId,
      status: publicAccounts.length === 0 ? 'pass' : 'fail',
      message:
        publicAccounts.length === 0
          ? 'All storage accounts disallow public blob access.'
          : `Public blob access allowed: ${publicAccounts.map((a) => a.name).slice(0, 5).join(', ')}`,
      remediation: 'Set allowBlobPublicAccess to false on all storage accounts.',
    });
  } catch (err) {
    outcomes.push({
      checkId: 'azure-storage-public',
      checkName: 'Storage account public blob access',
      controlId: 'iso-a-8-3',
      status: 'error',
      message: err instanceof Error ? err.message : 'Check failed',
      remediation: 'Grant Reader role on subscription to the service principal.',
    });
  }

  // Defender pricing — simplified check
  try {
    const def = AZURE_CHECKS.find((c) => c.id === 'azure-defender')!;
    const res = await api(
      `/subscriptions/${config.subscriptionId}/providers/Microsoft.Security/pricings`
    );
    const data = (await res.json()) as {
      value?: { name: string; properties?: { pricingTier?: string } }[];
    };
    const standard = (data.value ?? []).filter((p) => p.properties?.pricingTier === 'Standard');
    outcomes.push({
      checkId: def.id,
      checkName: def.name,
      controlId: def.controlId,
      status: standard.length > 0 ? 'pass' : 'fail',
      message:
        standard.length > 0
          ? `Defender standard tier on ${standard.length} plan(s).`
          : 'Microsoft Defender for Cloud not on Standard tier.',
      remediation: 'Enable Defender for Cloud Standard on key workloads.',
    });
  } catch (err) {
    const def = AZURE_CHECKS.find((c) => c.id === 'azure-defender')!;
    outcomes.push({
      checkId: def.id,
      checkName: def.name,
      controlId: def.controlId,
      status: 'error',
      message: err instanceof Error ? err.message : 'Check failed',
      remediation: 'Grant Security Reader on subscription.',
    });
  }

  // MFA admins — advisory check (requires Graph API; report guidance)
  const mfaDef = AZURE_CHECKS.find((c) => c.id === 'azure-mfa-admins')!;
  outcomes.push({
    checkId: mfaDef.id,
    checkName: mfaDef.name,
    controlId: mfaDef.controlId,
    status: 'skipped',
    message:
      'Manual verification: ensure Conditional Access requires MFA for privileged roles in Entra ID.',
    remediation: 'Configure CA policy targeting Global Administrator and privileged roles.',
  });

  return outcomes;
}
