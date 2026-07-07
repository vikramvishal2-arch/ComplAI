import type { IntegrationDeployment } from '@/lib/data/integration-catalog';

export type IdamConnectionStatus = 'not_connected' | 'connected' | 'pending' | 'error';
export type IdamConnectionMode = 'api' | 'agent' | 'both';
export type IdamIntegrationSource = 'organization' | 'access_connection' | 'both';

export interface CustomerIdamIntegration {
  toolId: string;
  toolName: string;
  source: IdamIntegrationSource;
  status: IdamConnectionStatus;
  deployment: IntegrationDeployment;
  accountIdentifier: string;
  tenantUrl: string;
  adminContact: string;
  connectionMode: IdamConnectionMode;
  agentRequired: boolean;
  connectedAt: string | null;
  notes: string;
  syncCapabilities: string[];
  checksProvided: string[];
}

export interface AgentInstallManifest {
  agentVersion: string;
  capabilities: string[];
  syncIntervalMinutes: number;
  evidenceTypes: string[];
  idamToolIds: string[];
}

export interface AgentInstallBundle {
  bundleId: string;
  version: string;
  createdAt: string;
  expiresAt: string;
  organizationId: string;
  organizationName: string;
  platformApiUrl: string;
  enrollmentToken: string;
  primaryIdam: CustomerIdamIntegration | null;
  idamIntegrations: CustomerIdamIntegration[];
  agentManifest: AgentInstallManifest;
  install: {
    windows: { powershell: string; scriptPath: string };
    macos: { shell: string; scriptPath: string };
    linux: { shell: string; scriptPath: string };
  };
}

export interface AgentEnrollmentRequest {
  enrollmentToken: string;
  hostname: string;
  platform: 'windows' | 'macos' | 'linux' | string;
  agentVersion?: string;
  osVersion?: string;
}

export interface AgentConfigPayload {
  agentId: string;
  organizationId: string;
  organizationName: string;
  agentVersion: string;
  syncIntervalMinutes: number;
  idamIntegrations: Array<{
    toolId: string;
    toolName: string;
    connectionMode: IdamConnectionMode;
    tenantUrl: string;
    accountIdentifier: string;
    syncCapabilities: string[];
    config: Record<string, string>;
  }>;
  evidenceTypes: string[];
  capabilities: string[];
}
