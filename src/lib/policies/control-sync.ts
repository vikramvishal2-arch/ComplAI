import 'server-only';
import { getControlById } from '../data/controls';
import { classifyControlRag } from '../compliance/rag-status';
import type { ComplianceMethod } from '../types';
import { resolvePolicyControlIds } from './iso-control-map';
import { isApprovalMatrixComplete, parseApprovalMatrix } from './approval-matrix';
import {
  updateControlCompliance,
  createControlEvidenceFromPolicy,
  getControlCompliance,
  getControlIssues,
  getRisksByControlId,
} from '../db/repository';
import { prisma } from '../db/prisma';
import { getDefaultOrganization } from '../db/repository';

export interface PolicySyncInput {
  id: string;
  templateId?: string | null;
  isoReference?: string;
  linkedControlIds?: unknown;
  title: string;
  content: string;
  status: string;
  owner: string;
  source: string;
  storagePath?: string | null;
  originalFileName?: string | null;
  mimeType?: string | null;
  version?: string;
  documentType?: string;
  approvalMatrix?: unknown;
}

export interface PolicyControlSyncResult {
  controlId: string;
  controlReference: string;
  controlTitle: string;
  ragStatus: 'green' | 'amber' | 'red';
  complianceStatus: string;
  synced: boolean;
  message: string;
}

function parseLinkedControlIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === 'string');
}

export function isPolicyEligibleForControlSync(policy: PolicySyncInput): boolean {
  const matrix = parseApprovalMatrix(policy.approvalMatrix);
  const matrixComplete = isApprovalMatrixComplete(matrix);
  const hasDocument = Boolean(policy.storagePath) || policy.content.trim().length >= 50;

  if (policy.status === 'approved') {
    return matrixComplete && hasDocument;
  }
  if (policy.status === 'review') {
    return hasDocument;
  }
  if (policy.storagePath) return true;
  if (policy.content.trim().length >= 150) return true;
  return false;
}

export function getLinkedControlIdsForPolicy(policy: PolicySyncInput): string[] {
  const stored = parseLinkedControlIds(policy.linkedControlIds);
  return resolvePolicyControlIds({
    templateId: policy.templateId,
    isoReference: policy.isoReference,
    linkedControlIds: stored.length ? stored : undefined,
  });
}

export async function syncPolicyToControls(
  policy: PolicySyncInput
): Promise<PolicyControlSyncResult[]> {
  if (!isPolicyEligibleForControlSync(policy)) {
    return [];
  }

  const controlIds = getLinkedControlIdsForPolicy(policy);
  if (controlIds.length === 0) return [];

  const org = await getDefaultOrganization();
  const method: ComplianceMethod =
    policy.documentType === 'procedure' ? 'procedure' : 'policy';
  const owner = policy.owner.trim() || 'Information Security';
  const approach = `ISMS ${method}: ${policy.title} (v${policy.version ?? '1.0'})`;
  const evidenceNotes = `Linked policy document "${policy.title}" — auto-synced from Policies library.${
    isApprovalMatrixComplete(parseApprovalMatrix(policy.approvalMatrix))
      ? ' Approval matrix complete.'
      : ''
  }`;

  const results: PolicyControlSyncResult[] = [];

  for (const controlId of controlIds) {
    const control = getControlById(controlId);
    if (!control) continue;

    try {
      await createControlEvidenceFromPolicy(controlId, {
        id: policy.id,
        title: policy.title,
        content: policy.content,
        storagePath: policy.storagePath,
        originalFileName: policy.originalFileName,
        mimeType: policy.mimeType,
        version: policy.version,
      });

      const compliance = await updateControlCompliance(controlId, {
        status: 'implemented',
        complianceMethod: method,
        owner,
        implementationApproach: approach,
        evidenceNotes,
      });

      const [issues, risks] = await Promise.all([
        getControlIssues(controlId),
        getRisksByControlId(controlId),
      ]);
      const openIssues = issues.filter((i) => i.status === 'open' || i.status === 'in_progress');
      const openRisks = risks.filter((r) => r.status !== 'closed' && r.status !== 'accepted');

      const ragStatus = classifyControlRag({
        status: compliance.status,
        complianceMethod: compliance.complianceMethod,
        owner: compliance.owner,
        openIssueCount: openIssues.length,
        openRiskCount: openRisks.length,
      });

      results.push({
        controlId,
        controlReference: control.reference,
        controlTitle: control.title,
        ragStatus,
        complianceStatus: compliance.status,
        synced: true,
        message:
          ragStatus === 'green'
            ? 'Control marked implemented with policy evidence — green status.'
            : 'Control updated; resolve open issues/risks for green status.',
      });
    } catch (err) {
      results.push({
        controlId,
        controlReference: control.reference,
        controlTitle: control.title,
        ragStatus: 'red',
        complianceStatus: 'not_started',
        synced: false,
        message: err instanceof Error ? err.message : 'Sync failed',
      });
    }
  }

  await prisma.policy.update({
    where: { id: policy.id },
    data: {
      linkedControlIds: controlIds,
      controlsSyncedAt: new Date(),
    },
  });

  return results;
}

export async function getPolicyControlRoadmap(policy: PolicySyncInput) {
  const controlIds = getLinkedControlIdsForPolicy(policy);
  const items = await Promise.all(
    controlIds.map(async (controlId) => {
      const control = getControlById(controlId);
      if (!control) return null;
      const compliance = await getControlCompliance(controlId);
      const [issues, risks] = await Promise.all([
        getControlIssues(controlId),
        getRisksByControlId(controlId),
      ]);
      const openIssues = issues.filter((i) => i.status === 'open' || i.status === 'in_progress');
      const openRisks = risks.filter((r) => r.status !== 'closed' && r.status !== 'accepted');
      const ragStatus = classifyControlRag({
        status: compliance.status,
        complianceMethod: compliance.complianceMethod,
        owner: compliance.owner,
        openIssueCount: openIssues.length,
        openRiskCount: openRisks.length,
      });
      return {
        controlId,
        reference: control.reference,
        title: control.title,
        frameworkId: control.frameworkId,
        complianceStatus: compliance.status,
        complianceMethod: compliance.complianceMethod,
        ragStatus,
        openIssueCount: openIssues.length,
        openRiskCount: openRisks.length,
      };
    })
  );
  return items.filter(Boolean);
}

export async function getPoliciesAffectingControl(controlId: string) {
  const org = await getDefaultOrganization();
  const policies = await prisma.policy.findMany({
    where: { organizationId: org.id },
  });
  return policies.filter((p) => {
    const ids = parseLinkedControlIds(p.linkedControlIds);
    if (ids.includes(controlId)) return true;
    return getLinkedControlIdsForPolicy({
      id: p.id,
      templateId: p.templateId,
      isoReference: p.isoReference,
      linkedControlIds: p.linkedControlIds,
      title: p.title,
      content: p.content,
      status: p.status,
      owner: p.owner,
      source: p.source,
      documentType: p.documentType,
    }).includes(controlId);
  });
}
