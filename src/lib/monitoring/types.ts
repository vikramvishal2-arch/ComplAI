export type CheckStatus = 'pass' | 'fail' | 'error' | 'skipped';

export interface MonitorCheckDefinition {
  id: string;
  name: string;
  description: string;
  controlId?: string;
  provider: 'aws' | 'azure';
}

export interface MonitorCheckOutcome {
  checkId: string;
  checkName: string;
  controlId?: string;
  status: CheckStatus;
  message: string;
  remediation: string;
}

export interface MonitorRunSummary {
  runId: string;
  provider: string;
  status: string;
  passed: number;
  failed: number;
  errors: number;
  summary: string;
  results: MonitorCheckOutcome[];
  startedAt: string;
  completedAt: string | null;
}
