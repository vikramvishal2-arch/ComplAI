export type PolicyDocumentType = 'policy' | 'procedure';

export type { FrameworkTag } from './policy-framework-mappings';
import type { FrameworkTag } from './policy-framework-mappings';

export interface PolicyTemplateDef {
  id: string;
  categoryId: string;
  title: string;
  isoReference: string;
  description: string;
  documentType: PolicyDocumentType;
  /** Override auto-mapping from isoReference when Annex A ref is not parseable */
  controlIds?: string[];
  /** Additional compliance frameworks beyond category defaults (iso27001 is always included) */
  frameworkTags?: FrameworkTag[];
}

export function getPolicyTemplateDef(id: string): PolicyTemplateDef | undefined {
  return POLICY_TEMPLATE_CATALOG.find((t) => t.id === id);
}

/** Full ISO 27001:2022 Annex A policy & procedure template catalog */
export const POLICY_TEMPLATE_CATALOG: PolicyTemplateDef[] = [
  // ── ISMS Governance (A.5.1–A.5.8, A.5.35–A.5.37) ──
  { id: 'isms-information-security', categoryId: 'governance', title: 'Information Security Policy', isoReference: 'A.5.1', description: 'Top-level ISMS policy defining security objectives and management commitment.', documentType: 'policy' },
  { id: 'isms-roles-responsibilities', categoryId: 'governance', title: 'Roles and Responsibilities Policy', isoReference: 'A.5.2', description: 'Security roles, accountability, and RACI matrix.', documentType: 'policy' },
  { id: 'isms-segregation-of-duties', categoryId: 'governance', title: 'Segregation of Duties Policy', isoReference: 'A.5.3', description: 'Preventing conflicting duties and separation of approver/executor roles.', documentType: 'policy' },
  { id: 'isms-management-responsibilities', categoryId: 'governance', title: 'Management Responsibilities Policy', isoReference: 'A.5.4', description: 'Management accountability for enforcing ISMS policies and procedures.', documentType: 'policy' },
  { id: 'isms-contact-authorities', categoryId: 'governance', title: 'Contact with Authorities Procedure', isoReference: 'A.5.5', description: 'Maintaining contacts with regulators, law enforcement, and certifying bodies.', documentType: 'procedure' },
  { id: 'isms-special-interest-groups', categoryId: 'governance', title: 'Special Interest Groups Procedure', isoReference: 'A.5.6', description: 'Participation in ISACs, forums, and professional security associations.', documentType: 'procedure' },
  { id: 'isms-independent-review', categoryId: 'governance', title: 'Independent Review Policy', isoReference: 'A.5.35', description: 'Independent assessment of ISMS performance at planned intervals.', documentType: 'policy' },
  { id: 'isms-compliance-monitoring', categoryId: 'governance', title: 'Compliance with Policies Policy', isoReference: 'A.5.36', description: 'Regular review of compliance with security policies and standards.', documentType: 'policy' },
  { id: 'isms-documented-procedures', categoryId: 'governance', title: 'Documented Operating Procedures Standard', isoReference: 'A.5.37', description: 'Requirements for SOPs, runbooks, and operational documentation.', documentType: 'procedure' },

  // ── Risk & Program Management ──
  { id: 'risk-threat-intelligence', categoryId: 'risk-program', title: 'Threat Intelligence Procedure', isoReference: 'A.5.7', description: 'Collecting, analysing, and acting on security threat intelligence.', documentType: 'procedure' },
  { id: 'risk-project-security', categoryId: 'risk-program', title: 'Information Security in Project Management Policy', isoReference: 'A.5.8', description: 'Integrating security into projects, SDLC gates, and change initiatives.', documentType: 'policy' },
  { id: 'risk-assessment', categoryId: 'risk-program', title: 'Information Security Risk Assessment Procedure', isoReference: 'ISO 27001 Cl. 6.1', description: 'Risk identification, analysis, evaluation, and treatment workflow.', documentType: 'procedure', controlIds: ['iso-a5-1'] },
  { id: 'risk-treatment', categoryId: 'risk-program', title: 'Risk Treatment and Statement of Applicability Procedure', isoReference: 'ISO 27001 Cl. 6.1.3', description: 'Documenting risk treatment decisions and SoA maintenance.', documentType: 'procedure', controlIds: ['iso-a5-1'] },

  // ── Access & Identity (A.5.15–A.5.18, A.8.2–A.8.5) ──
  { id: 'access-control', categoryId: 'access-identity', title: 'Access Control Policy', isoReference: 'A.5.15', description: 'Rules for physical and logical access based on least privilege.', documentType: 'policy' },
  { id: 'identity-management', categoryId: 'access-identity', title: 'Identity Management Procedure', isoReference: 'A.5.16', description: 'Joiner-mover-leaver identity lifecycle and provisioning.', documentType: 'procedure' },
  { id: 'password-authentication', categoryId: 'access-identity', title: 'Password and Authentication Policy', isoReference: 'A.5.17', description: 'Password complexity, MFA, and credential handling.', documentType: 'policy' },
  { id: 'access-rights-review', categoryId: 'access-identity', title: 'Access Rights Review Procedure', isoReference: 'A.5.18', description: 'Provisioning, periodic review, modification, and removal of access.', documentType: 'procedure' },
  { id: 'privileged-access', categoryId: 'access-identity', title: 'Privileged Access Management Policy', isoReference: 'A.8.2', description: 'Restricted allocation and monitoring of privileged accounts.', documentType: 'policy' },
  { id: 'information-access-restriction', categoryId: 'access-identity', title: 'Information Access Restriction Policy', isoReference: 'A.8.3', description: 'Need-to-know and role-based access to information assets.', documentType: 'policy' },
  { id: 'secure-authentication', categoryId: 'access-identity', title: 'Secure Authentication Standard', isoReference: 'A.8.5', description: 'SSO, MFA, and authentication technology requirements.', documentType: 'policy' },
  { id: 'privileged-utilities', categoryId: 'access-identity', title: 'Privileged Utility Programs Procedure', isoReference: 'A.8.18', description: 'Controlling use of admin utilities that override system controls.', documentType: 'procedure' },

  // ── Asset & Data Protection (A.5.9–A.5.14, A.7.9–A.7.10, A.8.10–A.8.12) ──
  { id: 'asset-management', categoryId: 'asset-data', title: 'Asset Management Policy', isoReference: 'A.5.9', description: 'Inventory of information assets with assigned owners.', documentType: 'policy' },
  { id: 'return-of-assets', categoryId: 'asset-data', title: 'Return of Assets Procedure', isoReference: 'A.5.11', description: 'Asset return upon role change or termination.', documentType: 'procedure' },
  { id: 'information-classification', categoryId: 'asset-data', title: 'Information Classification Policy', isoReference: 'A.5.12', description: 'Classification scheme for confidentiality, integrity, and availability.', documentType: 'policy' },
  { id: 'information-labelling', categoryId: 'asset-data', title: 'Information Labelling Procedure', isoReference: 'A.5.13', description: 'Labelling documents and systems per classification scheme.', documentType: 'procedure' },
  { id: 'information-transfer', categoryId: 'asset-data', title: 'Information Transfer Policy', isoReference: 'A.5.14', description: 'Secure transfer rules for email, file share, and third parties.', documentType: 'policy' },
  { id: 'data-retention', categoryId: 'asset-data', title: 'Data Retention and Disposal Policy', isoReference: 'A.5.10 / A.8.10', description: 'Retention schedules, deletion, and media sanitization.', documentType: 'policy', controlIds: ['iso-a5-10', 'iso-a8-10'] },
  { id: 'information-deletion', categoryId: 'asset-data', title: 'Information Deletion Procedure', isoReference: 'A.8.10', description: 'Secure deletion when data is no longer required.', documentType: 'procedure' },
  { id: 'off-premises-assets', categoryId: 'asset-data', title: 'Off-Premises Asset Protection Procedure', isoReference: 'A.7.9', description: 'Protection of laptops and mobile assets outside the office.', documentType: 'procedure' },
  { id: 'storage-media', categoryId: 'asset-data', title: 'Storage Media Handling Procedure', isoReference: 'A.7.10', description: 'Acquisition, transport, use, and disposal of removable media.', documentType: 'procedure' },
  { id: 'data-masking', categoryId: 'asset-data', title: 'Data Masking Procedure', isoReference: 'A.8.11', description: 'Masking and anonymization for non-production environments.', documentType: 'procedure' },
  { id: 'data-leakage-prevention', categoryId: 'asset-data', title: 'Data Leakage Prevention Policy', isoReference: 'A.8.12', description: 'DLP controls on endpoints, email, and cloud services.', documentType: 'policy' },
  { id: 'endpoint-devices', categoryId: 'asset-data', title: 'User Endpoint Device Policy', isoReference: 'A.8.1', description: 'MDM, encryption, and protection of laptops and mobile devices.', documentType: 'policy' },

  // ── Human Resources (A.5.10, A.6.1–A.6.8) ──
  { id: 'acceptable-use', categoryId: 'hr-people', title: 'Acceptable Use Policy', isoReference: 'A.5.10', description: 'Permitted and prohibited use of IT resources.', documentType: 'policy' },
  { id: 'personnel-screening', categoryId: 'hr-people', title: 'Personnel Screening Procedure', isoReference: 'A.6.1', description: 'Background verification proportional to role sensitivity.', documentType: 'procedure' },
  { id: 'employment-security-terms', categoryId: 'hr-people', title: 'Employment Security Terms Policy', isoReference: 'A.6.2', description: 'Security responsibilities in employment contracts.', documentType: 'policy' },
  { id: 'security-awareness', categoryId: 'hr-people', title: 'Security Awareness and Training Policy', isoReference: 'A.6.3', description: 'Mandatory training, phishing simulations, and role-based education.', documentType: 'policy' },
  { id: 'disciplinary-process', categoryId: 'hr-people', title: 'Disciplinary Process Policy', isoReference: 'A.6.4', description: 'Actions for information security policy violations.', documentType: 'policy' },
  { id: 'post-termination', categoryId: 'hr-people', title: 'Post-Termination Security Procedure', isoReference: 'A.6.5', description: 'Ongoing confidentiality and access removal after departure.', documentType: 'procedure' },
  { id: 'confidentiality-agreements', categoryId: 'hr-people', title: 'Confidentiality and NDA Policy', isoReference: 'A.6.6', description: 'NDAs for personnel and third parties with access to sensitive data.', documentType: 'policy' },
  { id: 'remote-working', categoryId: 'hr-people', title: 'Remote Working Policy', isoReference: 'A.6.7', description: 'VPN, MFA, and endpoint requirements for remote work.', documentType: 'policy' },
  { id: 'security-event-reporting', categoryId: 'hr-people', title: 'Security Event Reporting Procedure', isoReference: 'A.6.8', description: 'How personnel report suspected security events.', documentType: 'procedure' },

  // ── Physical & Environmental (A.7.1–A.7.14) ──
  { id: 'physical-security', categoryId: 'physical', title: 'Physical Security Policy', isoReference: 'A.7.1', description: 'Security perimeters and protected areas.', documentType: 'policy' },
  { id: 'physical-entry', categoryId: 'physical', title: 'Physical Entry Controls Procedure', isoReference: 'A.7.2', description: 'Badge access, visitor management, and entry logging.', documentType: 'procedure' },
  { id: 'securing-offices', categoryId: 'physical', title: 'Securing Offices and Facilities Procedure', isoReference: 'A.7.3', description: 'Design and implementation of secure office areas.', documentType: 'procedure' },
  { id: 'physical-monitoring', categoryId: 'physical', title: 'Physical Security Monitoring Procedure', isoReference: 'A.7.4', description: 'CCTV, alarms, and monitoring of secure areas.', documentType: 'procedure' },
  { id: 'environmental-threats', categoryId: 'physical', title: 'Environmental Threat Protection Procedure', isoReference: 'A.7.5', description: 'Fire, flood, and environmental hazard protections.', documentType: 'procedure' },
  { id: 'working-secure-areas', categoryId: 'physical', title: 'Working in Secure Areas Procedure', isoReference: 'A.7.6', description: 'Rules for server rooms and high-security zones.', documentType: 'procedure' },
  { id: 'clear-desk-screen', categoryId: 'physical', title: 'Clear Desk and Clear Screen Policy', isoReference: 'A.7.7', description: 'Protecting information in office and remote workspaces.', documentType: 'policy' },
  { id: 'equipment-siting', categoryId: 'physical', title: 'Equipment Siting and Protection Procedure', isoReference: 'A.7.8', description: 'Secure placement of servers and network equipment.', documentType: 'procedure' },
  { id: 'supporting-utilities', categoryId: 'physical', title: 'Supporting Utilities Procedure', isoReference: 'A.7.11', description: 'UPS, power, and utility failure protections.', documentType: 'procedure' },
  { id: 'cabling-security', categoryId: 'physical', title: 'Cabling Security Procedure', isoReference: 'A.7.12', description: 'Protection of power and data cabling.', documentType: 'procedure' },
  { id: 'equipment-maintenance', categoryId: 'physical', title: 'Equipment Maintenance Procedure', isoReference: 'A.7.13', description: 'Preventive maintenance for IT equipment.', documentType: 'procedure' },
  { id: 'equipment-disposal', categoryId: 'physical', title: 'Secure Equipment Disposal Procedure', isoReference: 'A.7.14', description: 'Data wiping and certified disposal of hardware.', documentType: 'procedure' },

  // ── Network Security (A.8.20–A.8.23) ──
  { id: 'network-security', categoryId: 'network', title: 'Network Security Policy', isoReference: 'A.8.20', description: 'Securing networks, firewalls, and network devices.', documentType: 'policy' },
  { id: 'network-services', categoryId: 'network', title: 'Network Services Security Procedure', isoReference: 'A.8.21', description: 'SLAs and security requirements for network services.', documentType: 'procedure' },
  { id: 'network-segregation', categoryId: 'network', title: 'Network Segregation Policy', isoReference: 'A.8.22', description: 'VLAN/VPC separation for prod, dev, and DMZ.', documentType: 'policy' },
  { id: 'web-filtering', categoryId: 'network', title: 'Web Filtering Policy', isoReference: 'A.8.23', description: 'Managing access to external websites and malicious content.', documentType: 'policy' },

  // ── Operations & Technical (A.8.6–A.8.9, A.8.13–A.8.19, A.8.24–A.8.34) ──
  { id: 'change-management', categoryId: 'operations', title: 'Change Management Procedure', isoReference: 'A.8.32', description: 'Formal change approval, testing, and rollback.', documentType: 'procedure' },
  { id: 'configuration-management', categoryId: 'operations', title: 'Configuration Management Procedure', isoReference: 'A.8.9', description: 'Hardening baselines and configuration drift detection.', documentType: 'procedure' },
  { id: 'backup-recovery', categoryId: 'operations', title: 'Backup and Recovery Policy', isoReference: 'A.8.13', description: 'Backup frequency, encryption, and restore testing.', documentType: 'policy' },
  { id: 'redundancy', categoryId: 'operations', title: 'Redundancy and High Availability Policy', isoReference: 'A.8.14', description: 'Redundant facilities to meet availability requirements.', documentType: 'policy' },
  { id: 'logging-monitoring', categoryId: 'operations', title: 'Logging and Monitoring Policy', isoReference: 'A.8.15–A.8.16', description: 'Audit logs, SIEM, retention, and alerting.', documentType: 'policy', controlIds: ['iso-a8-15', 'iso-a8-16'] },
  { id: 'clock-synchronization', categoryId: 'operations', title: 'Clock Synchronization Procedure', isoReference: 'A.8.17', description: 'NTP synchronization across all systems.', documentType: 'procedure' },
  { id: 'malware-protection', categoryId: 'operations', title: 'Malware Protection Policy', isoReference: 'A.8.7', description: 'EDR/anti-malware on endpoints and servers.', documentType: 'policy' },
  { id: 'vulnerability-patch', categoryId: 'operations', title: 'Vulnerability and Patch Management Policy', isoReference: 'A.8.8', description: 'Scanning, patching SLAs, and exception handling.', documentType: 'policy' },
  { id: 'capacity-management', categoryId: 'operations', title: 'Capacity Management Procedure', isoReference: 'A.8.6', description: 'Monitoring and adjusting resource capacity.', documentType: 'procedure' },
  { id: 'cryptography', categoryId: 'operations', title: 'Cryptography Policy', isoReference: 'A.8.24', description: 'Approved algorithms and key management.', documentType: 'policy' },
  { id: 'software-installation', categoryId: 'operations', title: 'Software Installation Procedure', isoReference: 'A.8.19', description: 'Controlled software installation on production systems.', documentType: 'procedure' },
  { id: 'secure-development', categoryId: 'operations', title: 'Secure Development Life Cycle Policy', isoReference: 'A.8.25', description: 'Secure SDLC with security gates and reviews.', documentType: 'policy' },
  { id: 'application-security-requirements', categoryId: 'operations', title: 'Application Security Requirements Procedure', isoReference: 'A.8.26', description: 'Security requirements in development and acquisition.', documentType: 'procedure' },
  { id: 'secure-architecture', categoryId: 'operations', title: 'Secure System Architecture Principles', isoReference: 'A.8.27', description: 'Engineering principles for secure system design.', documentType: 'policy' },
  { id: 'secure-coding', categoryId: 'operations', title: 'Secure Coding Standard', isoReference: 'A.8.28', description: 'Coding standards, SAST, and code review requirements.', documentType: 'policy' },
  { id: 'security-testing', categoryId: 'operations', title: 'Security Testing Procedure', isoReference: 'A.8.29', description: 'SAST/DAST/pen testing in the release pipeline.', documentType: 'procedure' },
  { id: 'environment-separation', categoryId: 'operations', title: 'Environment Separation Policy', isoReference: 'A.8.31', description: 'Isolation of development, test, and production.', documentType: 'policy' },
  { id: 'test-data-management', categoryId: 'operations', title: 'Test Data Management Procedure', isoReference: 'A.8.33', description: 'No production data in test; synthetic data usage.', documentType: 'procedure' },
  { id: 'source-code-access', categoryId: 'operations', title: 'Source Code Access Procedure', isoReference: 'A.8.4', description: 'Repository access, branch protection, and secrets handling.', documentType: 'procedure' },
  { id: 'audit-testing', categoryId: 'operations', title: 'Audit Testing Protection Procedure', isoReference: 'A.8.34', description: 'Planning audit tests to minimize production impact.', documentType: 'procedure' },

  // ── Third-Party & Supplier (A.5.19–A.5.23, A.8.30) ──
  { id: 'vendor-security', categoryId: 'supplier', title: 'Third-Party Security Policy', isoReference: 'A.5.19', description: 'Managing supplier information security risks.', documentType: 'policy' },
  { id: 'supplier-agreements', categoryId: 'supplier', title: 'Supplier Security Agreements Procedure', isoReference: 'A.5.20', description: 'Security clauses in supplier contracts and agreements.', documentType: 'procedure' },
  { id: 'ict-supply-chain', categoryId: 'supplier', title: 'ICT Supply Chain Security Procedure', isoReference: 'A.5.21', description: 'Supply chain risk for ICT products and services.', documentType: 'procedure' },
  { id: 'supplier-monitoring', categoryId: 'supplier', title: 'Supplier Monitoring and Review Procedure', isoReference: 'A.5.22', description: 'Ongoing monitoring of supplier security practices.', documentType: 'procedure' },
  { id: 'cloud-services', categoryId: 'supplier', title: 'Cloud Services Security Policy', isoReference: 'A.5.23', description: 'Acquisition, use, management, and exit from cloud services.', documentType: 'policy' },
  { id: 'outsourced-development', categoryId: 'supplier', title: 'Outsourced Development Procedure', isoReference: 'A.8.30', description: 'Directing and reviewing outsourced system development.', documentType: 'procedure' },

  // ── Incident Response & Continuity (A.5.24–A.5.30) ──
  { id: 'incident-response-plan', categoryId: 'incident-bc', title: 'Incident Response Policy', isoReference: 'A.5.24', description: 'IR planning, roles, escalation, and communication.', documentType: 'policy', controlIds: ['iso-a5-24'] },
  { id: 'incident-assessment', categoryId: 'incident-bc', title: 'Security Event Assessment Procedure', isoReference: 'A.5.25', description: 'Triage criteria and incident classification.', documentType: 'procedure' },
  { id: 'incident-response', categoryId: 'incident-bc', title: 'Incident Response Procedure', isoReference: 'A.5.26', description: 'Containment, eradication, recovery runbooks.', documentType: 'procedure' },
  { id: 'incident-lessons-learned', categoryId: 'incident-bc', title: 'Lessons Learned Procedure', isoReference: 'A.5.27', description: 'Post-incident review and control improvements.', documentType: 'procedure' },
  { id: 'evidence-collection', categoryId: 'incident-bc', title: 'Digital Evidence Collection Procedure', isoReference: 'A.5.28', description: 'Chain of custody and forensic evidence handling.', documentType: 'procedure' },
  { id: 'security-during-disruption', categoryId: 'incident-bc', title: 'Information Security During Disruption Policy', isoReference: 'A.5.29', description: 'Maintaining security during business disruptions.', documentType: 'policy' },
  { id: 'business-continuity', categoryId: 'incident-bc', title: 'Business Continuity Policy', isoReference: 'A.5.29–A.5.30', description: 'BCP planning with information security requirements.', documentType: 'policy', controlIds: ['iso-a5-29', 'iso-a5-30'] },
  { id: 'ict-readiness-dr', categoryId: 'incident-bc', title: 'ICT Readiness and DR Procedure', isoReference: 'A.5.30', description: 'DR testing, failover, RTO/RPO validation.', documentType: 'procedure' },

  // ── Privacy, Legal & Compliance (A.5.31–A.5.34) ──
  { id: 'legal-regulatory', categoryId: 'privacy-legal', title: 'Legal and Regulatory Compliance Policy', isoReference: 'A.5.31', description: 'Compliance register of applicable laws and regulations.', documentType: 'policy' },
  { id: 'intellectual-property', categoryId: 'privacy-legal', title: 'Intellectual Property Protection Policy', isoReference: 'A.5.32', description: 'IP rights and software license compliance.', documentType: 'policy' },
  { id: 'records-protection', categoryId: 'privacy-legal', title: 'Records Protection Procedure', isoReference: 'A.5.33', description: 'Protecting records from loss, falsification, and unauthorized access.', documentType: 'procedure' },
  { id: 'privacy-pii', categoryId: 'privacy-legal', title: 'Privacy and PII Protection Policy', isoReference: 'A.5.34', description: 'Privacy policy, RoPA, DPIA, and data subject rights.', documentType: 'policy', frameworkTags: ['dpdp', 'gdpr', 'hipaa'] },
  { id: 'data-processing-procedure', categoryId: 'privacy-legal', title: 'Personal Data Processing Procedure', isoReference: 'A.5.34 / GDPR', description: 'Lawful basis, consent, and processing records.', documentType: 'procedure', frameworkTags: ['dpdp', 'gdpr'] },
  { id: 'dpdp-data-protection', categoryId: 'privacy-legal', title: 'DPDP Data Protection Policy', isoReference: 'A.5.34 / DPDP Act', description: 'India DPDP Act compliance: consent, notice, Data Principal rights, breach notification, and DPO obligations.', documentType: 'policy', frameworkTags: ['dpdp', 'gdpr'] },

  // ── AI Governance (ISO 42001 / EU AI Act / NIST AI RMF) ──
  { id: 'ai-governance', categoryId: 'ai-governance', title: 'AI Governance Policy', isoReference: 'ISO 42001 / A.5.1', description: 'Enterprise AI governance framework: accountability, risk appetite, inventory, and oversight aligned with EU AI Act and NIST AI RMF.', documentType: 'policy', frameworkTags: ['ai'], controlIds: ['iso-a5-1'] },
  { id: 'ai-acceptable-use', categoryId: 'ai-governance', title: 'AI Acceptable Use Policy', isoReference: 'A.5.10 / ISO 42001', description: 'Approved and prohibited AI tools, data classification mapping, and employee obligations for AI use.', documentType: 'policy', frameworkTags: ['ai'], controlIds: ['iso-a5-10'] },
  { id: 'ai-risk-management', categoryId: 'ai-governance', title: 'AI Risk Management Policy', isoReference: 'ISO 42001 / NIST AI RMF', description: 'AI risk classification, pre-deployment assessment, monitoring, and human oversight requirements.', documentType: 'policy', frameworkTags: ['ai'] },
  { id: 'ai-model-governance', categoryId: 'ai-governance', title: 'AI Model Governance Procedure', isoReference: 'ISO 42001', description: 'Model lifecycle: development, validation, deployment approval, monitoring, and retirement.', documentType: 'procedure', frameworkTags: ['ai'] },
];
