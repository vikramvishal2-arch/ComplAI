import type { Control, ComplianceMethod } from '../types';

function soc2(
  id: string,
  reference: string,
  title: string,
  description: string,
  domain: Control['domain'],
  guidance: string,
  suggestedMethods: ComplianceMethod[] = ['policy', 'technical_control', 'procedure']
): Control {
  return {
    id,
    frameworkId: 'soc2-type2',
    reference,
    title,
    description,
    domain,
    guidance,
    suggestedMethods,
  };
}

/** SOC 2 Type II — full Trust Services Criteria control catalog (Security + A/C/PI/P). */
export const SOC2_CONTROLS: Control[] = [
  // CC1 — Control Environment
  soc2('soc2-cc1-1', 'CC1.1', 'Integrity and ethical values', 'The entity demonstrates a commitment to integrity and ethical values.', 'governance', 'Define and communicate code of conduct; tone at the top.', ['policy', 'training_awareness']),
  soc2('soc2-cc1-2', 'CC1.2', 'Board independence and oversight', 'The board of directors demonstrates independence from management and exercises oversight.', 'governance', 'Document board charter, independence, and security oversight.', ['policy', 'procedure']),
  soc2('soc2-cc1-3', 'CC1.3', 'Organizational structure and authority', 'Management establishes structures, reporting lines, and appropriate authority.', 'governance', 'Org chart with security accountability defined.', ['policy', 'procedure']),
  soc2('soc2-cc1-4', 'CC1.4', 'Commitment to competence', 'The entity demonstrates commitment to attract, develop, and retain competent individuals.', 'human_resources', 'Role-based competency requirements and training plans.', ['procedure', 'training_awareness']),
  soc2('soc2-cc1-5', 'CC1.5', 'Accountability for internal control', 'The entity holds individuals accountable for internal control responsibilities.', 'governance', 'Performance goals include control responsibilities.', ['policy', 'procedure']),

  // CC2 — Communication and Information
  soc2('soc2-cc2-1', 'CC2.1', 'Internal communication of objectives', 'The entity obtains or generates and uses relevant, quality information to support internal control.', 'governance', 'Security objectives communicated internally.', ['procedure', 'training_awareness']),
  soc2('soc2-cc2-2', 'CC2.2', 'Internal communication of control changes', 'Internal communication enables personnel to understand internal control responsibilities.', 'governance', 'Notify teams of policy and control changes.', ['procedure']),
  soc2('soc2-cc2-3', 'CC2.3', 'External communication', 'The entity communicates with external parties regarding matters affecting internal control.', 'governance', 'Customer and vendor security communications defined.', ['policy', 'procedure']),

  // CC3 — Risk Assessment
  soc2('soc2-cc3-1', 'CC3.1', 'Specify suitable objectives', 'The entity specifies objectives with sufficient clarity to enable identification and assessment of risks.', 'risk_management', 'Document security objectives aligned to business.', ['procedure', 'policy']),
  soc2('soc2-cc3-2', 'CC3.2', 'Identify and analyze risk', 'The entity identifies risks to achievement of objectives and analyzes risks as a basis for determining how to manage them.', 'risk_management', 'Maintain risk register with annual assessment.', ['procedure', 'manual_process']),
  soc2('soc2-cc3-3', 'CC3.3', 'Consider fraud risk', 'The entity considers the potential for fraud in assessing risks to achievement of objectives.', 'risk_management', 'Include fraud scenarios in risk assessment.', ['procedure', 'manual_process']),
  soc2('soc2-cc3-4', 'CC3.4', 'Identify and assess changes', 'The entity identifies and assesses changes that could significantly impact the system of internal control.', 'risk_management', 'Change impact assessment for org, tech, and regulatory shifts.', ['procedure']),

  // CC4 — Monitoring Activities
  soc2('soc2-cc4-1', 'CC4.1', 'Ongoing and separate evaluations', 'The entity selects, develops, and performs ongoing and/or separate evaluations of internal control.', 'governance', 'Periodic control self-assessments and internal audit.', ['procedure', 'manual_process']),
  soc2('soc2-cc4-2', 'CC4.2', 'Communicate deficiencies', 'The entity evaluates and communicates internal control deficiencies in a timely manner.', 'governance', 'Track and remediate control deficiencies.', ['procedure']),

  // CC5 — Control Activities
  soc2('soc2-cc5-1', 'CC5.1', 'Select and develop control activities', 'The entity selects and develops control activities that contribute to mitigation of risks.', 'governance', 'Map controls to identified risks.', ['procedure', 'policy']),
  soc2('soc2-cc5-2', 'CC5.2', 'Technology general controls', 'The entity selects and develops general control activities over technology.', 'change_management', 'ITGC over infrastructure and applications.', ['technical_control', 'procedure']),
  soc2('soc2-cc5-3', 'CC5.3', 'Deploy through policies and procedures', 'The entity deploys control activities through policies and procedures.', 'governance', 'Published policies with operational procedures.', ['policy', 'procedure']),

  // CC6 — Logical and Physical Access
  soc2('soc2-cc6-1', 'CC6.1', 'Logical access security', 'The entity implements logical access security software, infrastructure, and architectures.', 'access_control', 'RBAC, least privilege, and secure authentication.', ['technical_control', 'policy']),
  soc2('soc2-cc6-2', 'CC6.2', 'User registration and authorization', 'Prior to issuing credentials and granting access, the entity registers and authorizes new users.', 'access_control', 'Formal provisioning workflow with approvals.', ['procedure', 'technical_control']),
  soc2('soc2-cc6-3', 'CC6.3', 'User removal and modification', 'The entity modifies access upon role change and removes access when no longer authorized.', 'access_control', 'Automated deprovisioning within defined SLA.', ['procedure', 'automated_monitoring']),
  soc2('soc2-cc6-4', 'CC6.4', 'Physical access restrictions', 'The entity restricts physical access to facilities and protected information assets.', 'physical_security', 'Badge access, visitor logs, and secure areas.', ['procedure', 'manual_process']),
  soc2('soc2-cc6-5', 'CC6.5', 'MFA for remote and privileged access', 'The entity discontinues logical and physical protections over physical assets only after ability to read or modify data has been removed.', 'access_control', 'Enforce MFA for remote and privileged access via IdP.', ['technical_control', 'automated_monitoring']),
  soc2('soc2-cc6-6', 'CC6.6', 'Encryption of data at rest and in transit', 'The entity implements logical access security measures to protect against threats from sources outside system boundaries.', 'cryptography', 'TLS 1.2+ in transit; AES-256 or equivalent at rest.', ['technical_control', 'policy']),
  soc2('soc2-cc6-7', 'CC6.7', 'Transmission and movement protection', 'The entity restricts the transmission, movement, and removal of information to authorized users and processes.', 'network_security', 'DLP, secure APIs, and encrypted transfers.', ['technical_control']),
  soc2('soc2-cc6-8', 'CC6.8', 'Prevent unauthorized software', 'The entity implements controls to prevent or detect and act upon unauthorized or malicious software.', 'vulnerability_management', 'Endpoint protection and software allowlisting.', ['technical_control', 'automated_monitoring']),

  // CC7 — System Operations
  soc2('soc2-cc7-1', 'CC7.1', 'Vulnerability detection', 'To meet its objectives, the entity uses detection and monitoring procedures to identify anomalies and vulnerabilities.', 'vulnerability_management', 'Regular vulnerability scanning and patch management.', ['automated_monitoring', 'procedure']),
  soc2('soc2-cc7-2', 'CC7.2', 'Security event monitoring', 'The entity monitors system components and the operation of controls to detect anomalies.', 'audit_logging', 'Centralized SIEM/logging with alerting.', ['technical_control', 'automated_monitoring']),
  soc2('soc2-cc7-3', 'CC7.3', 'Incident response', 'The entity evaluates security events to determine whether they could or have resulted in failure to meet objectives.', 'incident_response', 'Documented IR plan with defined roles.', ['procedure', 'policy']),
  soc2('soc2-cc7-4', 'CC7.4', 'Incident response execution', 'The entity responds to identified security incidents by executing a defined incident response program.', 'incident_response', 'Runbooks, escalation, and post-incident review.', ['procedure']),
  soc2('soc2-cc7-5', 'CC7.5', 'Incident recovery and remediation', 'The entity identifies, develops, and implements activities to recover from identified security incidents.', 'incident_response', 'Recovery procedures and lessons learned tracking.', ['procedure']),

  // CC8 — Change Management
  soc2('soc2-cc8-1', 'CC8.1', 'Change management', 'The entity authorizes, designs, develops, configures, documents, tests, approves, and implements changes to infrastructure and software.', 'change_management', 'PR reviews, CI/CD gates, and change tickets.', ['procedure', 'technical_control']),

  // CC9 — Risk Mitigation
  soc2('soc2-cc9-1', 'CC9.1', 'Vendor and business partner risk', 'The entity identifies, selects, and manages risks associated with vendors and business partners.', 'vendor_management', 'Vendor risk assessments and contractual clauses.', ['procedure', 'contractual']),
  soc2('soc2-cc9-2', 'CC9.2', 'Vendor monitoring', 'The entity establishes and maintains formal commitments with vendors and business partners.', 'vendor_management', 'Annual SOC 2/ISO report collection and monitoring.', ['third_party_attestation', 'procedure']),

  // Availability (A)
  soc2('soc2-a1-1', 'A1.1', 'Capacity and performance monitoring', 'The entity maintains, monitors, and evaluates current processing capacity and use of system components.', 'business_continuity', 'Capacity monitoring and auto-scaling policies.', ['technical_control', 'procedure']),
  soc2('soc2-a1-2', 'A1.2', 'Environmental protections', 'The entity authorizes, designs, develops, implements, operates, and maintains environmental protections.', 'physical_security', 'Data center environmental controls (via provider attestation).', ['third_party_attestation']),
  soc2('soc2-a1-3', 'A1.3', 'Recovery and business continuity', 'The entity tests recovery plan procedures supporting system recovery to meet availability objectives.', 'business_continuity', 'DR/BCP tested at least annually.', ['procedure', 'manual_process']),

  // Confidentiality (C)
  soc2('soc2-c1-1', 'C1.1', 'Confidential information identification', 'The entity identifies and maintains confidential information to meet entity objectives.', 'data_protection', 'Data classification scheme for confidential data.', ['policy', 'procedure']),
  soc2('soc2-c1-2', 'C1.2', 'Confidential information disposal', 'The entity disposes of confidential information to meet entity objectives.', 'data_protection', 'Secure deletion and media sanitization procedures.', ['procedure', 'technical_control']),

  // Processing Integrity (PI)
  soc2('soc2-pi1-1', 'PI1.1', 'Processing integrity policies', 'The entity obtains or generates, uses, and communicates relevant, quality information regarding processing integrity.', 'governance', 'Processing integrity requirements documented.', ['policy']),
  soc2('soc2-pi1-2', 'PI1.2', 'Input completeness and accuracy', 'The entity implements policies and procedures over system inputs to result in products, services, and reporting.', 'change_management', 'Input validation and error handling in applications.', ['technical_control', 'procedure']),
  soc2('soc2-pi1-3', 'PI1.3', 'Processing completeness and accuracy', 'The entity implements policies and procedures over system processing to result in complete, accurate, timely outputs.', 'change_management', 'Reconciliation and processing controls.', ['technical_control', 'procedure']),
  soc2('soc2-pi1-4', 'PI1.4', 'Output completeness and accuracy', 'The entity implements policies and procedures to make available or deliver output completely, accurately, and timely.', 'change_management', 'Output verification and delivery controls.', ['procedure', 'technical_control']),
  soc2('soc2-pi1-5', 'PI1.5', 'Processing integrity monitoring', 'The entity implements policies and procedures to store inputs, items in processing, and outputs completely and accurately.', 'audit_logging', 'Processing logs and exception monitoring.', ['automated_monitoring', 'technical_control']),

  // Privacy (P)
  soc2('soc2-p1-1', 'P1.1', 'Privacy notice to data subjects', 'The entity provides notice to data subjects about its privacy practices.', 'data_protection', 'Published privacy policy aligned to processing activities.', ['policy']),
  soc2('soc2-p2-1', 'P2.1', 'Choice and consent', 'The entity communicates choices available regarding collection, use, retention, disclosure, and disposal of personal information.', 'data_protection', 'Consent mechanisms where required by law.', ['policy', 'technical_control']),
  soc2('soc2-p3-1', 'P3.1', 'Personal information collection', 'Personal information is collected consistent with the entity\'s objectives.', 'data_protection', 'Data minimization at collection points.', ['policy', 'procedure']),
  soc2('soc2-p3-2', 'P3.2', 'Collection with consent and notice', 'For information requiring implicit or explicit consent, the entity communicates to data subjects.', 'data_protection', 'Consent capture with notice at collection.', ['technical_control', 'policy']),
  soc2('soc2-p4-1', 'P4.1', 'Limit use of personal information', 'The entity limits the use of personal information to identified purposes.', 'data_protection', 'Purpose limitation in policies and contracts.', ['policy']),
  soc2('soc2-p4-2', 'P4.2', 'Retention of personal information', 'The entity retains personal information consistent with objectives.', 'data_protection', 'Retention schedule aligned to legal requirements.', ['procedure', 'policy']),
  soc2('soc2-p4-3', 'P4.3', 'Secure disposal of personal information', 'The entity securely disposes of personal information.', 'data_protection', 'Secure deletion workflows for PI.', ['procedure', 'technical_control']),
  soc2('soc2-p5-1', 'P5.1', 'Data subject access requests', 'The entity grants identified and authenticated data subjects access to their personal information.', 'data_protection', 'DSAR process with identity verification.', ['procedure', 'manual_process']),
  soc2('soc2-p5-2', 'P5.2', 'Data subject correction and amendment', 'The entity corrects, amends, or appends personal information based on data subject requests.', 'data_protection', 'Correction workflow within defined timelines.', ['procedure']),
  soc2('soc2-p6-1', 'P6.1', 'Disclosure to third parties', 'The entity discloses personal information to third parties with appropriate notice and consent.', 'data_protection', 'Subprocessor list and disclosure practices.', ['policy', 'contractual']),
  soc2('soc2-p6-2', 'P6.2', 'Record of authorized disclosures', 'The entity creates and retains a record of authorized disclosures.', 'data_protection', 'Disclosure log maintained.', ['procedure']),
  soc2('soc2-p6-3', 'P6.3', 'Third-party compliance verification', 'The entity creates and retains a record of detected or reported unauthorized disclosures.', 'vendor_management', 'Verify third-party privacy commitments.', ['contractual', 'third_party_attestation']),
  soc2('soc2-p6-4', 'P6.4', 'Unauthorized disclosure response', 'The entity responds to unauthorized disclosures per applicable laws and contractual requirements.', 'incident_response', 'Privacy breach notification procedures.', ['procedure']),
  soc2('soc2-p6-5', 'P6.5', 'Third-party notification of unauthorized disclosure', 'The entity notifies affected data subjects and regulators as required.', 'incident_response', 'Regulatory and customer notification playbooks.', ['procedure']),
  soc2('soc2-p6-6', 'P6.6', 'Accounting of disclosures', 'The entity provides data subjects with an accounting of disclosures upon request.', 'data_protection', 'Disclosure accounting process.', ['procedure', 'manual_process']),
  soc2('soc2-p6-7', 'P6.7', 'Cross-border data transfer', 'The entity discloses personal information only to jurisdictions meeting privacy commitments.', 'data_protection', 'Transfer impact assessments and SCCs.', ['contractual', 'policy']),
  soc2('soc2-p7-1', 'P7.1', 'Quality of personal information', 'The entity collects and maintains accurate, up-to-date personal information.', 'data_protection', 'Data quality and correction processes.', ['procedure']),
  soc2('soc2-p8-1', 'P8.1', 'Privacy inquiry and dispute resolution', 'The entity implements a process for receiving, addressing, and resolving privacy-related inquiries and disputes.', 'governance', 'Privacy inquiry intake and resolution process.', ['procedure', 'manual_process']),
];
