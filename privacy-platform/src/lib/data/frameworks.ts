import type { PrivacyFramework, PrivacyControl } from '../types';
import { PRIVACY_CONTROLS, getControlsForFramework, getControlsForModule } from './controls';

function countForFramework(id: string): number {
  return getControlsForFramework(id).length;
}

export const PRIVACY_FRAMEWORKS: PrivacyFramework[] = [
  {
    id: 'nist-privacy',
    name: 'NIST Privacy Framework',
    shortName: 'NIST PF',
    description:
      'NIST Privacy Framework 1.0 — Identify-P, Govern-P, Control-P, Communicate-P, and Protect-P functions for enterprise privacy risk management.',
    region: 'United States',
    version: '1.0',
    controlCount: countForFramework('nist-privacy'),
  },
  {
    id: 'iso27701',
    name: 'ISO/IEC 27701:2019',
    shortName: 'ISO 27701',
    description:
      'Privacy Information Management System (PIMS) extension to ISO 27001 — controller and processor requirements for PII.',
    region: 'Global',
    version: '2019',
    controlCount: countForFramework('iso27701'),
  },
  {
    id: 'gdpr',
    name: 'GDPR',
    shortName: 'GDPR',
    description:
      'EU General Data Protection Regulation (2016/679) — principles, rights, accountability, transfers, and breach notification.',
    region: 'European Union',
    version: '2016/679',
    controlCount: countForFramework('gdpr'),
  },
  {
    id: 'india-dpdp',
    name: 'Digital Personal Data Protection Act, 2023',
    shortName: 'DPDP Act',
    description:
      "India's Digital Personal Data Protection Act 2023 and DPDP Rules 2025 — consent, notice, fiduciary duties, and Data Principal rights.",
    region: 'India',
    version: '2023 + Rules 2025',
    controlCount: countForFramework('india-dpdp'),
  },
];

export function getFrameworkById(id: string) {
  return PRIVACY_FRAMEWORKS.find((f) => f.id === id);
}

export { getControlsForFramework, getControlsForModule };
export type { PrivacyControl };
