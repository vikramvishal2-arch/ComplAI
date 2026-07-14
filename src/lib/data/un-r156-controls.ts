import type { Control, ComplianceMethod, ControlDomain } from '../types';

function r156(
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
    frameworkId: 'un-r156',
    reference,
    title,
    description,
    domain,
    guidance,
    suggestedMethods,
  };
}

/** UN Regulation No. 156 — Software Update Management System (SUMS) and vehicle software updates. */
export const UN_R156_CONTROLS: Control[] = [
  r156(
    'r156-6-1',
    '§6',
    'SUMS certificate of compliance',
    'Obtain and maintain a Certificate of Compliance for the Software Update Management System from the Approval Authority.',
    'governance',
    'Submit SUMS documentation, pass authority assessment, and renew certificate every three years.',
    ['third_party_attestation', 'procedure']
  ),
  r156(
    'r156-7-1-1-1',
    '§7.1.1.1',
    'Regulatory information documentation',
    'Document and securely hold information relevant to UN R156 and make it available to authorities on request.',
    'governance',
    'Controlled document repository with access logging for approval authority audits.',
    ['policy', 'procedure']
  ),
  r156(
    'r156-7-1-1-2',
    '§7.1.1.2',
    'Software and hardware version identification',
    'Uniquely identify all initial and updated software versions including integrity validation data and relevant hardware.',
    'asset_management',
    'Software bill of materials with cryptographic hashes for each release artifact.',
    ['technical_control', 'procedure']
  ),
  r156(
    'r156-7-1-1-3',
    '§7.1.1.3',
    'RXSWIN lifecycle management',
    'Access and update RXSWIN information before and after updates including software versions and integrity validation data.',
    'change_management',
    'RXSWIN register updated for each type-approval-relevant software change.',
    ['procedure', 'technical_control']
  ),
  r156(
    'r156-7-1-1-4',
    '§7.1.1.4',
    'RXSWIN consistency verification',
    'Verify software versions on type-approved system components match those defined by the relevant RXSWIN.',
    'change_management',
    'Pre- and post-update consistency checks against approved RXSWIN baseline.',
    ['technical_control', 'automated_monitoring']
  ),
  r156(
    'r156-7-1-1-5',
    '§7.1.1.5',
    'System interdependency identification',
    'Identify interdependencies of updated systems with other vehicle systems before release.',
    'change_management',
    'Dependency matrix and integration testing for cross-ECU impacts.',
    ['procedure', 'manual_process']
  ),
  r156(
    'r156-7-1-1-6',
    '§7.1.1.6',
    'Target vehicle identification',
    'Identify target vehicles eligible for each software update campaign.',
    'asset_management',
    'VIN/campaign targeting with configuration filters and rollout cohorts.',
    ['procedure', 'technical_control']
  ),
  r156(
    'r156-7-1-1-7',
    '§7.1.1.7',
    'Pre-issue compatibility confirmation',
    'Confirm update compatibility with target vehicle configuration before issuing the update.',
    'change_management',
    'Last-known configuration check against update prerequisites before OTA or workshop release.',
    ['technical_control', 'procedure']
  ),
  r156(
    'r156-7-1-1-8',
    '§7.1.1.8',
    'Type approval impact assessment',
    'Assess and record whether a software update affects type-approved systems or approval parameters.',
    'governance',
    'Homologation impact checklist with authority notification when type approval extension is required.',
    ['procedure', 'manual_process']
  ),
  r156(
    'r156-7-1-1-9',
    '§7.1.1.9',
    'New or altered function assessment',
    'Assess whether updates add, alter, or enable functions not present at type approval or alter legislated parameters.',
    'change_management',
    'Feature delta analysis against type approval baseline and regulatory parameter list.',
    ['procedure']
  ),
  r156(
    'r156-7-1-1-10',
    '§7.1.1.10',
    'Safe operation impact assessment',
    'Assess whether updates affect systems required for safe operation or alter vehicle functionality vs. registration state.',
    'risk_management',
    'Safety case review for functional changes before update authorization.',
    ['procedure', 'manual_process']
  ),
  r156(
    'r156-7-1-1-11',
    '§7.1.1.11',
    'Vehicle user update notification',
    'Inform vehicle users about available or required software updates.',
    'governance',
    'HMI notifications, owner app alerts, and recall/security advisory channels.',
    ['procedure']
  ),
  r156(
    'r156-7-1-1-12',
    '§7.1.1.12',
    'Authority information availability',
    'Make update documentation per §7.1.2.3–7.1.2.4 available to authorities for approval, surveillance, recalls, and PTI.',
    'governance',
    'Authority portal or secure export of RXSWIN registers and update records on demand.',
    ['procedure']
  ),
  r156(
    'r156-7-1-2-1',
    '§7.1.2.1',
    'Update process documentation',
    'Document software update processes and standards used to demonstrate regulatory compliance.',
    'governance',
    'SUMS process descriptions mapped to UN R156 clauses with version control.',
    ['policy', 'procedure']
  ),
  r156(
    'r156-7-1-2-2',
    '§7.1.2.2',
    'Pre/post update configuration records',
    'Record type-approved system configuration before and after each update including HW/SW versions and parameters.',
    'asset_management',
    'Immutable configuration snapshots linked to each applied update.',
    ['procedure', 'technical_control']
  ),
  r156(
    'r156-7-1-2-3',
    '§7.1.2.3',
    'RXSWIN auditable register',
    'Maintain an auditable register of all software relevant to each RXSWIN before and after updates with integrity validation data.',
    'audit_logging',
    'RXSWIN software register with version history and checksums per release.',
    ['procedure', 'technical_control']
  ),
  r156(
    'r156-7-1-2-4',
    '§7.1.2.4',
    'Target vehicle compatibility records',
    'Document target vehicles and confirmation of last-known configuration compatibility for each update.',
    'asset_management',
    'Campaign records with per-vehicle compatibility attestation before deployment.',
    ['procedure']
  ),
  r156(
    'r156-7-1-2-5',
    '§7.1.2.5',
    'Update documentation package',
    'Document purpose, affected systems, type approval impact, execution conditions, safety/security confirmation, and V&V results.',
    'change_management',
    'Standard update release record covering all §7.1.2.5(a)–(i) elements.',
    ['procedure', 'manual_process']
  ),
  r156(
    'r156-7-1-3-1',
    '§7.1.3.1',
    'Update package protection',
    'Protect software updates from manipulation before the update process is initiated.',
    'cryptography',
    'Signed update packages with secure distribution and key management.',
    ['technical_control']
  ),
  r156(
    'r156-7-1-3-2',
    '§7.1.3.2',
    'Update delivery system protection',
    'Protect update processes and delivery systems from compromise including development of the delivery pipeline.',
    'network_security',
    'Secure CI/CD, OTA backend hardening, and supply chain controls for update infrastructure.',
    ['technical_control', 'procedure']
  ),
  r156(
    'r156-7-1-3-3',
    '§7.1.3.3',
    'Software verification and validation',
    'Verify and validate software functionality and code used in the vehicle through appropriate processes.',
    'change_management',
    'V&V gates including static analysis, integration tests, and release sign-off.',
    ['procedure', 'technical_control']
  ),
  r156(
    'r156-7-1-4-1',
    '§7.1.4.1',
    'OTA safety during driving',
    'Assess that over-the-air updates will not impact safety when executed during driving.',
    'risk_management',
    'Conditions and technical means ensuring safe OTA execution state before download/install.',
    ['procedure', 'technical_control']
  ),
  r156(
    'r156-7-1-4-2',
    '§7.1.4.2',
    'Skilled action for complex OTA updates',
    'Ensure updates requiring skilled or complex post-update actions proceed only with qualified personnel present or in control.',
    'human_resources',
    'Workshop-only or technician-supervised flows for calibration-dependent updates.',
    ['procedure', 'training_awareness']
  ),
  r156(
    'r156-7-2-1-1',
    '§7.2.1.1',
    'Update authenticity and integrity',
    'Protect authenticity and integrity of software updates to prevent compromise and invalid updates.',
    'cryptography',
    'Code signing, secure boot chain, and rejection of unsigned or tampered packages.',
    ['technical_control']
  ),
  r156(
    'r156-7-2-1-2-1',
    '§7.2.1.2.1',
    'RXSWIN unique identification',
    'Each RXSWIN uniquely identifiable; update RXSWIN when type-approval-relevant software changes require extension or new approval.',
    'asset_management',
    'RXSWIN versioning policy tied to homologation change triggers.',
    ['procedure', 'policy']
  ),
  r156(
    'r156-7-2-1-2-2',
    '§7.2.1.2.2',
    'RXSWIN readable via OBD',
    'RXSWIN or declared software versions easily readable via standardized electronic interface (OBD port).',
    'asset_management',
    'Standardized readout of RXSWIN/software versions for inspection and market surveillance.',
    ['technical_control']
  ),
  r156(
    'r156-7-2-1-2-3',
    '§7.2.1.2.3',
    'RXSWIN unauthorized modification protection',
    'Protect RXSWIN and software versions on the vehicle against unauthorized modification; confidentially disclose means at type approval.',
    'access_control',
    'Write protection, secure storage, and tamper-evident controls for identification data.',
    ['technical_control']
  ),
  r156(
    'r156-7-2-2-1-1',
    '§7.2.2.1.1',
    'Failed update recovery',
    'Restore systems to previous version after failed or interrupted update, or place vehicle in a safe state.',
    'business_continuity',
    'Dual-bank flashing, rollback images, and safe-mode boot after update failure.',
    ['technical_control']
  ),
  r156(
    'r156-7-2-2-1-2',
    '§7.2.2.1.2',
    'Sufficient power for updates',
    'Execute updates only when the vehicle has sufficient power to complete the process including recovery.',
    'change_management',
    'Battery state checks and workshop power requirements before OTA or cable updates.',
    ['technical_control']
  ),
  r156(
    'r156-7-2-2-1-3',
    '§7.2.2.1.3',
    'Safe OTA execution state',
    'When update execution may affect safety, ensure vehicle is in a state where the update can execute safely.',
    'risk_management',
    'Parked/ignition preconditions and technical interlocks before safety-critical updates.',
    ['technical_control', 'procedure']
  ),
  r156(
    'r156-7-2-2-2',
    '§7.2.2.2',
    'OTA user information',
    'Provide vehicle users information on update purpose, changes, duration, unavailable functions, and safe execution instructions.',
    'governance',
    'Pre-update consent screen with criticality, ETA, and functional impact disclosure.',
    ['procedure']
  ),
];
