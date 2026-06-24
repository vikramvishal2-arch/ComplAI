import 'server-only';
import { CONTROLS } from '../../data/controls';
import { FRAMEWORKS } from '../../data/frameworks';
import {
  getActivatedFrameworkIds,
  getControlComplianceBatch,
  getOpenIssueCountByControlIds,
  getOpenRiskCountByControlIds,
  getOrganizationName,
  createDefaultCompliance,
} from '../../store';
import { classifyControlRag } from '../../compliance/rag-status';
import { getChronicleConfig } from './config';
import type {
  ChronicleDomainPosture,
  ChronicleIntelligenceReport,
  ChroniclePriorityItem,
} from './types';
import type { RagStatus } from '../../types';

export const CHRONICLE_FRAMEWORK_ID = 'google-chronicle';

const DOMAIN_LABELS: Record<string, string> = {
  governance: 'Governance',
  access_control: 'Access Control',
  data_protection: 'Data Protection',
  asset_management: 'Log Sources',
  network_security: 'Network & Cloud',
  audit_logging: 'Logging & Search',
  vulnerability_management: 'Detection Engineering',
  risk_management: 'Threat Coverage',
  change_management: 'Alert Tuning',
  incident_response: 'Investigation & Response',
  vendor_management: 'Integrations',
  business_continuity: 'Resilience',
};

export async function buildChronicleIntelligenceReport(): Promise<ChronicleIntelligenceReport> {
  const [orgName, activatedIds, config] = await Promise.all([
    getOrganizationName(),
    getActivatedFrameworkIds(),
    Promise.resolve(getChronicleConfig()),
  ]);

  const frameworkActivated = activatedIds.includes(CHRONICLE_FRAMEWORK_ID);
  const chronicleControls = CONTROLS.filter((c) => c.frameworkId === CHRONICLE_FRAMEWORK_ID);
  const controlIds = chronicleControls.map((c) => c.id);

  let green = 0;
  let amber = 0;
  let red = 0;
  const domainMap = new Map<string, { green: number; amber: number; red: number }>();
  const priorityItems: ChroniclePriorityItem[] = [];

  if (frameworkActivated && controlIds.length > 0) {
    const [complianceMap, issueCounts, riskCounts] = await Promise.all([
      getControlComplianceBatch(controlIds),
      getOpenIssueCountByControlIds(controlIds),
      getOpenRiskCountByControlIds(controlIds),
    ]);

    for (const control of chronicleControls) {
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
      else red++;

      const bucket = domainMap.get(control.domain) ?? { green: 0, amber: 0, red: 0 };
      bucket[rag]++;
      domainMap.set(control.domain, bucket);

      if ((rag === 'red' || rag === 'amber') && priorityItems.length < 8) {
        priorityItems.push({
          controlId: control.id,
          reference: control.reference,
          title: control.title,
          ragStatus: rag,
          message:
            rag === 'red'
              ? 'Critical SecOps gap — ingestion, detection, or response control not established.'
              : 'Needs attention — complete implementation approach and evidence.',
        });
      }
    }
  }

  const totalControls = chronicleControls.length;
  const readinessPercent = totalControls ? Math.round((green / totalControls) * 100) : 0;

  const domains: ChronicleDomainPosture[] = [...domainMap.entries()].map(([domain, counts]) => {
    const total = counts.green + counts.amber + counts.red;
    return {
      domain,
      label: DOMAIN_LABELS[domain] ?? domain,
      total,
      green: counts.green,
      amber: counts.amber,
      red: counts.red,
      readinessPercent: total ? Math.round((counts.green / total) * 100) : 0,
    };
  });

  const fw = FRAMEWORKS.find((f) => f.id === CHRONICLE_FRAMEWORK_ID);

  const intelligenceSummary: string[] = [];
  if (!config.enabled) {
    intelligenceSummary.push(
      'Chronicle integration is disabled. Set CHRONICLE_ENABLED=true in .env to connect Google SecOps.'
    );
  } else if (!config.configured) {
    intelligenceSummary.push(
      'Add CHRONICLE_GCP_PROJECT_ID and CHRONICLE_INSTANCE to complete Chronicle connection setup.'
    );
  } else if (!config.hasCredentials) {
    intelligenceSummary.push(
      `Chronicle instance ${config.instance} (${config.region}) configured — add service account credentials for live API sync.`
    );
  } else {
    intelligenceSummary.push(
      `Connected to Google SecOps Chronicle — project ${config.gcpProjectId}, instance ${config.instance}.`
    );
  }

  if (!frameworkActivated) {
    intelligenceSummary.push(
      `Activate the ${fw?.shortName ?? 'Google Chronicle'} framework to track ${totalControls} SecOps controls in ComplAI.`
    );
  } else if (red > 0) {
    intelligenceSummary.push(
      `${red} Chronicle control${red === 1 ? '' : 's'} at red status — prioritize ingestion coverage and detection rule gaps.`
    );
  } else if (readinessPercent >= 80) {
    intelligenceSummary.push('Strong Chronicle SecOps posture — maintain rule tuning and purple team validation.');
  }

  let statusMessage = 'Not configured';
  if (config.enabled && config.configured && config.hasCredentials) {
    statusMessage = 'Connected (credentials configured)';
  } else if (config.enabled && config.configured) {
    statusMessage = 'Partial — add GCP service account credentials';
  } else if (config.enabled) {
    statusMessage = 'Enabled — complete project and instance settings';
  }

  return {
    organizationName: orgName,
    generatedAt: new Date().toISOString(),
    connection: {
      enabled: config.enabled,
      configured: config.configured,
      gcpProjectId: config.gcpProjectId,
      instance: config.instance,
      region: config.region,
      hasCredentials: config.hasCredentials,
      statusMessage,
    },
    frameworkActivated,
    siemReadiness: {
      totalControls,
      green,
      amber,
      red,
      readinessPercent: frameworkActivated ? readinessPercent : 0,
    },
    domains,
    priorityItems,
    intelligenceSummary,
  };
}
