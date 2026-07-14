import type { Control, ComplianceMethod, ControlDomain } from '../types';

function fda(
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
    frameworkId: 'fda',
    reference,
    title,
    description,
    domain,
    guidance,
    suggestedMethods,
  };
}

/** FDA — 21 CFR Part 11, medical device cybersecurity, and pharma manufacturing GxP controls. */
export const FDA_CONTROLS: Control[] = [
  fda('fda-11-10', '21 CFR 11.10', 'Electronic record controls', 'Systems must ensure authenticity, integrity, and confidentiality of electronic records.', 'data_protection', 'Validated systems with access controls and audit trails for GxP records.', ['technical_control', 'procedure']),
  fda('fda-11-30', '21 CFR 11.30', 'Record retention and retrieval', 'Electronic records must be retained and retrievable throughout the retention period.', 'governance', 'Retention schedules aligned to product and batch record requirements.', ['procedure']),
  fda('fda-11-50', '21 CFR 11.50', 'Electronic signature manifestations', 'Signed electronic records must display signer name, date/time, and meaning of signature.', 'governance', 'E-signature workflows in MES, LIMS, and quality systems.', ['technical_control']),
  fda('fda-11-100', '21 CFR 11.100', 'Electronic signature controls', 'Electronic signatures must be unique, verified, and non-repudiable.', 'access_control', 'Unique user IDs, MFA, and signature intent capture.', ['technical_control', 'policy']),
  fda('fda-11-200', '21 CFR 11.200', 'Signature linking', 'Electronic signatures must be linked to their respective records and non-reusable.', 'data_protection', 'Cryptographic binding of signatures to record versions.', ['technical_control']),
  fda('fda-cyber-1', 'Cyber Guid. 1', 'Cybersecurity risk management', 'Establish cybersecurity risk management processes across the device or manufacturing product lifecycle.', 'risk_management', 'TARA aligned to FDA premarket and postmarket cybersecurity guidance.', ['procedure', 'manual_process']),
  fda('fda-cyber-2', 'Cyber Guid. 2', 'Threat modeling and SBOM', 'Maintain software bill of materials and threat models for connected devices and OT systems.', 'asset_management', 'SBOM for device firmware, MES integrations, and supplier software.', ['procedure', 'technical_control']),
  fda('fda-cyber-3', 'Cyber Guid. 3', 'Vulnerability management', 'Monitor, assess, and remediate vulnerabilities affecting safety and data integrity.', 'vulnerability_management', 'Coordinated vulnerability disclosure and patch SLAs for critical manufacturing systems.', ['procedure', 'automated_monitoring']),
  fda('fda-cyber-4', 'Cyber Guid. 4', 'Incident response', 'Procedures for cybersecurity incidents affecting manufacturing or device safety.', 'incident_response', 'Playbooks for production line disruption and field safety corrective actions.', ['procedure']),
  fda('fda-gmp-1', 'CGMP 211.68', 'Automated equipment validation', 'Automated manufacturing equipment must be routinely calibrated, inspected, and validated.', 'change_management', 'IQ/OQ/PQ documentation for production and lab automation.', ['procedure', 'manual_process']),
  fda('fda-gmp-2', 'CGMP 211.180', 'Record availability', 'Manufacturing and distribution records must be readily available for FDA inspection.', 'audit_logging', 'Batch records, deviation logs, and electronic audit trails retained per regulation.', ['procedure']),
  fda('fda-gmp-3', 'CGMP 211.188', 'Batch production records', 'Complete batch production and control records for each drug product batch.', 'governance', 'Electronic batch records with review and approval workflows.', ['procedure', 'technical_control']),
  fda('fda-qmsr-1', 'QMSR 820', 'Quality management system', 'Establish QMS covering design, production, and post-market surveillance for devices.', 'governance', 'ISO 13485-aligned QMS integrated with FDA QMSR requirements.', ['policy', 'procedure']),
];
