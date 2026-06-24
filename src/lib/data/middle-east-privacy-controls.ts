import type { Control, ComplianceMethod, ControlDomain } from '../types';

function mePrivacy(
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
    frameworkId: 'middle-east-privacy',
    reference,
    title,
    description,
    domain,
    guidance,
    suggestedMethods,
  };
}

/**
 * Middle East & GCC Personal Data Protection — unified control set aligned with
 * UAE Federal PDPL (Decree-Law 45/2021), KSA PDPL (Royal Decree M/19),
 * Qatar Law 13/2016, Bahrain Law 30/2018, Oman Royal Decree 6/2022, and
 * Jordan Personal Data Protection Law.
 */
export const MIDDLE_EAST_PRIVACY_CONTROLS: Control[] = [
  mePrivacy(
    'me-gov-1',
    'Gov. 1',
    'Privacy governance and accountability',
    'Establish executive accountability for personal data protection, assign ownership for compliance, and maintain a privacy program aligned with applicable Middle East and GCC laws.',
    'governance',
    'Board or executive sponsor, privacy lead, and documented privacy governance charter.',
    ['policy', 'procedure']
  ),
  mePrivacy(
    'me-gov-2',
    'Gov. 2',
    'Data Protection Officer appointment',
    'Appoint a Data Protection Officer (or equivalent) where required by UAE, KSA, Qatar, Bahrain, or Oman law, with authority to monitor compliance and liaise with regulators.',
    'governance',
    'Resident or accessible DPO per jurisdiction; publish contact details in privacy notice.',
    ['policy', 'procedure']
  ),
  mePrivacy(
    'me-gov-3',
    'Gov. 3',
    'Record of processing activities (RoPA)',
    'Maintain a register of processing activities documenting purposes, categories of data and data subjects, recipients, transfers, retention, and security measures.',
    'data_protection',
    'RoPA maintained per entity/jurisdiction; update on new systems or processing.',
    ['procedure', 'manual_process']
  ),
  mePrivacy(
    'me-law-1',
    'Law. 1',
    'Lawful basis for processing',
    'Process personal data only where a lawful basis exists — consent, contract, legal obligation, vital interests, public interest, or legitimate interests as permitted under applicable national law.',
    'data_protection',
    'Document lawful basis per processing activity; map UAE/KSA/Qatar-specific grounds.',
    ['policy', 'procedure']
  ),
  mePrivacy(
    'me-law-2',
    'Law. 2',
    'Valid consent',
    'Obtain consent that is freely given, specific, informed, and unambiguous. Consent must be as easy to withdraw as to give, and separate from other terms where required.',
    'data_protection',
    'Granular consent capture; no pre-ticked boxes; consent withdrawal self-service.',
    ['technical_control', 'procedure']
  ),
  mePrivacy(
    'me-law-3',
    'Law. 3',
    'Privacy notice and transparency',
    'Provide clear privacy notices at or before collection describing identity of controller, purposes, legal basis, retention, rights, transfer destinations, and contact details.',
    'data_protection',
    'Layered notices in Arabic and English where operating in UAE/KSA; update on material changes.',
    ['policy']
  ),
  mePrivacy(
    'me-law-4',
    'Law. 4',
    'Purpose limitation and data minimisation',
    'Collect personal data adequate, relevant, and limited to what is necessary for specified, explicit, and legitimate purposes. Do not process for incompatible secondary purposes without a new basis.',
    'data_protection',
    'Data collection forms and APIs scoped to stated purpose; secondary use review process.',
    ['procedure', 'policy']
  ),
  mePrivacy(
    'me-law-5',
    'Law. 5',
    'Sensitive and special category data',
    'Apply enhanced safeguards for sensitive personal data (health, biometrics, genetic, religious, political, criminal, financial where classified sensitive) including explicit consent or legal grounds and restricted access.',
    'data_protection',
    'Inventory sensitive categories; enhanced controls per UAE Executive Regulations and KSA PDPL.',
    ['policy', 'technical_control']
  ),
  mePrivacy(
    'me-law-6',
    'Law. 6',
    'Processing of children\'s data',
    'Obtain verifiable parental or guardian consent before processing personal data of minors, and avoid profiling or direct marketing to children without lawful basis.',
    'data_protection',
    'Age verification and parental consent workflow; disable child profiling where prohibited.',
    ['technical_control', 'procedure']
  ),
  mePrivacy(
    'me-rights-1',
    'Rights 1',
    'Right of access',
    'Enable data subjects to obtain confirmation of processing and access to their personal data, including information about purposes, categories, recipients, and retention.',
    'data_protection',
    'Access request portal with identity verification; respond within jurisdiction-specific timelines.',
    ['procedure', 'manual_process']
  ),
  mePrivacy(
    'me-rights-2',
    'Rights 2',
    'Right to rectification and completion',
    'Allow data subjects to request correction of inaccurate personal data and completion of incomplete data, with propagation to processors and third parties where feasible.',
    'data_protection',
    'Correction workflow with processor notification SLA.',
    ['procedure', 'technical_control']
  ),
  mePrivacy(
    'me-rights-3',
    'Rights 3',
    'Right to erasure and restriction',
    'Erase personal data when no longer necessary, consent is withdrawn, or erasure is required by law. Restrict processing where accuracy is contested or processing is unlawful.',
    'data_protection',
    'Erasure jobs and restriction flags; processor erasure attestation.',
    ['procedure', 'technical_control']
  ),
  mePrivacy(
    'me-rights-4',
    'Rights 4',
    'Right to object and withdraw consent',
    'Honour objections to processing based on legitimate interests and enable consent withdrawal without detriment beyond lawful consequences.',
    'data_protection',
    'Objection and withdrawal channels; cease processing upon valid withdrawal.',
    ['procedure', 'technical_control']
  ),
  mePrivacy(
    'me-rights-5',
    'Rights 5',
    'Data portability',
    'Where applicable (e.g., KSA PDPL), provide personal data in a structured, commonly used, machine-readable format upon request.',
    'data_protection',
    'Export capability for account/profile data in JSON or CSV.',
    ['technical_control', 'procedure']
  ),
  mePrivacy(
    'me-rights-6',
    'Rights 6',
    'Automated decision-making and profiling',
    'Disclose automated decision-making and profiling; provide meaningful information about logic and consequences; enable human review where required.',
    'data_protection',
    'Inventory of automated decisions; opt-out or review mechanism per UAE/KSA requirements.',
    ['policy', 'procedure']
  ),
  mePrivacy(
    'me-sec-1',
    'Sec. 1',
    'Security safeguards',
    'Implement appropriate technical and organisational measures to protect personal data against unauthorised access, disclosure, alteration, or destruction.',
    'data_protection',
    'Encryption, access control, MFA, logging — align with ISO 27001 and national minimum standards.',
    ['technical_control', 'policy']
  ),
  mePrivacy(
    'me-sec-2',
    'Sec. 2',
    'Personal data breach response',
    'Maintain incident response procedures to detect, contain, and remediate personal data breaches.',
    'incident_response',
    'Breach playbooks with forensic preservation and regulator notification triggers.',
    ['procedure']
  ),
  mePrivacy(
    'me-sec-3',
    'Sec. 3',
    'Breach notification to regulators and data subjects',
    'Notify the relevant authority (e.g., UAE Data Office, SDAIA, NCSA Qatar, PDPL Bahrain) and affected data subjects of personal data breaches within prescribed timelines.',
    'incident_response',
    '72-hour or jurisdiction-specific notification workflow; subject communication templates.',
    ['procedure', 'manual_process']
  ),
  mePrivacy(
    'me-proc-1',
    'Proc. 1',
    'Data processor agreements',
    'Engage processors only under written contracts requiring confidentiality, security, sub-processor controls, audit rights, and breach notification.',
    'vendor_management',
    'DPA templates aligned with UAE PDPL Art. 15 and KSA PDPL processor requirements.',
    ['contractual']
  ),
  mePrivacy(
    'me-proc-2',
    'Proc. 2',
    'Sub-processor and vendor oversight',
    'Maintain inventory of processors and subprocessors; conduct due diligence and periodic assurance for high-risk vendors.',
    'vendor_management',
    'Vendor risk tiering; annual attestation or SOC 2 review for critical processors.',
    ['procedure', 'third_party_attestation']
  ),
  mePrivacy(
    'me-trans-1',
    'Trans. 1',
    'Cross-border transfer assessment',
    'Assess international transfers of personal data against applicable restrictions — adequacy decisions, standard contractual clauses, binding corporate rules, or explicit consent as permitted.',
    'data_protection',
    'Transfer impact assessment per destination country; map UAE/KSA transfer rules.',
    ['policy', 'procedure']
  ),
  mePrivacy(
    'me-trans-2',
    'Trans. 2',
    'Cross-border transfer safeguards',
    'Implement contractual and technical safeguards for transfers outside the UAE, KSA, or other GCC jurisdiction, including encryption and access limitations.',
    'data_protection',
    'SCCs or national equivalents; data residency controls where mandated.',
    ['contractual', 'technical_control']
  ),
  mePrivacy(
    'me-ret-1',
    'Ret. 1',
    'Retention and destruction',
    'Define retention periods aligned with legal and business requirements; securely delete or anonymise personal data when retention expires or purpose is fulfilled.',
    'data_protection',
    'Retention schedule with automated deletion; secure disposal for physical records.',
    ['procedure', 'technical_control']
  ),
  mePrivacy(
    'me-mkt-1',
    'Mkt. 1',
    'Direct marketing and communications',
    'Obtain opt-in consent for direct marketing where required; provide easy opt-out; maintain suppression lists across channels.',
    'data_protection',
    'Marketing consent flags; unsubscribe and opt-out registry.',
    ['procedure', 'technical_control']
  ),
  mePrivacy(
    'me-dpia-1',
    'DPIA 1',
    'Data Protection Impact Assessment',
    'Conduct DPIAs for high-risk processing — large-scale sensitive data, systematic monitoring, new technologies, or cross-border transfers — before processing begins.',
    'risk_management',
    'DPIA template and trigger criteria; board or DPO sign-off for high-risk activities.',
    ['procedure', 'manual_process']
  ),
  mePrivacy(
    'me-griev-1',
    'Griev. 1',
    'Complaints and grievance redressal',
    'Establish accessible channels for data subject complaints with defined resolution timelines and escalation to the relevant national regulator when unresolved.',
    'governance',
    'Complaint intake, tracking, and escalation to UAE Data Office / SDAIA / national authority.',
    ['procedure', 'manual_process']
  ),
  mePrivacy(
    'me-emp-1',
    'Emp. 1',
    'Employee and HR data processing',
    'Process employee personal data under lawful employment grounds with appropriate notices, access controls, and limits on monitoring.',
    'human_resources',
    'Employee privacy notice; lawful basis for HR processing; workplace monitoring policy.',
    ['policy', 'procedure']
  ),
  mePrivacy(
    'me-cctv-1',
    'CCTV 1',
    'CCTV and workplace monitoring',
    'Deploy CCTV and monitoring systems with signage, purpose limitation, retention limits, and access controls as required under UAE Executive Regulations and GCC guidance.',
    'physical_security',
    'CCTV policy with signage; restricted access to footage; defined retention period.',
    ['policy', 'procedure']
  ),
];
