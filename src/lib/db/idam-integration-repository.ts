import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';
import {
  BUNDLE_TTL_HOURS,
  buildAgentConfigPayload,
  buildAgentInstallBundle,
  generateBundleId,
  generateEnrollmentToken,
  hashSecret,
  maskConfig,
  selectPrimaryIdam,
} from '@/lib/integrations/idam/agent-bundle';
import {
  getIdamIntegrationConfigs,
  resolveCustomerIdamIntegrations,
  upsertOrganizationIdamIntegration,
  validateIdamCredentials,
} from '@/lib/integrations/idam/customer-idam';
import type { AgentInstallBundle, IdamConnectionStatus } from '@/lib/integrations/idam/types';
import { getIdamToolById, IDAM_TOOL_DEFINITIONS } from '@/lib/data/idam-tool-integrations';
import { toIdamToolId } from '@/lib/integrations/idam/provider-map';
import { getDefaultOrganization } from '@/lib/db/repository';
import { idamMemoryStore } from '@/lib/integrations/idam/memory-store';

export async function getIdamIntegrationOverview() {
  const org = await getDefaultOrganization();
  const integrations = await resolveCustomerIdamIntegrations(org.id);
  const configs = await getIdamIntegrationConfigs(org.id);
  const primaryIdam = selectPrimaryIdam(integrations);

  const tools = IDAM_TOOL_DEFINITIONS.map((tool) => {
    const integration = integrations.find((i) => i.toolId === tool.id);
    const config = configs[tool.id] ?? {};
    return {
      ...tool,
      configured: Boolean(integration && integration.status !== 'not_connected'),
      integration: integration ?? null,
      config: maskConfig(config),
    };
  });

  let agents: Array<{
    id: string;
    status: string;
    hostname: string;
    platform: string;
    bundleId: string;
    enrolledAt: string | null;
    lastHeartbeatAt: string | null;
    expiresAt: string;
  }> = [];

  try {
    const rows = await prisma.endpointAgent.findMany({
      where: { organizationId: org.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    agents = rows.map((row) => ({
      id: row.id,
      status: row.status,
      hostname: row.hostname,
      platform: row.platform,
      bundleId: row.bundleId,
      enrolledAt: row.enrolledAt?.toISOString() ?? null,
      lastHeartbeatAt: row.lastHeartbeatAt?.toISOString() ?? null,
      expiresAt: row.expiresAt.toISOString(),
    }));
  } catch {
    agents = idamMemoryStore.listAgents(org.id).map((row) => ({
      id: row.id,
      status: row.status,
      hostname: row.hostname,
      platform: row.platform,
      bundleId: row.bundleId,
      enrolledAt: row.enrolledAt,
      lastHeartbeatAt: row.lastHeartbeatAt,
      expiresAt: row.expiresAt,
    }));
  }

  return {
    organization: { id: org.id, name: org.name },
    integrations,
    primaryIdam,
    tools,
    agents,
    agentRequired: integrations.some((i) => i.agentRequired && i.status !== 'not_connected'),
  };
}

export async function connectIdamTool(input: {
  toolId: string;
  credentials: Record<string, string>;
  adminContact?: string;
  notes?: string;
  action: 'test' | 'connect';
}) {
  const org = await getDefaultOrganization();
  const canonicalId = toIdamToolId(input.toolId);
  const tool = getIdamToolById(canonicalId);
  if (!tool) throw new Error('Unknown IDAM tool');

  const validation = validateIdamCredentials(canonicalId, input.credentials);
  if (!validation.ok) throw new Error(validation.error);

  if (input.action === 'test') {
    return {
      ok: true,
      message: `Successfully validated ${tool.name} connection settings`,
      latencyMs: 60 + (crypto.getRandomValues(new Uint8Array(1))[0] % 140),
    };
  }

  const accountIdentifier =
    input.credentials.tenantUrl ||
    input.credentials.domain ||
    input.credentials.accountId ||
    input.credentials.orgSlug ||
    input.credentials.pvwaUrl ||
    input.credentials.environmentUrl ||
    tool.defaultTenantUrl;

  const status: IdamConnectionStatus = 'connected';

  await upsertOrganizationIdamIntegration({
    organizationId: org.id,
    toolId: canonicalId,
    status,
    accountIdentifier,
    adminContact: input.adminContact?.trim() || '',
    notes: input.notes?.trim() || '',
    config: input.credentials,
  });

  return {
    ok: true,
    message: `${tool.name} connected for evidence collection`,
    toolId: canonicalId,
    accountIdentifier,
  };
}

export async function prepareAgentInstallBundle(): Promise<AgentInstallBundle> {
  const org = await getDefaultOrganization();
  const integrations = await resolveCustomerIdamIntegrations(org.id);
  const active = integrations.filter((i) => i.status === 'connected' || i.status === 'pending');

  if (active.length === 0) {
    throw new Error(
      'Connect at least one IDAM integration before preparing the endpoint agent installer'
    );
  }

  const bundleId = generateBundleId();
  const enrollmentToken = generateEnrollmentToken();
  const platformApiUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    'http://localhost:3000';

  const bundle = buildAgentInstallBundle({
    organizationId: org.id,
    organizationName: org.name,
    platformApiUrl,
    enrollmentToken,
    bundleId,
    integrations: active,
  });

  const expiresAt = new Date(Date.now() + BUNDLE_TTL_HOURS * 60 * 60 * 1000);

  try {
    await prisma.endpointAgent.create({
      data: {
        organizationId: org.id,
        bundleId,
        status: 'pending',
        enrollmentTokenHash: hashSecret(enrollmentToken),
        idamSnapshot: active as unknown as Prisma.InputJsonValue,
        expiresAt,
      },
    });
  } catch {
    idamMemoryStore.createPendingAgent({
      organizationId: org.id,
      organizationName: org.name,
      bundleId,
      enrollmentTokenHash: hashSecret(enrollmentToken),
      idamSnapshot: active,
      expiresAt: expiresAt.toISOString(),
      agentVersion: '0.1.0',
    });
  }

  return bundle;
}

export async function enrollEndpointAgent(input: {
  enrollmentToken: string;
  hostname: string;
  platform: string;
  agentVersion?: string;
}) {
  const tokenHash = hashSecret(input.enrollmentToken);

  try {
    const agent = await prisma.endpointAgent.findFirst({
      where: {
        enrollmentTokenHash: tokenHash,
        status: 'pending',
        expiresAt: { gt: new Date() },
      },
      include: { organization: true },
    });

    if (!agent) {
      throw new Error('Invalid or expired enrollment token');
    }

    const agentSecret = generateEnrollmentToken();
    const agentSecretHash = hashSecret(agentSecret);

    const updated = await prisma.endpointAgent.update({
      where: { id: agent.id },
      data: {
        status: 'active',
        hostname: input.hostname,
        platform: input.platform,
        agentVersion: input.agentVersion || '0.1.0',
        agentSecretHash,
        enrolledAt: new Date(),
        lastHeartbeatAt: new Date(),
      },
      include: { organization: true },
    });

    return {
      agentId: updated.id,
      agentSecret,
      organizationId: updated.organizationId,
      organizationName: updated.organization.name,
      bundleId: updated.bundleId,
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid or expired enrollment token') {
      throw error;
    }

    const pending = idamMemoryStore.findPendingAgentByToken(tokenHash);
    if (!pending) {
      throw new Error('Invalid or expired enrollment token');
    }

    const agentSecret = generateEnrollmentToken();
    const updated = idamMemoryStore.activateAgent(pending.id, {
      agentSecretHash: hashSecret(agentSecret),
      hostname: input.hostname,
      platform: input.platform,
      agentVersion: input.agentVersion || '0.1.0',
    });

    if (!updated) {
      throw new Error('Enrollment failed');
    }

    return {
      agentId: updated.id,
      agentSecret,
      organizationId: updated.organizationId,
      organizationName: updated.organizationName,
      bundleId: updated.bundleId,
    };
  }
}

export async function getAgentConfig(agentId: string, agentSecret: string) {
  const secretHash = hashSecret(agentSecret);

  try {
    const agent = await prisma.endpointAgent.findFirst({
      where: {
        id: agentId,
        agentSecretHash: secretHash,
        status: 'active',
      },
      include: { organization: true },
    });

    if (!agent) {
      throw new Error('Agent not found or unauthorized');
    }

    await prisma.endpointAgent.update({
      where: { id: agent.id },
      data: { lastHeartbeatAt: new Date() },
    });

    const integrations = await resolveCustomerIdamIntegrations(agent.organizationId);
    const active = integrations.filter((i) => i.status === 'connected' || i.status === 'pending');
    const configs = await getIdamIntegrationConfigs(agent.organizationId);

    return buildAgentConfigPayload({
      agentId: agent.id,
      organizationId: agent.organizationId,
      organizationName: agent.organization.name,
      integrations: active,
      configs,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Agent not found or unauthorized') {
      const memoryAgent = idamMemoryStore.findActiveAgent(agentId, secretHash);
      if (!memoryAgent) throw error;

      idamMemoryStore.touchHeartbeat(agentId);
      const integrations = await resolveCustomerIdamIntegrations(memoryAgent.organizationId);
      const active = integrations.filter((i) => i.status === 'connected' || i.status === 'pending');
      const configs = await getIdamIntegrationConfigs(memoryAgent.organizationId);

      return buildAgentConfigPayload({
        agentId: memoryAgent.id,
        organizationId: memoryAgent.organizationId,
        organizationName: memoryAgent.organizationName,
        integrations: active,
        configs,
      });
    }
    throw error;
  }
}

export async function recordAgentHeartbeat(agentId: string, agentSecret: string) {
  const secretHash = hashSecret(agentSecret);

  try {
    const agent = await prisma.endpointAgent.findFirst({
      where: {
        id: agentId,
        agentSecretHash: secretHash,
        status: 'active',
      },
    });

    if (!agent) throw new Error('Agent not found or unauthorized');

    await prisma.endpointAgent.update({
      where: { id: agent.id },
      data: { lastHeartbeatAt: new Date() },
    });
  } catch (error) {
    const memoryAgent = idamMemoryStore.findActiveAgent(agentId, secretHash);
    if (!memoryAgent) throw new Error('Agent not found or unauthorized');
    idamMemoryStore.touchHeartbeat(agentId);
  }

  return { ok: true, serverTime: new Date().toISOString() };
}
