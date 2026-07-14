import type { Control, ComplianceMethod, ControlDomain } from '../types';

function r155(
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
    frameworkId: 'un-r155',
    reference,
    title,
    description,
    domain,
    guidance,
    suggestedMethods,
  };
}

/** UN Regulation No. 155 — Cyber Security Management System (CSMS) and vehicle type cybersecurity. */
export const UN_R155_CONTROLS: Control[] = [
  r155(
    'r155-6-1',
    '§6',
    'CSMS certificate of compliance',
    'Obtain and maintain a Certificate of Compliance for the Cyber Security Management System from the Approval Authority.',
    'governance',
    'Submit CSMS documentation, pass authority assessment, and renew certificate every three years.',
    ['third_party_attestation', 'procedure']
  ),
  r155(
    'r155-7-2-1',
    '§7.2.1',
    'CSMS establishment and verification',
    'Establish a Cyber Security Management System and demonstrate compliance to the Approval Authority or Technical Service.',
    'governance',
    'Document systematic risk-based CSMS covering development, production, and post-production phases.',
    ['policy', 'procedure']
  ),
  r155(
    'r155-7-2-2-1a',
    '§7.2.2.1(a)',
    'Organizational cyber security processes',
    'Processes within the manufacturer organization to manage cyber security across the vehicle lifecycle.',
    'governance',
    'Define CSMS roles, governance forums, and escalation for cyber security decisions.',
    ['policy', 'procedure']
  ),
  r155(
    'r155-7-2-2-1b',
    '§7.2.2.1(b)',
    'Vehicle type risk identification',
    'Identify risks to vehicle types considering Annex 5 Part A threats and other relevant threats.',
    'risk_management',
    'Threat catalog aligned to Annex 5 Part A with traceability to each vehicle type.',
    ['procedure', 'manual_process']
  ),
  r155(
    'r155-7-2-2-1c',
    '§7.2.2.1(c)',
    'Risk assessment, categorization and treatment',
    'Assess, categorize, and treat identified cyber security risks with documented criteria.',
    'risk_management',
    'Risk treatment plans with owners, timelines, and residual risk acceptance criteria.',
    ['procedure', 'manual_process']
  ),
  r155(
    'r155-7-2-2-1d',
    '§7.2.2.1(d)',
    'Risk management verification',
    'Verify that identified risks are appropriately managed through the CSMS.',
    'risk_management',
    'Independent verification or audit of risk treatment effectiveness before type approval.',
    ['procedure', 'third_party_attestation']
  ),
  r155(
    'r155-7-2-2-1e',
    '§7.2.2.1(e)',
    'Vehicle type cyber security testing',
    'Test cyber security of vehicle types with processes appropriate to identified risks.',
    'vulnerability_management',
    'Penetration testing, fuzzing, and validation of security controls on representative builds.',
    ['technical_control', 'procedure']
  ),
  r155(
    'r155-7-2-2-1f',
    '§7.2.2.1(f)',
    'Current risk assessment',
    'Ensure risk assessments remain current as threats, architecture, and suppliers change.',
    'risk_management',
    'Trigger-based and periodic risk reassessment with version-controlled outputs.',
    ['procedure']
  ),
  r155(
    'r155-7-2-2-1g',
    '§7.2.2.1(g)',
    'Monitoring, detection and response',
    'Monitor, detect, and respond to cyber-attacks and vulnerabilities; assess ongoing effectiveness of measures.',
    'incident_response',
    'Fleet telemetry, SOC integration, vulnerability intake, and effectiveness reviews.',
    ['automated_monitoring', 'procedure']
  ),
  r155(
    'r155-7-2-2-1h',
    '§7.2.2.1(h)',
    'Attack data for analysis',
    'Provide relevant data to support analysis of attempted or successful cyber-attacks.',
    'audit_logging',
    'Forensic logging, incident evidence retention, and authority reporting workflows.',
    ['technical_control', 'procedure']
  ),
  r155(
    'r155-7-2-2-3',
    '§7.2.2.3',
    'Timely threat mitigation',
    'Mitigate cyber threats and vulnerabilities requiring manufacturer response within a reasonable timeframe.',
    'incident_response',
    'SLA-based remediation tied to risk categorization from monitoring and assessment.',
    ['procedure']
  ),
  r155(
    'r155-7-2-2-4a',
    '§7.2.2.4(a)',
    'Post-registration vehicle monitoring',
    'Include vehicles after first registration in continual cyber security monitoring.',
    'audit_logging',
    'OTA and telematics-based monitoring for in-field vehicles with privacy safeguards.',
    ['automated_monitoring', 'technical_control']
  ),
  r155(
    'r155-7-2-2-4b',
    '§7.2.2.4(b)',
    'Vehicle data threat detection',
    'Analyse and detect threats, vulnerabilities, and attacks from vehicle data and logs respecting owner privacy.',
    'audit_logging',
    'Privacy-by-design analytics with consent and data minimization for driver/owner data.',
    ['technical_control', 'policy']
  ),
  r155(
    'r155-7-2-2-5',
    '§7.2.2.5',
    'Supplier and service provider dependencies',
    'Manage cyber security dependencies with contracted suppliers, service providers, and sub-organizations.',
    'vendor_management',
    'Supplier security requirements, audits, and contractual flow-down of CSMS obligations.',
    ['contractual', 'procedure']
  ),
  r155(
    'r155-7-3-2',
    '§7.3.2',
    'Supplier-related risks per vehicle type',
    'Identify and manage supplier-related cyber security risks for the vehicle type under approval.',
    'vendor_management',
    'Supplier risk register per vehicle type with component-level security evidence.',
    ['procedure', 'contractual']
  ),
  r155(
    'r155-7-3-3',
    '§7.3.3',
    'Exhaustive vehicle type risk assessment',
    'Perform exhaustive risk assessment covering elements, interactions, and external systems including Annex 5 Part A.',
    'risk_management',
    'TARA per vehicle type with system interaction diagrams and external interface analysis.',
    ['procedure', 'manual_process']
  ),
  r155(
    'r155-7-3-4',
    '§7.3.4',
    'Annex 5 mitigations implementation',
    'Implement proportionate mitigations including relevant Annex 5 Part B and Part C measures or justified alternatives.',
    'change_management',
    'Mitigation traceability matrix linking threats to Part B/C controls or equivalent measures.',
    ['technical_control', 'procedure']
  ),
  r155(
    'r155-7-3-5',
    '§7.3.5',
    'Aftermarket software environments',
    'Secure dedicated environments for aftermarket software, services, applications, or data on the vehicle type.',
    'access_control',
    'Sandboxing, signing, and isolation for third-party apps and services on connected vehicles.',
    ['technical_control']
  ),
  r155(
    'r155-7-3-6',
    '§7.3.6',
    'Pre-approval security testing',
    'Perform appropriate and sufficient testing prior to type approval to verify security measure effectiveness.',
    'vulnerability_management',
    'Security validation report covering representative test campaigns before approval submission.',
    ['procedure', 'third_party_attestation']
  ),
  r155(
    'r155-7-3-7a',
    '§7.3.7(a)',
    'Detect and prevent cyber-attacks',
    'Implement measures to detect and prevent cyber-attacks against vehicles of the vehicle type.',
    'network_security',
    'IDS/IPS, secure boot, and intrusion detection on vehicle networks and ECUs.',
    ['technical_control']
  ),
  r155(
    'r155-7-3-7b',
    '§7.3.7(b)',
    'Support manufacturer monitoring',
    'Support manufacturer monitoring capability for threats, vulnerabilities, and attacks relevant to the vehicle type.',
    'audit_logging',
    'Security event reporting from vehicle to back-end monitoring with tamper resistance.',
    ['technical_control', 'automated_monitoring']
  ),
  r155(
    'r155-7-3-7c',
    '§7.3.7(c)',
    'Forensic data capability',
    'Provide data forensic capability to enable analysis of attempted or successful cyber-attacks.',
    'incident_response',
    'Secure log extraction, chain of custody, and forensic tooling for field incidents.',
    ['technical_control', 'procedure']
  ),
  r155(
    'r155-7-3-8',
    '§7.3.8',
    'Cryptographic modules standards',
    'Use cryptographic modules aligned with consensus standards or justify deviations.',
    'cryptography',
    'FIPS/ISO-aligned crypto modules with documented justification for non-standard choices.',
    ['technical_control', 'policy']
  ),
  r155(
    'r155-7-4-1',
    '§7.4.1',
    'Annual monitoring reporting',
    'Report monitoring outcomes to the Approval Authority at least annually including new attacks and mitigation effectiveness.',
    'governance',
    'Annual CSMS monitoring report with attack trends, remediation status, and effectiveness confirmation.',
    ['procedure', 'manual_process']
  ),
  r155(
    'r155-a5-back-end',
    'Annex 5.A.1',
    'Back-end server threats',
    'Assess and mitigate threats to back-end servers supporting the vehicle type.',
    'network_security',
    'Cover unauthorized access, privilege abuse, and infrastructure compromise per Annex 5 Part A/C.',
    ['procedure', 'technical_control']
  ),
  r155(
    'r155-a5-communication',
    'Annex 5.A.2',
    'Communication channel threats',
    'Assess and mitigate threats to vehicle communication channels including telematics and V2X.',
    'network_security',
    'Spoofing, interception, and interference mitigations for wireless and wired channels.',
    ['technical_control']
  ),
  r155(
    'r155-a5-updates',
    'Annex 5.A.3',
    'Update procedure threats',
    'Assess and mitigate threats to software update procedures and delivery pipelines.',
    'change_management',
    'Align with UN R156 SUMS; protect update authenticity, integrity, and availability.',
    ['technical_control', 'procedure']
  ),
  r155(
    'r155-a5-human',
    'Annex 5.A.4',
    'Unintended human action threats',
    'Assess and mitigate threats from social engineering, insider actions, and accidental exposure.',
    'human_resources',
    'Security awareness, privileged access controls, and phishing-resistant processes.',
    ['training_awareness', 'procedure']
  ),
  r155(
    'r155-a5-connectivity',
    'Annex 5.A.5',
    'External connectivity threats',
    'Assess and mitigate threats via external connectivity, APIs, and third-party interfaces.',
    'network_security',
    'API security, authentication, and rate limiting for connected services.',
    ['technical_control']
  ),
  r155(
    'r155-a5-data-code',
    'Annex 5.A.6',
    'Data and code manipulation threats',
    'Assess and mitigate manipulation of vehicle parameters, firmware, and stored data.',
    'data_protection',
    'Integrity protection, signing, and secure storage for code and calibration data.',
    ['technical_control']
  ),
  r155(
    'r155-a5-components',
    'Annex 5.A.7',
    'Vehicle component threats',
    'Assess and mitigate physical and logical attacks on ECUs, telematics, diagnostics, and sensors.',
    'physical_security',
    'Secure diagnostic ports, tamper detection, and hardened ECU interfaces.',
    ['technical_control', 'procedure']
  ),
];
