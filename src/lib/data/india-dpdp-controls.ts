import type { Control, ComplianceMethod, ControlDomain } from '../types';

function dpdp(
  id: string,
  reference: string,
  title: string,
  description: string,
  domain: ControlDomain,
  guidance: string,
  suggestedMethods: ComplianceMethod[] = ['policy', 'procedure', 'technical_control']
): Control {
  return {
    id,
    frameworkId: 'india-dpdp',
    reference,
    title,
    description,
    domain,
    guidance,
    suggestedMethods,
  };
}

/** Digital Personal Data Protection Act, 2023 (India) + DPDP Rules 2025. */
export const INDIA_DPDP_CONTROLS: Control[] = [
  dpdp(
    'dpdp-sec4',
    'Sec. 4',
    'Lawful purpose and processing grounds',
    'Personal data may be processed only for a lawful purpose based on consent of the Data Principal or certain legitimate uses prescribed under the Act.',
    'data_protection',
    'Document lawful basis (consent or legitimate use) for each processing activity.',
    ['policy', 'procedure']
  ),
  dpdp(
    'dpdp-sec5',
    'Sec. 5',
    'Notice to Data Principal',
    'Every consent request must be accompanied or preceded by a notice informing the Data Principal of personal data collected, purpose of processing, rights exercise mechanism, and complaint process to the Board.',
    'data_protection',
    'Publish DPDP-compliant privacy notice in English and optionally regional languages at collection points.',
    ['policy']
  ),
  dpdp(
    'dpdp-sec6',
    'Sec. 6',
    'Valid consent',
    'Consent must be free, specific, informed, unconditional, and given through clear affirmative action. Consent requests must be in clear and plain language.',
    'data_protection',
    'Implement consent capture with granular options; no pre-ticked boxes or bundled consent.',
    ['technical_control', 'procedure']
  ),
  dpdp(
    'dpdp-sec6-4',
    'Sec. 6(4)',
    'Consent withdrawal',
    'Data Principals have the right to withdraw consent at any time. Withdrawal must be as easy as giving consent, and processing must cease upon withdrawal.',
    'data_protection',
    'Provide self-service consent withdrawal and propagate to data processors within defined SLA.',
    ['technical_control', 'procedure']
  ),
  dpdp(
    'dpdp-sec7',
    'Sec. 7',
    'Certain legitimate uses',
    'Where processing relies on legitimate uses (e.g., voluntary provision, State functions, employment, medical emergency), ensure the use falls within prescribed grounds and is documented.',
    'data_protection',
    'Maintain register of processing activities relying on Section 7 legitimate uses.',
    ['procedure', 'policy']
  ),
  dpdp(
    'dpdp-sec8-1',
    'Sec. 8(1)',
    'Data Fiduciary accountability',
    'The Data Fiduciary is responsible for compliance with the Act irrespective of agreements or Data Principal duties, including processing undertaken by Data Processors on its behalf.',
    'governance',
    'Assign ownership for DPDP compliance program and processor oversight.',
    ['policy', 'procedure']
  ),
  dpdp(
    'dpdp-sec8-2',
    'Sec. 8(2)',
    'Data Processor contracts',
    'A Data Processor may be engaged only under a valid contract for processing personal data on behalf of the Data Fiduciary.',
    'vendor_management',
    'Execute DPDP-compliant data processing agreements with all processors and subprocessors.',
    ['contractual']
  ),
  dpdp(
    'dpdp-sec8-3',
    'Sec. 8(3)',
    'Data accuracy and completeness',
    'Where personal data is used for decisions affecting the Data Principal or disclosed to another Data Fiduciary, ensure data is accurate, complete, and consistent.',
    'data_protection',
    'Data quality checks and correction workflows for decision-making datasets.',
    ['procedure', 'technical_control']
  ),
  dpdp(
    'dpdp-sec8-4',
    'Sec. 8(4)',
    'Security safeguards',
    'Implement reasonable security safeguards to prevent personal data breach, including encryption, access controls, and monitoring as appropriate to the risk.',
    'data_protection',
    'Apply DPDP Rules 2025 minimum security controls; align with ISO 27001 where applicable.',
    ['technical_control', 'policy']
  ),
  dpdp(
    'dpdp-sec8-5',
    'Sec. 8(5)',
    'Personal data breach notification',
    'Notify the Data Protection Board of India and affected Data Principals of a personal data breach in the manner and timeframe prescribed.',
    'incident_response',
    'Breach response playbook with 72-hour Board notification and Data Principal communication.',
    ['procedure']
  ),
  dpdp(
    'dpdp-sec8-6',
    'Sec. 8(6)',
    'Erasure upon purpose completion',
    'Erase personal data when the purpose is no longer served, consent is withdrawn, or retention period expires, unless retention is required by law.',
    'data_protection',
    'Automated erasure jobs and processor erasure attestation.',
    ['procedure', 'technical_control']
  ),
  dpdp(
    'dpdp-sec8-7',
    'Sec. 8(7)',
    'Grievance redressal mechanism',
    'Establish an effective mechanism to address grievances of Data Principals regarding processing of their personal data.',
    'governance',
    'Grievance intake channel with defined resolution workflow and escalation.',
    ['procedure', 'manual_process']
  ),
  dpdp(
    'dpdp-sec8-8',
    'Sec. 8(8)',
    'Publication of contact information',
    'Publish business contact details of the Data Fiduciary and, where applicable, the Data Protection Officer for grievance redressal.',
    'governance',
    'Publish DPO/grievance contact on website and privacy notice.',
    ['policy']
  ),
  dpdp(
    'dpdp-sec9',
    'Sec. 9',
    'Processing of children\'s personal data',
    'Obtain verifiable parental consent before processing personal data of children. Do not undertake tracking, behavioural monitoring, or targeted advertising directed at children.',
    'data_protection',
    'Age verification and parental consent flow; disable child profiling and targeted ads.',
    ['technical_control', 'procedure']
  ),
  dpdp(
    'dpdp-sec10-dpo',
    'Sec. 10(a)',
    'Significant Data Fiduciary — DPO',
    'Significant Data Fiduciaries must appoint a Data Protection Officer based in India who represents the fiduciary to the Board and leads grievance redressal.',
    'governance',
    'Appoint resident DPO with board reporting line; publish contact details.',
    ['policy', 'procedure']
  ),
  dpdp(
    'dpdp-sec10-auditor',
    'Sec. 10(b)',
    'Significant Data Fiduciary — independent auditor',
    'Significant Data Fiduciaries must appoint an independent data auditor to evaluate compliance with the Act.',
    'governance',
    'Engage independent auditor for annual DPDP compliance audit.',
    ['third_party_attestation', 'manual_process']
  ),
  dpdp(
    'dpdp-sec10-dpia',
    'Sec. 10(c)(i)',
    'Significant Data Fiduciary — DPIA',
    'Significant Data Fiduciaries must undertake periodic Data Protection Impact Assessment covering rights of Data Principals, processing purposes, and risk management.',
    'risk_management',
    'Periodic DPIA for high-risk processing and material system changes.',
    ['procedure', 'manual_process']
  ),
  dpdp(
    'dpdp-sec10-audit',
    'Sec. 10(c)(ii)',
    'Significant Data Fiduciary — periodic audit',
    'Significant Data Fiduciaries must undertake periodic audit of compliance with the Act as prescribed.',
    'governance',
    'Annual internal/external audit of DPDP controls.',
    ['third_party_attestation', 'procedure']
  ),
  dpdp(
    'dpdp-sec11',
    'Sec. 11',
    'Right to access information',
    'Data Principals have the right to obtain a summary of personal data being processed and identities of Data Fiduciaries and processors with whom data has been shared.',
    'data_protection',
    'Access request workflow providing summary and sharing details within prescribed timeline.',
    ['procedure', 'manual_process']
  ),
  dpdp(
    'dpdp-sec12',
    'Sec. 12',
    'Right to correction and erasure',
    'Data Principals may request correction of inaccurate personal data and erasure of data no longer necessary for the stated purpose.',
    'data_protection',
    'Correction and erasure request process with processor propagation.',
    ['procedure', 'technical_control']
  ),
  dpdp(
    'dpdp-sec13',
    'Sec. 13',
    'Right to grievance redressal',
    'Data Principals have the right to register grievances with the Data Fiduciary and escalate to the Board if unsatisfied with the response.',
    'governance',
    'Track grievances to resolution; escalate to Board when required.',
    ['procedure']
  ),
  dpdp(
    'dpdp-sec14',
    'Sec. 14',
    'Right to nominate',
    'Data Principals may nominate another individual to exercise their rights in the event of death or incapacity.',
    'data_protection',
    'Nomination capture mechanism in account settings or privacy portal.',
    ['procedure', 'technical_control']
  ),
  dpdp(
    'dpdp-sec16',
    'Sec. 16',
    'Cross-border transfer of personal data',
    'Personal data may be transferred outside India only to countries or territories notified by the Central Government, subject to applicable conditions.',
    'data_protection',
    'Maintain transfer inventory; restrict transfers to permitted jurisdictions with contractual safeguards.',
    ['contractual', 'policy']
  ),
  dpdp(
    'dpdp-rule6',
    'Rule 6',
    'Minimum security safeguards (DPDP Rules 2025)',
    'Implement prescribed technical and organisational security measures including encryption, access control, logging, backup, vulnerability management, and incident detection.',
    'data_protection',
    'Map DPDP Rule 6 minimum controls to existing security program.',
    ['technical_control', 'policy']
  ),
  dpdp(
    'dpdp-rule8',
    'Rule 8',
    'Erasure and retention framework (DPDP Rules 2025)',
    'Define retention periods and erasure triggers when purpose is fulfilled, consent is withdrawn, or Data Principal is inactive beyond prescribed period.',
    'data_protection',
    'Retention schedule with automated erasure aligned to Rule 8.',
    ['procedure', 'technical_control']
  ),
  dpdp(
    'dpdp-rule14',
    'Rule 14',
    'Data Principal request response timelines',
    'Respond to Data Principal requests including grievance redressal within timelines prescribed under DPDP Rules (including 90-day grievance resolution).',
    'governance',
    'SLA tracking for access, correction, erasure, and grievance requests.',
    ['procedure', 'manual_process']
  ),
];
