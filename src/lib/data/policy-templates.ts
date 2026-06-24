import {
  POLICY_TEMPLATE_CATALOG,
  getPolicyTemplateDef,
  type PolicyDocumentType,
  type PolicyTemplateDef,
  type FrameworkTag,
} from './policy-template-catalog';
import { buildRichTemplateContent } from './policy-template-content';
import { resolveFrameworkTags } from './policy-framework-mappings';
import { parseIsoReferenceToControlIds } from '../policies/iso-control-map';

export type { PolicyDocumentType, FrameworkTag };

export interface PolicyCategory {
  id: string;
  label: string;
  description: string;
}

export interface PolicyTemplate {
  id: string;
  categoryId: string;
  title: string;
  isoReference: string;
  description: string;
  documentType: PolicyDocumentType;
  controlIds: string[];
  frameworkTags: FrameworkTag[];
  content: string;
}

function resolveControlIds(def: PolicyTemplateDef): string[] {
  if (def.controlIds?.length) return def.controlIds;
  return parseIsoReferenceToControlIds(def.isoReference);
}

export const POLICY_CATEGORIES: PolicyCategory[] = [
  {
    id: 'governance',
    label: 'ISMS Governance',
    description: 'Core ISMS policies, management commitment, and documented procedures standard.',
  },
  {
    id: 'risk-program',
    label: 'Risk & Program Management',
    description: 'Risk assessment, threat intelligence, and security in project management.',
  },
  {
    id: 'access-identity',
    label: 'Access & Identity',
    description: 'Authentication, authorization, privileged access, and identity lifecycle.',
  },
  {
    id: 'asset-data',
    label: 'Asset & Data Protection',
    description: 'Asset inventory, classification, handling, retention, DLP, and endpoints.',
  },
  {
    id: 'hr-people',
    label: 'Human Resources & Acceptable Use',
    description: 'Screening, employment terms, awareness, remote work, and event reporting.',
  },
  {
    id: 'physical',
    label: 'Physical & Environmental',
    description: 'Facilities, perimeters, equipment, utilities, and secure disposal.',
  },
  {
    id: 'network',
    label: 'Network Security',
    description: 'Network controls, segregation, services, and web filtering.',
  },
  {
    id: 'operations',
    label: 'Operations & Technical Security',
    description: 'Change, config, backup, logging, crypto, SDLC, and vulnerability management.',
  },
  {
    id: 'supplier',
    label: 'Third-Party & Supplier',
    description: 'Vendor risk, contracts, supply chain, cloud, and outsourced development.',
  },
  {
    id: 'incident-bc',
    label: 'Incident Response & Continuity',
    description: 'Incident management, evidence, business continuity, and disaster recovery.',
  },
  {
    id: 'privacy-legal',
    label: 'Privacy, Legal & Compliance',
    description: 'Privacy, regulatory compliance, IP, DPDP/GDPR, and records protection.',
  },
  {
    id: 'ai-governance',
    label: 'AI Governance',
    description: 'AI acceptable use, model governance, risk management, and transparency aligned with EU AI Act and NIST AI RMF.',
  },
];

function buildContent(def: PolicyTemplateDef): string {
  return buildRichTemplateContent(def);
}

export const POLICY_TEMPLATES: PolicyTemplate[] = POLICY_TEMPLATE_CATALOG.map((def) => ({
  ...def,
  controlIds: resolveControlIds(def),
  frameworkTags: resolveFrameworkTags(def),
  content: buildContent(def),
}));

export function getControlIdsForTemplate(templateId: string): string[] {
  const def = getPolicyTemplateDef(templateId);
  if (!def) return [];
  return resolveControlIds(def);
}

export function getPolicyCategory(id: string): PolicyCategory | undefined {
  return POLICY_CATEGORIES.find((c) => c.id === id);
}

export function getPolicyTemplate(id: string): PolicyTemplate | undefined {
  return POLICY_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(categoryId: string): PolicyTemplate[] {
  return POLICY_TEMPLATES.filter((t) => t.categoryId === categoryId);
}

export function getTemplateCounts(): { policies: number; procedures: number; total: number } {
  const policies = POLICY_TEMPLATES.filter((t) => t.documentType === 'policy').length;
  const procedures = POLICY_TEMPLATES.filter((t) => t.documentType === 'procedure').length;
  return { policies, procedures, total: POLICY_TEMPLATES.length };
}
