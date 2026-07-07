import type { CustomerIdamIntegration } from './types';

type MemoryOrgIntegration = {
  organizationId: string;
  toolId: string;
  status: string;
  accountIdentifier: string;
  adminContact: string;
  connectionMode: string;
  config: Record<string, string>;
  connectedAt: string | null;
  notes: string;
};

type MemoryEndpointAgent = {
  id: string;
  organizationId: string;
  organizationName: string;
  bundleId: string;
  status: 'pending' | 'active' | 'revoked';
  enrollmentTokenHash: string;
  agentSecretHash: string | null;
  hostname: string;
  platform: string;
  agentVersion: string;
  idamSnapshot: CustomerIdamIntegration[];
  enrolledAt: string | null;
  lastHeartbeatAt: string | null;
  expiresAt: string;
  createdAt: string;
};

const orgIntegrations = new Map<string, MemoryOrgIntegration>();
const endpointAgents = new Map<string, MemoryEndpointAgent>();

function orgIntegrationKey(organizationId: string, toolId: string) {
  return `${organizationId}:${toolId}`;
}

export const idamMemoryStore = {
  listOrgIntegrations(organizationId: string): MemoryOrgIntegration[] {
    return Array.from(orgIntegrations.values()).filter((row) => row.organizationId === organizationId);
  },

  upsertOrgIntegration(row: MemoryOrgIntegration) {
    orgIntegrations.set(orgIntegrationKey(row.organizationId, row.toolId), row);
  },

  getOrgIntegrationConfigs(organizationId: string): Record<string, Record<string, string>> {
    const configs: Record<string, Record<string, string>> = {};
    for (const row of idamMemoryStore.listOrgIntegrations(organizationId)) {
      configs[row.toolId] = row.config;
    }
    return configs;
  },

  createPendingAgent(input: {
    organizationId: string;
    organizationName: string;
    bundleId: string;
    enrollmentTokenHash: string;
    idamSnapshot: CustomerIdamIntegration[];
    expiresAt: string;
    agentVersion: string;
    id?: string;
  }) {
    const id = input.id ?? `agent_${crypto.randomUUID()}`;
    const row: MemoryEndpointAgent = {
      id,
      organizationId: input.organizationId,
      organizationName: input.organizationName,
      bundleId: input.bundleId,
      status: 'pending',
      enrollmentTokenHash: input.enrollmentTokenHash,
      agentSecretHash: null,
      hostname: '',
      platform: '',
      agentVersion: input.agentVersion,
      idamSnapshot: input.idamSnapshot,
      enrolledAt: null,
      lastHeartbeatAt: null,
      expiresAt: input.expiresAt,
      createdAt: new Date().toISOString(),
    };
    endpointAgents.set(id, row);
    return row;
  },

  findPendingAgentByToken(tokenHash: string): MemoryEndpointAgent | undefined {
    const now = Date.now();
    return Array.from(endpointAgents.values()).find(
      (agent) =>
        agent.enrollmentTokenHash === tokenHash &&
        agent.status === 'pending' &&
        new Date(agent.expiresAt).getTime() > now
    );
  },

  activateAgent(id: string, input: { agentSecretHash: string; hostname: string; platform: string; agentVersion: string }) {
    const agent = endpointAgents.get(id);
    if (!agent) return null;
    const updated: MemoryEndpointAgent = {
      ...agent,
      status: 'active',
      agentSecretHash: input.agentSecretHash,
      hostname: input.hostname,
      platform: input.platform,
      agentVersion: input.agentVersion,
      enrolledAt: new Date().toISOString(),
      lastHeartbeatAt: new Date().toISOString(),
    };
    endpointAgents.set(id, updated);
    return updated;
  },

  findActiveAgent(agentId: string, secretHash: string): MemoryEndpointAgent | undefined {
    const agent = endpointAgents.get(agentId);
    if (!agent || agent.status !== 'active' || agent.agentSecretHash !== secretHash) return undefined;
    return agent;
  },

  touchHeartbeat(agentId: string) {
    const agent = endpointAgents.get(agentId);
    if (!agent) return;
    endpointAgents.set(agentId, {
      ...agent,
      lastHeartbeatAt: new Date().toISOString(),
    });
  },

  listAgents(organizationId: string): MemoryEndpointAgent[] {
    return Array.from(endpointAgents.values())
      .filter((agent) => agent.organizationId === organizationId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 20);
  },
};
