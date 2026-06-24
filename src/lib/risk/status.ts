import type { RiskStatus } from '../types';

const CLOSED_RISK_STATUSES: RiskStatus[] = ['closed', 'accepted'];

export function isOpenRiskStatus(status: string): boolean {
  return !CLOSED_RISK_STATUSES.includes(status as RiskStatus);
}
