import type { VendorRiskDomain } from './vendor-assessment-types';

export const VENDOR_ASSESSMENT_TEMPLATES = [
  {
    id: 'tprm-standard',
    name: 'TPRM Standard',
    description:
      'Comprehensive third-party assessment mapped to ISO 27001 A.5.19–A.5.23 and SOC 2 CC9.x — recommended for most vendors.',
    framework: 'ISO 27001 + SOC 2',
    estimatedMinutes: 45,
  },
  {
    id: 'sig-lite',
    name: 'SIG Lite',
    description:
      'Streamlined Shared Assessments SIG Lite-style questionnaire for onboarding and tier-2/3 vendors.',
    framework: 'SIG Lite / CAIQ',
    estimatedMinutes: 25,
  },
  {
    id: 'iso27001-supplier',
    name: 'ISO 27001 Supplier',
    description: 'Focused assessment on ISO/IEC 27001:2022 supplier relationship controls (Annex A.5.19–A.5.23).',
    framework: 'ISO/IEC 27001:2022',
    estimatedMinutes: 30,
  },
  {
    id: 'privacy-focused',
    name: 'Privacy & Data Processing',
    description: 'DPA, subprocessors, data residency, and privacy program assessment for vendors handling PII.',
    framework: 'GDPR / DPDP / SOC 2 Privacy',
    estimatedMinutes: 20,
  },
] as const;

export type VendorTemplateId = (typeof VENDOR_ASSESSMENT_TEMPLATES)[number]['id'];

export function getVendorAssessmentTemplate(id: string) {
  return VENDOR_ASSESSMENT_TEMPLATES.find((t) => t.id === id) ?? VENDOR_ASSESSMENT_TEMPLATES[0];
}

/** Map checklist categories to UpGuard-style risk domains */
export function categoryToDomain(category: string): VendorRiskDomain {
  const c = category.toLowerCase();
  if (c.includes('privacy') || c.includes('subprocessor') || c.includes('residency')) return 'privacy';
  if (c.includes('contract') || c.includes('assurance') || c.includes('audit') || c.includes('monitoring'))
    return 'compliance';
  if (c.includes('bcp') || c.includes('continuity') || c.includes('exit') || c.includes('offboarding'))
    return 'resilience';
  if (c.includes('cloud') || c.includes('access') || c.includes('encryption') || c.includes('incident'))
    return 'security';
  return 'security';
}

/** Template filter: which control IDs apply per template */
export function controlAppliesToTemplate(controlId: string, templateId: string): boolean {
  if (templateId === 'tprm-standard') return true;

  if (templateId === 'sig-lite') {
    return [
      'tprm-supplier-risk',
      'tprm-contract-security',
      'tprm-certification',
      'tprm-encryption',
      'tprm-access-control',
      'tprm-incident-notification',
      'tprm-bcp-dr',
      'tprm-subprocessors',
    ].includes(controlId);
  }

  if (templateId === 'iso27001-supplier') {
    return controlId.startsWith('tprm-') && !['tprm-privacy-dpa', 'tprm-data-residency', 'tprm-ai-governance'].includes(controlId);
  }

  if (templateId === 'privacy-focused') {
    return [
      'tprm-privacy-dpa',
      'tprm-data-residency',
      'tprm-subprocessors',
      'tprm-encryption',
      'tprm-contract-security',
      'tprm-incident-notification',
    ].includes(controlId);
  }

  return true;
}
