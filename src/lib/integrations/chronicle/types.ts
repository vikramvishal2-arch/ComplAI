import type { RagStatus } from '../../types';

export interface ChronicleDomainPosture {
  domain: string;
  label: string;
  total: number;
  green: number;
  amber: number;
  red: number;
  readinessPercent: number;
}

export interface ChroniclePriorityItem {
  controlId: string;
  reference: string;
  title: string;
  ragStatus: RagStatus;
  message: string;
}

export interface ChronicleIntelligenceReport {
  organizationName: string;
  generatedAt: string;
  connection: {
    enabled: boolean;
    configured: boolean;
    gcpProjectId: string;
    instance: string;
    region: string;
    hasCredentials: boolean;
    statusMessage: string;
  };
  frameworkActivated: boolean;
  siemReadiness: {
    totalControls: number;
    green: number;
    amber: number;
    red: number;
    readinessPercent: number;
  };
  domains: ChronicleDomainPosture[];
  priorityItems: ChroniclePriorityItem[];
  intelligenceSummary: string[];
}
