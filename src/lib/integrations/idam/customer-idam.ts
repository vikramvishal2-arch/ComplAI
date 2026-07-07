import type { AccessConnection } from '@/lib/types';
import { getIdamToolById } from '@/lib/data/idam-tool-integrations';
import { prisma } from '@/lib/db/prisma';
import { getDefaultOrganization } from '@/lib/db/repository';
import { buildCustomerIdamIntegration, mergeAccessConnection } from './agent-bundle';
import { idamMemoryStore } from './memory-store';
import { toIdamToolId } from './provider-map';
import type { CustomerIdamIntegration, IdamConnectionStatus } from './types';

type OrganizationIntegrationRow = {
  toolId: string;
  status: string;
  accountIdentifier: string;
  adminContact: string;
  connectionMode: string;
  config: unknown;
  connectedAt: Date | null;
  notes: string;
  source: string;
};

export async function collectAccessConnectionsFromRemediations(
  organizationId: string
): Promise<AccessConnection[]> {
  const rows = await prisma.controlRemediation.findMany({
    where: { organizationId },
    select: { accessConnections: true },
  });

  const byProvider = new Map<string, AccessConnection>();

  for (const row of rows) {
    const connections = (row.accessConnections as unknown as AccessConnection[]) ?? [];
    for (const connection of connections) {
      const existing = byProvider.get(connection.providerId);
      if (!existing) {
        byProvider.set(connection.providerId, connection);
        continue;
      }
      if (connection.status === 'connected' && existing.status !== 'connected') {
        byProvider.set(connection.providerId, connection);
      }
    }
  }

  return Array.from(byProvider.values());
}

export async function listOrganizationIdamIntegrations(
  organizationId: string
): Promise<OrganizationIntegrationRow[]> {
  try {
    return await prisma.organizationIntegration.findMany({
      where: { organizationId, domain: 'idam' },
      select: {
        toolId: true,
        status: true,
        accountIdentifier: true,
        adminContact: true,
        connectionMode: true,
        config: true,
        connectedAt: true,
        notes: true,
        source: true,
      },
    });
  } catch {
    return idamMemoryStore.listOrgIntegrations(organizationId).map((row) => ({
      toolId: row.toolId,
      status: row.status,
      accountIdentifier: row.accountIdentifier,
      adminContact: row.adminContact,
      connectionMode: row.connectionMode,
      config: row.config,
      connectedAt: row.connectedAt ? new Date(row.connectedAt) : null,
      notes: row.notes,
      source: 'manual',
    }));
  }
}

export async function resolveCustomerIdamIntegrations(
  organizationId?: string
): Promise<CustomerIdamIntegration[]> {
  const org = organizationId
    ? await prisma.organization.findUnique({ where: { id: organizationId } })
    : await getDefaultOrganization();

  if (!org) return [];

  const integrations = new Map<string, CustomerIdamIntegration>();

  const [orgRows, accessConnections] = await Promise.all([
    listOrganizationIdamIntegrations(org.id),
    collectAccessConnectionsFromRemediations(org.id),
  ]);

  for (const connection of accessConnections) {
    mergeAccessConnection(integrations, connection);
  }

  for (const row of orgRows) {
    const built = buildCustomerIdamIntegration({
      toolId: row.toolId,
      status: row.status as IdamConnectionStatus,
      accountIdentifier: row.accountIdentifier,
      adminContact: row.adminContact,
      connectedAt: row.connectedAt?.toISOString() ?? null,
      notes: row.notes,
      source: 'organization',
      tenantUrl: row.accountIdentifier || undefined,
    });
    if (!built) continue;

    const existing = integrations.get(row.toolId);
    if (!existing) {
      integrations.set(row.toolId, built);
      continue;
    }

    integrations.set(row.toolId, {
      ...existing,
      ...built,
      source: existing.source === 'organization' ? 'organization' : 'both',
    });
  }

  return Array.from(integrations.values()).sort((a, b) => {
    const statusRank = (s: IdamConnectionStatus) =>
      ({ connected: 0, pending: 1, error: 2, not_connected: 3 })[s];
    const byStatus = statusRank(a.status) - statusRank(b.status);
    if (byStatus !== 0) return byStatus;
    return a.toolName.localeCompare(b.toolName);
  });
}

export async function getIdamIntegrationConfigs(
  organizationId: string
): Promise<Record<string, Record<string, string>>> {
  try {
    const rows = await prisma.organizationIntegration.findMany({
      where: { organizationId, domain: 'idam' },
      select: { toolId: true, config: true },
    });

    const configs: Record<string, Record<string, string>> = {};
    for (const row of rows) {
      const config = (row.config as Record<string, string>) ?? {};
      configs[row.toolId] = config;
    }
    return configs;
  } catch {
    return idamMemoryStore.getOrgIntegrationConfigs(organizationId);
  }
}

export function validateIdamCredentials(
  toolId: string,
  credentials: Record<string, string>
): { ok: true } | { ok: false; error: string } {
  const canonicalId = toIdamToolId(toolId);
  const tool = getIdamToolById(canonicalId);
  if (!tool) return { ok: false, error: 'Unknown IDAM tool' };

  for (const field of tool.fields) {
    if (field.required && !credentials[field.id]?.trim()) {
      return { ok: false, error: `${field.label} is required` };
    }
  }

  const urlField = credentials.tenantUrl || credentials.pvwaUrl || credentials.environmentUrl;
  if (urlField) {
    try {
      new URL(urlField.startsWith('http') ? urlField : `https://${urlField}`);
    } catch {
      return { ok: false, error: 'Tenant URL must be valid' };
    }
  }

  return { ok: true };
}

export async function upsertOrganizationIdamIntegration(input: {
  organizationId: string;
  toolId: string;
  status: IdamConnectionStatus;
  accountIdentifier: string;
  adminContact: string;
  notes: string;
  config: Record<string, string>;
}): Promise<void> {
  const canonicalId = toIdamToolId(input.toolId);
  const tool = getIdamToolById(canonicalId);
  if (!tool) throw new Error('Unknown IDAM tool');

  const connectedAt =
    input.status === 'connected' ? new Date() : input.status === 'pending' ? null : null;

  try {
    await prisma.organizationIntegration.upsert({
      where: {
        organizationId_toolId: {
          organizationId: input.organizationId,
          toolId: canonicalId,
        },
      },
      create: {
        organizationId: input.organizationId,
        toolId: canonicalId,
        domain: 'idam',
        status: input.status,
        accountIdentifier: input.accountIdentifier,
        adminContact: input.adminContact,
        connectionMode: tool.connectionMode,
        config: input.config,
        connectedAt: input.status === 'connected' ? connectedAt : null,
        notes: input.notes,
        source: 'manual',
      },
      update: {
        status: input.status,
        accountIdentifier: input.accountIdentifier,
        adminContact: input.adminContact,
        connectionMode: tool.connectionMode,
        config: input.config,
        connectedAt: input.status === 'connected' ? connectedAt ?? new Date() : null,
        notes: input.notes,
      },
    });
  } catch {
    idamMemoryStore.upsertOrgIntegration({
      organizationId: input.organizationId,
      toolId: canonicalId,
      status: input.status,
      accountIdentifier: input.accountIdentifier,
      adminContact: input.adminContact,
      connectionMode: tool.connectionMode,
      config: input.config,
      connectedAt: input.status === 'connected' ? new Date().toISOString() : null,
      notes: input.notes,
    });
  }
}
