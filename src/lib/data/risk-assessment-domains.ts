import type { ControlDomain } from '../types';
import { getControlsByFramework } from './controls';
import { RISK_ASSESSMENT_PROCESS_PHASES } from './audits-demo';

export type { DomainRiskItem } from '../risk/domain-risk-item';

export type RiskAssessmentStageKey = 'identification' | 'analysis' | 'evaluation';

export type StageProgress = {
  status: 'not_started' | 'in_progress' | 'complete';
  notes: string;
  completedAt: string | null;
  checklist: Record<string, boolean>;
};

export type RiskAssessmentDomainDef = {
  key: string;
  name: string;
  owner: string;
  controlDomains: ControlDomain[];
  keywords: string[];
  explicitRefs: string[];
};

export const RISK_ASSESSMENT_STAGE_LABELS: Record<RiskAssessmentStageKey, string> = {
  identification: '1. Risk Identification',
  analysis: '2. Risk Analysis',
  evaluation: '3. Risk Evaluation',
};

export const STAGE_CHECKLIST_ITEMS: Record<RiskAssessmentStageKey, string[]> = {
  identification: RISK_ASSESSMENT_PROCESS_PHASES[0].recommendations,
  analysis: RISK_ASSESSMENT_PROCESS_PHASES[1].recommendations,
  evaluation: RISK_ASSESSMENT_PROCESS_PHASES[2].recommendations,
};

export const RISK_ASSESSMENT_DOMAINS: RiskAssessmentDomainDef[] = [
  {
    key: 'iam',
    name: 'Identity & Access Management',
    owner: 'IAM Team',
    controlDomains: ['access_control', 'human_resources'],
    keywords: ['access', 'identity', 'authentication', 'mfa', 'sso', 'provisioning'],
    explicitRefs: ['CC6.1', 'CC6.2', 'CC6.3', 'A.5.15', 'A.5.16', 'A.5.17', 'A.5.18'],
  },
  {
    key: 'pam',
    name: 'Privilege Access Management',
    owner: 'Security Engineering',
    controlDomains: ['access_control'],
    keywords: ['privileged', 'pam', 'admin', 'elevation', 'break-glass'],
    explicitRefs: ['CC6.7', 'A.8.2', 'A.8.3'],
  },
  {
    key: 'endpoint',
    name: 'Endpoint security',
    owner: 'IT Operations',
    controlDomains: ['asset_management', 'vulnerability_management'],
    keywords: ['endpoint', 'edr', 'antivirus', 'workstation', 'laptop', 'mobile'],
    explicitRefs: ['CC6.8', 'A.8.1', 'A.8.7', 'A.8.8'],
  },
  {
    key: 'network',
    name: 'Network security',
    owner: 'Network Security',
    controlDomains: ['network_security'],
    keywords: ['network', 'firewall', 'segmentation', 'ids', 'ips', 'waf'],
    explicitRefs: ['CC6.6', 'A.8.20', 'A.8.21', 'A.8.22'],
  },
  {
    key: 'remote-access',
    name: 'Remote access',
    owner: 'IAM Team',
    controlDomains: ['network_security', 'access_control'],
    keywords: ['remote', 'vpn', 'zero trust', 'ztna'],
    explicitRefs: ['CC6.1', 'CC6.6', 'A.8.21'],
  },
  {
    key: 'infra-apps',
    name: 'Infrastructure and application services',
    owner: 'Platform Ops',
    controlDomains: ['change_management', 'asset_management'],
    keywords: ['infrastructure', 'application', 'deployment', 'change', 'configuration'],
    explicitRefs: ['CC8.1', 'A.8.9', 'A.8.25', 'A.8.26'],
  },
  {
    key: 'data-security',
    name: 'Data Security',
    owner: 'Data Protection',
    controlDomains: ['data_protection', 'cryptography'],
    keywords: ['data', 'encryption', 'classification', 'dlp', 'retention'],
    explicitRefs: ['CC6.1', 'A.5.12', 'A.5.13', 'A.8.11', 'A.8.12', 'A.8.24'],
  },
  {
    key: 'physical',
    name: 'Physical Security',
    owner: 'Facilities',
    controlDomains: ['physical_security'],
    keywords: ['physical', 'facility', 'badge', 'cctv', 'datacenter'],
    explicitRefs: ['A.7.1', 'A.7.2', 'A.7.3', 'A.7.4'],
  },
  {
    key: 'cloud',
    name: 'Cloud security',
    owner: 'Cloud Engineering',
    controlDomains: ['access_control', 'data_protection', 'governance'],
    keywords: ['cloud', 'aws', 'azure', 'gcp', 'saas', 'cspm'],
    explicitRefs: ['CC6.1', 'CC6.6', 'A.5.23', 'A.8.22'],
  },
  {
    key: 'ai-security',
    name: 'AI Security',
    owner: 'AI Governance',
    controlDomains: ['governance', 'risk_management', 'data_protection'],
    keywords: ['ai', 'machine learning', 'model', 'llm', 'genai'],
    explicitRefs: ['A.5.1', 'A.5.2', 'A.8.10'],
  },
  {
    key: 'logging-monitoring',
    name: 'Logging & Monitoring',
    owner: 'SOC Lead',
    controlDomains: ['audit_logging'],
    keywords: ['log', 'monitor', 'siem', 'alert', 'audit trail'],
    explicitRefs: ['CC7.2', 'CC7.3', 'CC7.4', 'A.8.15', 'A.8.16'],
  },
  {
    key: 'backup',
    name: 'Backup Management',
    owner: 'Platform Ops',
    controlDomains: ['business_continuity', 'asset_management'],
    keywords: ['backup', 'restore', 'snapshot', 'replication'],
    explicitRefs: ['A.8.13', 'A.8.14'],
  },
  {
    key: 'incident-response',
    name: 'Incident Response',
    owner: 'SOC Lead',
    controlDomains: ['incident_response'],
    keywords: ['incident', 'response', 'breach', 'forensic', 'playbook'],
    explicitRefs: ['CC7.3', 'CC7.4', 'CC7.5', 'A.5.24', 'A.5.25', 'A.5.26'],
  },
  {
    key: 'bcp',
    name: 'Business continuity and Resilience',
    owner: 'Business Continuity',
    controlDomains: ['business_continuity'],
    keywords: ['continuity', 'disaster', 'recovery', 'resilience', 'rto', 'rpo'],
    explicitRefs: ['A.5.29', 'A.5.30', 'A.8.13', 'A.8.14'],
  },
  {
    key: 'user-training-awareness',
    name: 'User training and Awareness',
    owner: 'Security Awareness',
    controlDomains: ['human_resources', 'governance'],
    keywords: [
      'training',
      'awareness',
      'phishing',
      'education',
      'onboarding',
      'security culture',
      'competence',
    ],
    explicitRefs: ['CC1.1', 'CC1.4', 'CC2.1', 'A.5.4', 'A.5.10', 'A.6.3', 'A.6.8'],
  },
  {
    key: 'governance',
    name: 'Governance & Compliance',
    owner: 'GRC Program',
    controlDomains: ['governance', 'risk_management'],
    keywords: ['governance', 'policy', 'compliance', 'risk register', 'audit'],
    explicitRefs: ['CC1.1', 'CC1.2', 'A.5.1', 'A.5.2', 'A.5.3'],
  },
];

export function resolveDomainControlRefs(def: RiskAssessmentDomainDef): string[] {
  const refs = new Set<string>(def.explicitRefs);
  const frameworks = ['soc2-type2', 'iso27001'];

  for (const frameworkId of frameworks) {
    for (const control of getControlsByFramework(frameworkId)) {
      const text = `${control.title} ${control.description}`.toLowerCase();
      const domainMatch = def.controlDomains.includes(control.domain);
      const keywordMatch = def.keywords.some((k) => text.includes(k.toLowerCase()));
      if (domainMatch || keywordMatch) {
        refs.add(control.reference);
      }
    }
  }

  return [...refs].sort((a, b) => a.localeCompare(b)).slice(0, 24);
}

export function defaultStageProgress(stage: RiskAssessmentStageKey): StageProgress {
  const items = STAGE_CHECKLIST_ITEMS[stage];
  return {
    status: 'not_started',
    notes: '',
    completedAt: null,
    checklist: Object.fromEntries(items.map((item, index) => [`activity-${index}`, false])),
  };
}

export function stageChecklistLabels(stage: RiskAssessmentStageKey): string[] {
  return STAGE_CHECKLIST_ITEMS[stage];
}

export function getRiskAssessmentDomainDef(key: string) {
  return RISK_ASSESSMENT_DOMAINS.find((d) => d.key === key);
}
