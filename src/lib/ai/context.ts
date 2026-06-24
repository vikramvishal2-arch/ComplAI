import { CONTROLS } from '../data/controls';
import { FRAMEWORKS } from '../data/frameworks';
import {
  getActivatedFrameworkIds,
  getControlComplianceBatch,
  getOpenIssueCountByControlIds,
  getOpenRiskCountByControlIds,
  getOrganizationName,
  getControlEvidence,
} from '../store';
import { classifyControlRag } from '../compliance/rag-status';
import { createDefaultCompliance } from '../store';
import type { Control } from '../types';

function getControlsForActivated(activatedIds: string[]): Control[] {
  const set = new Set(activatedIds);
  return CONTROLS.filter((c) => set.has(c.frameworkId));
}

export async function buildOrgContext(limit = 40): Promise<string> {
  const [orgName, activatedIds] = await Promise.all([
    getOrganizationName(),
    getActivatedFrameworkIds(),
  ]);
  const controls = getControlsForActivated(activatedIds);
  const controlIds = controls.map((c) => c.id);
  const [complianceMap, issueCounts, riskCounts] = await Promise.all([
    getControlComplianceBatch(controlIds),
    getOpenIssueCountByControlIds(controlIds),
    getOpenRiskCountByControlIds(controlIds),
  ]);

  const frameworkNames = activatedIds
    .map((id) => FRAMEWORKS.find((f) => f.id === id)?.shortName ?? id)
    .join(', ');

  let green = 0;
  let amber = 0;
  let red = 0;
  const redControls: string[] = [];

  for (const control of controls) {
    const compliance = complianceMap.get(control.id) ?? createDefaultCompliance(control.id);
    const rag = classifyControlRag({
      status: compliance.status,
      complianceMethod: compliance.complianceMethod,
      owner: compliance.owner,
      openIssueCount: issueCounts.get(control.id) ?? 0,
      openRiskCount: riskCounts.get(control.id) ?? 0,
    });
    if (rag === 'green') green++;
    else if (rag === 'amber') amber++;
    else {
      red++;
      if (redControls.length < 15) {
        redControls.push(`${control.reference} ${control.title} (${control.id})`);
      }
    }
  }

  return [
    `Organization: ${orgName}`,
    `Activated frameworks: ${frameworkNames || 'none'}`,
    `Controls: ${controls.length} total — ${green} green, ${amber} amber, ${red} red`,
    redControls.length ? `Priority red controls:\n- ${redControls.join('\n- ')}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export async function buildControlContext(controlId: string): Promise<string> {
  const control = CONTROLS.find((c) => c.id === controlId);
  if (!control) throw new Error('Control not found');

  const framework = FRAMEWORKS.find((f) => f.id === control.frameworkId);
  const [complianceMap, issueCounts, riskCounts, evidence] = await Promise.all([
    getControlComplianceBatch([controlId]),
    getOpenIssueCountByControlIds([controlId]),
    getOpenRiskCountByControlIds([controlId]),
    getControlEvidence(controlId),
  ]);

  const compliance = complianceMap.get(controlId) ?? createDefaultCompliance(controlId);
  const rag = classifyControlRag({
    status: compliance.status,
    complianceMethod: compliance.complianceMethod,
    owner: compliance.owner,
    openIssueCount: issueCounts.get(controlId) ?? 0,
    openRiskCount: riskCounts.get(controlId) ?? 0,
  });

  return [
    `Control: ${control.reference} — ${control.title}`,
    `ID: ${control.id}`,
    `Framework: ${framework?.name ?? control.frameworkId}`,
    `Domain: ${control.domain}`,
    `Description: ${control.description}`,
    `Guidance: ${control.guidance}`,
    `RAG status: ${rag}`,
    `Compliance status: ${compliance.status}`,
    `Method: ${compliance.complianceMethod ?? 'not set'}`,
    `Owner: ${compliance.owner || 'unassigned'}`,
    `Implementation approach: ${compliance.implementationApproach || 'not documented'}`,
    `Evidence notes: ${compliance.evidenceNotes || 'none'}`,
    `Open issues: ${issueCounts.get(controlId) ?? 0}`,
    `Open risks: ${riskCounts.get(controlId) ?? 0}`,
    evidence.length
      ? `Uploaded evidence: ${evidence.map((e) => e.originalName).join(', ')}`
      : 'Uploaded evidence: none',
  ].join('\n');
}
