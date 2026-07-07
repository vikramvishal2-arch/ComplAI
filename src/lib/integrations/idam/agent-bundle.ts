import { createHash, randomBytes } from 'crypto';
import type { AccessConnection } from '@/lib/types';
import { getIdamToolById } from '@/lib/data/idam-tool-integrations';
import { getIntegrationToolById } from '@/lib/data/integration-catalog';
import { toIdamToolId } from './provider-map';
import type {
  AgentConfigPayload,
  AgentInstallBundle,
  CustomerIdamIntegration,
  IdamConnectionStatus,
} from './types';

const AGENT_VERSION = '0.1.0';
const BUNDLE_VERSION = '1';
const BUNDLE_TTL_HOURS = 72;
const SYNC_INTERVAL_MINUTES = 60;

const EVIDENCE_TYPES = [
  'user_inventory',
  'group_membership',
  'mfa_enrollment',
  'sign_in_logs',
  'privileged_access',
  'access_review_status',
  'device_posture',
];

export function hashSecret(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function generateEnrollmentToken(): string {
  return `cai_${randomBytes(24).toString('base64url')}`;
}

export function generateBundleId(): string {
  return `bundle_${randomBytes(12).toString('hex')}`;
}

export function maskConfig(config: Record<string, string>): Record<string, string> {
  const masked: Record<string, string> = {};
  for (const [key, value] of Object.entries(config)) {
    if (!value) {
      masked[key] = '';
      continue;
    }
    const sensitive =
      /secret|token|password|key|private/i.test(key) || key === 'apiToken' || key === 'privateKey';
    masked[key] = sensitive ? '••••••••' : value;
  }
  return masked;
}

export function buildCustomerIdamIntegration(input: {
  toolId: string;
  status: IdamConnectionStatus;
  accountIdentifier: string;
  adminContact: string;
  connectedAt: string | null;
  notes: string;
  source: CustomerIdamIntegration['source'];
  tenantUrl?: string;
}): CustomerIdamIntegration | null {
  const toolId = toIdamToolId(input.toolId);
  const definition = getIdamToolById(toolId);
  const catalog = getIntegrationToolById(toolId);

  if (!definition) return null;

  return {
    toolId,
    toolName: definition.name,
    source: input.source,
    status: input.status,
    deployment: definition.deployment,
    accountIdentifier: input.accountIdentifier,
    tenantUrl: input.tenantUrl || input.accountIdentifier || definition.defaultTenantUrl,
    adminContact: input.adminContact,
    connectionMode: definition.connectionMode,
    agentRequired: definition.agentRequired,
    connectedAt: input.connectedAt,
    notes: input.notes,
    syncCapabilities: definition.syncCapabilities,
    checksProvided: definition.checksProvided,
  };
}

export function mergeAccessConnection(
  integrations: Map<string, CustomerIdamIntegration>,
  connection: AccessConnection
): void {
  if (connection.status === 'not_connected' && !connection.accountIdentifier) return;

  const toolId = toIdamToolId(connection.providerId);
  const built = buildCustomerIdamIntegration({
    toolId,
    status: connection.status,
    accountIdentifier: connection.accountIdentifier,
    adminContact: connection.adminContact,
    connectedAt: connection.connectedAt,
    notes: connection.notes,
    source: 'access_connection',
    tenantUrl: connection.accountIdentifier.includes('.') ? connection.accountIdentifier : undefined,
  });
  if (!built) return;

  const existing = integrations.get(toolId);
  if (!existing) {
    integrations.set(toolId, built);
    return;
  }

  integrations.set(toolId, {
    ...existing,
    ...built,
    source: existing.source === 'access_connection' ? 'access_connection' : 'both',
    status: pickStrongerStatus(existing.status, built.status),
    accountIdentifier: built.accountIdentifier || existing.accountIdentifier,
    adminContact: built.adminContact || existing.adminContact,
    connectedAt: built.connectedAt ?? existing.connectedAt,
    notes: built.notes || existing.notes,
  });
}

function pickStrongerStatus(
  a: IdamConnectionStatus,
  b: IdamConnectionStatus
): IdamConnectionStatus {
  const rank: Record<IdamConnectionStatus, number> = {
    connected: 4,
    pending: 3,
    error: 2,
    not_connected: 1,
  };
  return rank[a] >= rank[b] ? a : b;
}

export function selectPrimaryIdam(
  integrations: CustomerIdamIntegration[]
): CustomerIdamIntegration | null {
  const connected = integrations.filter((i) => i.status === 'connected');
  const pool = connected.length > 0 ? connected : integrations;
  if (pool.length === 0) return null;

  return (
    pool.find((i) => i.toolId === 'okta') ??
    pool.find((i) => i.toolId === 'microsoft-entra') ??
    pool.find((i) => i.agentRequired) ??
    pool[0]
  );
}

export function buildAgentCapabilities(integrations: CustomerIdamIntegration[]): string[] {
  const capabilities = new Set<string>([
    'heartbeat',
    'evidence_upload',
    'config_sync',
    'secure_enrollment',
  ]);

  for (const integration of integrations) {
    const definition = getIdamToolById(integration.toolId);
    if (!definition) continue;
    for (const cap of definition.agentCapabilities) {
      capabilities.add(cap);
    }
  }

  return Array.from(capabilities);
}

export function buildAgentInstallBundle(input: {
  organizationId: string;
  organizationName: string;
  platformApiUrl: string;
  enrollmentToken: string;
  bundleId: string;
  integrations: CustomerIdamIntegration[];
}): AgentInstallBundle {
  const expiresAt = new Date(Date.now() + BUNDLE_TTL_HOURS * 60 * 60 * 1000).toISOString();
  const primaryIdam = selectPrimaryIdam(input.integrations);
  const capabilities = buildAgentCapabilities(input.integrations);
  const apiUrl = input.platformApiUrl.replace(/\/$/, '');

  const installBase = `${apiUrl}/api/agents/enroll`;
  const tokenArg = input.enrollmentToken;

  return {
    bundleId: input.bundleId,
    version: BUNDLE_VERSION,
    createdAt: new Date().toISOString(),
    expiresAt,
    organizationId: input.organizationId,
    organizationName: input.organizationName,
    platformApiUrl: apiUrl,
    enrollmentToken: input.enrollmentToken,
    primaryIdam,
    idamIntegrations: input.integrations,
    agentManifest: {
      agentVersion: AGENT_VERSION,
      capabilities,
      syncIntervalMinutes: SYNC_INTERVAL_MINUTES,
      evidenceTypes: EVIDENCE_TYPES,
      idamToolIds: input.integrations.map((i) => i.toolId),
    },
    install: {
      windows: {
        scriptPath: 'scripts/complai-agent-install.ps1',
        powershell: `powershell -ExecutionPolicy Bypass -File .\\complai-agent-install.ps1 -ApiUrl "${apiUrl}" -EnrollmentToken "${tokenArg}"`,
      },
      macos: {
        scriptPath: 'scripts/complai-agent-install.sh',
        shell: `curl -fsSL "${apiUrl}/scripts/complai-agent-install.sh" | bash -s -- --api-url "${apiUrl}" --token "${tokenArg}"`,
      },
      linux: {
        scriptPath: 'scripts/complai-agent-install.sh',
        shell: `curl -fsSL "${apiUrl}/scripts/complai-agent-install.sh" | bash -s -- --api-url "${apiUrl}" --token "${tokenArg}"`,
      },
    },
  };
}

export function buildAgentConfigPayload(input: {
  agentId: string;
  organizationId: string;
  organizationName: string;
  integrations: CustomerIdamIntegration[];
  configs: Record<string, Record<string, string>>;
}): AgentConfigPayload {
  const capabilities = buildAgentCapabilities(input.integrations);

  return {
    agentId: input.agentId,
    organizationId: input.organizationId,
    organizationName: input.organizationName,
    agentVersion: AGENT_VERSION,
    syncIntervalMinutes: SYNC_INTERVAL_MINUTES,
    idamIntegrations: input.integrations.map((integration) => ({
      toolId: integration.toolId,
      toolName: integration.toolName,
      connectionMode: integration.connectionMode,
      tenantUrl: integration.tenantUrl,
      accountIdentifier: integration.accountIdentifier,
      syncCapabilities: integration.syncCapabilities,
      config: input.configs[integration.toolId] ?? {},
    })),
    evidenceTypes: EVIDENCE_TYPES,
    capabilities,
  };
}

export { AGENT_VERSION, BUNDLE_TTL_HOURS };
