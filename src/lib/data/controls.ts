import type { Control, ComplianceMethod } from '../types';
import { SOC2_CONTROLS } from './soc2-controls';
import { ISO27001_CONTROLS } from './iso27001-controls';
import { INDIA_DPDP_CONTROLS } from './india-dpdp-controls';
import { SEBI_CSCRF_CONTROLS } from './sebi-cscrf-controls';
import { MIDDLE_EAST_PRIVACY_CONTROLS } from './middle-east-privacy-controls';
import { GOOGLE_CHRONICLE_CONTROLS } from './google-chronicle-controls';
import { ISO22301_CONTROLS } from './iso22301-controls';
import { ISO31000_CONTROLS } from './iso31000-controls';
import { UN_R155_CONTROLS } from './un-r155-controls';
import { UN_R156_CONTROLS } from './un-r156-controls';
import { FDA_CONTROLS } from './fda-controls';
import { IRDAI_CONTROLS } from './irdai-controls';
import { CERT_IN_CONTROLS } from './cert-in-controls';

function c(
  id: string,
  frameworkId: string,
  reference: string,
  title: string,
  description: string,
  domain: Control['domain'],
  guidance: string,
  suggestedMethods: ComplianceMethod[] = ['policy', 'technical_control', 'procedure']
): Control {
  return { id, frameworkId, reference, title, description, domain, guidance, suggestedMethods };
}

export const CONTROLS: Control[] = [
  ...SOC2_CONTROLS,
  ...ISO27001_CONTROLS,
  ...INDIA_DPDP_CONTROLS,
  ...SEBI_CSCRF_CONTROLS,
  ...MIDDLE_EAST_PRIVACY_CONTROLS,
  ...GOOGLE_CHRONICLE_CONTROLS,
  ...ISO22301_CONTROLS,
  ...ISO31000_CONTROLS,
  ...UN_R155_CONTROLS,
  ...UN_R156_CONTROLS,
  ...FDA_CONTROLS,
  ...IRDAI_CONTROLS,
  ...CERT_IN_CONTROLS,

  // ISO 27701 (subset)

  c('iso277-p5-1', 'iso27701', 'P.5.1', 'Privacy policy', 'Privacy policy for PII processing.', 'data_protection', 'Align with ISO 27701 PIMS requirements.', ['policy']),

  c('iso277-p5-2', 'iso27701', 'P.5.2', 'Privacy roles', 'Define privacy roles and responsibilities.', 'governance', 'DPO or privacy lead appointed.', ['policy', 'procedure']),

  c('iso277-p6-1', 'iso27701', 'P.6.1', 'Lawful basis', 'Identify lawful basis for PII processing.', 'data_protection', 'Document legal basis per processing activity.', ['procedure', 'policy']),

  c('iso277-p6-2', 'iso27701', 'P.6.2', 'Purpose specification', 'Determine and document purposes for PII.', 'data_protection', 'RoPA with purpose fields.', ['procedure']),

  c('iso277-p7-1', 'iso27701', 'P.7.1', 'Consent management', 'Obtain and record consent where required.', 'data_protection', 'Consent capture and withdrawal.', ['technical_control', 'procedure']),

  c('iso277-p7-2', 'iso27701', 'P.7.2', 'Privacy notices', 'Provide privacy notices to PII principals.', 'data_protection', 'Layered notices at collection points.', ['policy']),

  c('iso277-p8-1', 'iso27701', 'P.8.1', 'PII retention', 'Retention periods defined and enforced.', 'data_protection', 'Automated deletion jobs.', ['procedure', 'technical_control']),

  c('iso277-p8-2', 'iso27701', 'P.8.2', 'PII disposal', 'Secure disposal of PII.', 'data_protection', 'Certified destruction for physical media.', ['procedure']),

  c('iso277-p9-1', 'iso27701', 'P.9.1', 'Data subject rights', 'Process for DSAR and rights requests.', 'data_protection', 'DSAR workflow within legal timelines.', ['procedure', 'manual_process']),

  c('iso277-p10-1', 'iso27701', 'P.10.1', 'Privacy by design', 'Privacy embedded in system design.', 'governance', 'Privacy review in SDLC.', ['procedure', 'policy']),

  c('iso277-p11-1', 'iso27701', 'P.11.1', 'Processor agreements', 'Contracts with PII processors.', 'vendor_management', 'DPA with all subprocessors.', ['contractual']),

  c('iso277-p12-1', 'iso27701', 'P.12.1', 'Cross-border transfers', 'Transfers comply with applicable law.', 'data_protection', 'SCCs or adequacy mechanisms.', ['contractual', 'policy']),



  // HIPAA

  c('hipaa-164-308-a1', 'hipaa', '§164.308(a)(1)', 'Security management process', 'Risk analysis and risk management.', 'risk_management', 'Annual HIPAA risk assessment.', ['procedure', 'manual_process']),

  c('hipaa-164-308-a3', 'hipaa', '§164.308(a)(3)', 'Workforce security', 'Authorization and supervision of workforce.', 'human_resources', 'Background checks and role-based access.', ['procedure', 'policy']),

  c('hipaa-164-308-a4', 'hipaa', '§164.308(a)(4)', 'Information access management', 'Access authorization and establishment.', 'access_control', 'Access based on minimum necessary.', ['procedure', 'technical_control']),

  c('hipaa-164-308-a5', 'hipaa', '§164.308(a)(5)', 'Security awareness training', 'Security awareness and training program.', 'human_resources', 'Annual HIPAA training with attestation.', ['training_awareness']),

  c('hipaa-164-308-a6', 'hipaa', '§164.308(a)(6)', 'Security incident procedures', 'Identify and respond to security incidents.', 'incident_response', 'HIPAA breach notification procedures.', ['procedure', 'policy']),

  c('hipaa-164-308-a7', 'hipaa', '§164.308(a)(7)', 'Contingency plan', 'Data backup, disaster recovery, emergency mode.', 'business_continuity', 'Tested backup and DR for ePHI systems.', ['procedure', 'technical_control']),

  c('hipaa-164-308-a8', 'hipaa', '§164.308(a)(8)', 'Evaluation', 'Periodic technical and nontechnical evaluation.', 'governance', 'Annual compliance evaluation.', ['third_party_attestation', 'manual_process']),

  c('hipaa-164-310-a1', 'hipaa', '§164.310(a)(1)', 'Facility access controls', 'Limit physical access to facilities.', 'physical_security', 'Facility security plan.', ['procedure']),

  c('hipaa-164-310-d1', 'hipaa', '§164.310(d)(1)', 'Device and media controls', 'Disposal and re-use of hardware and media.', 'asset_management', 'Media sanitization before disposal.', ['procedure']),

  c('hipaa-164-312-a1', 'hipaa', '§164.312(a)(1)', 'Access control', 'Unique user identification and emergency access.', 'access_control', 'Unique IDs; emergency access procedure.', ['technical_control', 'procedure']),

  c('hipaa-164-312-b', 'hipaa', '§164.312(b)', 'Audit controls', 'Record and examine activity in ePHI systems.', 'audit_logging', 'Audit logs for ePHI access.', ['technical_control']),

  c('hipaa-164-312-c1', 'hipaa', '§164.312(c)(1)', 'Integrity', 'Protect ePHI from improper alteration.', 'data_protection', 'Integrity controls and checksums.', ['technical_control']),

  c('hipaa-164-312-d', 'hipaa', '§164.312(d)', 'Person or entity authentication', 'Verify identity of persons seeking access.', 'access_control', 'Strong authentication for ePHI systems.', ['technical_control']),

  c('hipaa-164-312-e1', 'hipaa', '§164.312(e)(1)', 'Transmission security', 'Guard against unauthorized access during transmission.', 'network_security', 'Encryption for ePHI in transit.', ['technical_control']),

  c('hipaa-164-314-a1', 'hipaa', '§164.314(a)(1)', 'Business associate contracts', 'Written contract with business associates.', 'vendor_management', 'BAA with all vendors handling PHI.', ['contractual']),

  c('hipaa-164-316-b2', 'hipaa', '§164.316(b)(2)', 'Documentation', 'Maintain policies and procedures in written form.', 'governance', 'Policy repository with version control.', ['policy', 'procedure']),



  // GDPR

  c('gdpr-art5', 'gdpr', 'Art. 5', 'Principles of processing', 'Lawfulness, fairness, transparency, purpose limitation.', 'data_protection', 'Document processing principles in RoPA.', ['policy', 'procedure']),

  c('gdpr-art6', 'gdpr', 'Art. 6', 'Lawfulness of processing', 'Valid legal basis for each processing activity.', 'data_protection', 'Legal basis documented per activity.', ['procedure']),

  c('gdpr-art7', 'gdpr', 'Art. 7', 'Conditions for consent', 'Demonstrate consent where relied upon.', 'data_protection', 'Consent records with timestamp and scope.', ['technical_control', 'procedure']),

  c('gdpr-art12', 'gdpr', 'Art. 12-14', 'Transparent information', 'Provide transparent privacy information.', 'data_protection', 'Privacy notice at collection.', ['policy']),

  c('gdpr-art15', 'gdpr', 'Art. 15-22', 'Data subject rights', 'Facilitate access, rectification, erasure, portability.', 'data_protection', 'DSAR process within 30 days.', ['procedure', 'manual_process']),

  c('gdpr-art25', 'gdpr', 'Art. 25', 'Data protection by design', 'Implement appropriate technical and organizational measures.', 'governance', 'Privacy reviews in product development.', ['procedure', 'policy']),

  c('gdpr-art28', 'gdpr', 'Art. 28', 'Processor agreements', 'Written contract with processors.', 'vendor_management', 'GDPR-compliant DPA with processors.', ['contractual']),

  c('gdpr-art30', 'gdpr', 'Art. 30', 'Records of processing', 'Maintain records of processing activities.', 'data_protection', 'RoPA maintained and reviewed.', ['procedure']),

  c('gdpr-art32', 'gdpr', 'Art. 32', 'Security of processing', 'Appropriate security measures.', 'data_protection', 'Encryption, resilience, testing.', ['technical_control', 'policy']),

  c('gdpr-art33', 'gdpr', 'Art. 33', 'Breach notification to authority', 'Notify supervisory authority within 72 hours.', 'incident_response', 'Breach response playbook.', ['procedure']),

  c('gdpr-art35', 'gdpr', 'Art. 35', 'Data protection impact assessment', 'DPIA for high-risk processing.', 'risk_management', 'DPIA template and trigger criteria.', ['procedure', 'manual_process']),

  c('gdpr-art37', 'gdpr', 'Art. 37-39', 'Data protection officer', 'Designate DPO where required.', 'governance', 'DPO contact published.', ['policy']),

  c('gdpr-art44', 'gdpr', 'Art. 44-49', 'International transfers', 'Transfers only with appropriate safeguards.', 'data_protection', 'SCCs, BCRs, or adequacy.', ['contractual', 'policy']),

  c('gdpr-art5-retention', 'gdpr', 'Art. 5(1)(e)', 'Storage limitation', 'Retain personal data no longer than necessary.', 'data_protection', 'Retention schedule enforced.', ['procedure', 'technical_control']),



  // PCI DSS

  c('pci-req1', 'pci-dss', 'Req 1', 'Network security controls', 'Install and maintain network security controls.', 'network_security', 'Firewalls and network segmentation.', ['technical_control']),

  c('pci-req2', 'pci-dss', 'Req 2', 'Secure configurations', 'Apply secure configurations to system components.', 'change_management', 'Hardening standards and CIS benchmarks.', ['technical_control', 'procedure']),

  c('pci-req3', 'pci-dss', 'Req 3', 'Protect stored account data', 'Protect stored cardholder data.', 'cryptography', 'Tokenization or encryption of PAN.', ['technical_control']),

  c('pci-req4', 'pci-dss', 'Req 4', 'Protect data in transit', 'Protect cardholder data with strong cryptography during transmission.', 'cryptography', 'TLS for all CHD transmission.', ['technical_control']),

  c('pci-req5', 'pci-dss', 'Req 5', 'Protect against malware', 'Protect all systems against malware.', 'vulnerability_management', 'Anti-malware on applicable systems.', ['technical_control']),

  c('pci-req6', 'pci-dss', 'Req 6', 'Secure systems and software', 'Develop and maintain secure systems.', 'change_management', 'Secure SDLC and patch management.', ['procedure', 'technical_control']),

  c('pci-req7', 'pci-dss', 'Req 7', 'Restrict access', 'Restrict access to system components and cardholder data.', 'access_control', 'Least privilege for CDE access.', ['technical_control', 'policy']),

  c('pci-req8', 'pci-dss', 'Req 8', 'Identify users and authenticate', 'Identify users and authenticate access.', 'access_control', 'Unique IDs and MFA for CDE.', ['technical_control']),

  c('pci-req9', 'pci-dss', 'Req 9', 'Restrict physical access', 'Restrict physical access to cardholder data.', 'physical_security', 'Physical controls for CDE locations.', ['procedure']),

  c('pci-req10', 'pci-dss', 'Req 10', 'Log and monitor access', 'Log and monitor all access to system components and CHD.', 'audit_logging', 'Comprehensive logging in CDE.', ['technical_control', 'automated_monitoring']),

  c('pci-req11', 'pci-dss', 'Req 11', 'Test security regularly', 'Test security of systems and networks regularly.', 'vulnerability_management', 'Quarterly ASV scans and pen tests.', ['third_party_attestation', 'automated_monitoring']),

  c('pci-req12', 'pci-dss', 'Req 12', 'Support information security', 'Support information security with organizational policies.', 'governance', 'InfoSec policy and annual review.', ['policy']),

  c('pci-req12-8', 'pci-dss', 'Req 12.8', 'Manage service providers', 'Manage TPSP relationships.', 'vendor_management', 'TPSP due diligence and AOC collection.', ['contractual', 'procedure']),

  c('pci-req12-10', 'pci-dss', 'Req 12.10', 'Incident response plan', 'Implement incident response plan.', 'incident_response', 'IR plan tested annually.', ['procedure']),



  // NIST CSF

  c('nist-gv-oc', 'nist-csf', 'GV.OC', 'Organizational context', 'Understand organizational context for cybersecurity.', 'governance', 'Document mission and stakeholder expectations.', ['policy']),

  c('nist-gv-rm', 'nist-csf', 'GV.RM', 'Risk management strategy', 'Establish and communicate risk management strategy.', 'risk_management', 'Risk appetite statement approved.', ['policy', 'procedure']),

  c('nist-id-am', 'nist-csf', 'ID.AM', 'Asset management', 'Assets that enable the organization are identified.', 'asset_management', 'Asset inventory maintained.', ['procedure', 'technical_control']),

  c('nist-id-ra', 'nist-csf', 'ID.RA', 'Risk assessment', 'Cybersecurity risk to operations is understood.', 'risk_management', 'Regular risk assessments.', ['procedure', 'manual_process']),

  c('nist-pr-ac', 'nist-csf', 'PR.AC', 'Identity management and access control', 'Access to physical and logical assets is managed.', 'access_control', 'IAM program with MFA.', ['technical_control', 'policy']),

  c('nist-pr-ds', 'nist-csf', 'PR.DS', 'Data security', 'Data-at-rest and in-transit are protected.', 'data_protection', 'Classification and encryption.', ['technical_control', 'policy']),

  c('nist-pr-ip', 'nist-csf', 'PR.IP', 'Information protection processes', 'Security policies and processes maintained.', 'governance', 'Policy lifecycle management.', ['policy', 'procedure']),

  c('nist-pr-ma', 'nist-csf', 'PR.MA', 'Maintenance', 'Maintenance and repairs performed securely.', 'change_management', 'Secure maintenance procedures.', ['procedure']),

  c('nist-de-ae', 'nist-csf', 'DE.AE', 'Anomalies and events', 'Anomalous activity is detected and analyzed.', 'audit_logging', 'SIEM and alerting rules.', ['automated_monitoring', 'technical_control']),

  c('nist-de-cm', 'nist-csf', 'DE.CM', 'Security continuous monitoring', 'Systems monitored to detect cybersecurity events.', 'audit_logging', 'Continuous monitoring program.', ['automated_monitoring']),

  c('nist-rs-rp', 'nist-csf', 'RS.RP', 'Response planning', 'Response processes executed during incidents.', 'incident_response', 'IR plan and communication plan.', ['procedure']),

  c('nist-rs-co', 'nist-csf', 'RS.CO', 'Communications', 'Response activities coordinated with stakeholders.', 'incident_response', 'Stakeholder notification templates.', ['procedure']),

  c('nist-rc-rp', 'nist-csf', 'RC.RP', 'Recovery planning', 'Recovery processes executed during incidents.', 'business_continuity', 'Recovery plans tested.', ['procedure']),

  c('nist-rc-im', 'nist-csf', 'RC.IM', 'Improvements', 'Recovery planning improved.', 'governance', 'Lessons learned process.', ['procedure']),

  c('nist-gv-sc', 'nist-csf', 'GV.SC', 'Cybersecurity supply chain', 'Supply chain risk managed.', 'vendor_management', 'Supplier security requirements.', ['contractual', 'procedure']),

  c('nist-id-im', 'nist-csf', 'ID.IM', 'Improvement', 'Improvements identified from assessments.', 'governance', 'Continuous improvement cycle.', ['procedure']),



  // NIST 800-53 (sample)

  c('nist-ac-2', 'nist-800-53', 'AC-2', 'Account management', 'Manage system accounts.', 'access_control', 'Account lifecycle procedures.', ['procedure', 'technical_control']),

  c('nist-ac-3', 'nist-800-53', 'AC-3', 'Access enforcement', 'Enforce approved authorizations.', 'access_control', 'RBAC enforcement.', ['technical_control']),

  c('nist-au-2', 'nist-800-53', 'AU-2', 'Event logging', 'Identify events to be logged.', 'audit_logging', 'Audit event catalog.', ['policy', 'technical_control']),

  c('nist-au-6', 'nist-800-53', 'AU-6', 'Audit review and analysis', 'Review and analyze audit records.', 'audit_logging', 'Regular log review.', ['procedure', 'automated_monitoring']),

  c('nist-ca-7', 'nist-800-53', 'CA-7', 'Continuous monitoring', 'Develop continuous monitoring strategy.', 'governance', 'ConMon strategy document.', ['procedure', 'automated_monitoring']),

  c('nist-cm-2', 'nist-800-53', 'CM-2', 'Baseline configuration', 'Develop and maintain baseline configurations.', 'change_management', 'Configuration baselines.', ['technical_control']),

  c('nist-ia-2', 'nist-800-53', 'IA-2', 'Identification and authentication', 'Uniquely identify and authenticate users.', 'access_control', 'PKI or MFA for privileged users.', ['technical_control']),

  c('nist-ir-4', 'nist-800-53', 'IR-4', 'Incident handling', 'Implement incident handling capability.', 'incident_response', 'IR team and playbooks.', ['procedure']),

  c('nist-ra-5', 'nist-800-53', 'RA-5', 'Vulnerability monitoring', 'Monitor and scan for vulnerabilities.', 'vulnerability_management', 'Continuous vulnerability scanning.', ['automated_monitoring']),

  c('nist-sa-9', 'nist-800-53', 'SA-9', 'External system services', 'Manage external system services.', 'vendor_management', 'External service agreements.', ['contractual']),

  c('nist-sc-7', 'nist-800-53', 'SC-7', 'Boundary protection', 'Monitor and control communications at boundaries.', 'network_security', 'Network boundary controls.', ['technical_control']),

  c('nist-sc-13', 'nist-800-53', 'SC-13', 'Cryptographic protection', 'Implement cryptographic mechanisms.', 'cryptography', 'FIPS-validated crypto where required.', ['technical_control']),

  c('nist-si-2', 'nist-800-53', 'SI-2', 'Flaw remediation', 'Identify and report flaws; apply fixes.', 'vulnerability_management', 'Patch management program.', ['procedure', 'automated_monitoring']),

  c('nist-si-4', 'nist-800-53', 'SI-4', 'System monitoring', 'Monitor system to detect attacks.', 'audit_logging', 'IDS/IPS or EDR deployment.', ['technical_control', 'automated_monitoring']),



  // CIS Controls v8

  c('cis-1', 'cis-v8', 'CIS 1', 'Inventory of enterprise assets', 'Actively manage all enterprise assets.', 'asset_management', 'Automated asset discovery.', ['automated_monitoring', 'procedure']),

  c('cis-2', 'cis-v8', 'CIS 2', 'Inventory of software assets', 'Actively manage all software.', 'asset_management', 'Software inventory and allowlisting.', ['technical_control']),

  c('cis-3', 'cis-v8', 'CIS 3', 'Data protection', 'Develop processes to protect data.', 'data_protection', 'Data classification scheme.', ['policy', 'technical_control']),

  c('cis-4', 'cis-v8', 'CIS 4', 'Secure configuration', 'Establish and maintain secure configurations.', 'change_management', 'CIS benchmarks applied.', ['technical_control']),

  c('cis-5', 'cis-v8', 'CIS 5', 'Account management', 'Use processes and tools for account management.', 'access_control', 'Account lifecycle automation.', ['procedure', 'technical_control']),

  c('cis-6', 'cis-v8', 'CIS 6', 'Access control management', 'Use processes and tools for access control.', 'access_control', 'RBAC and MFA.', ['technical_control']),

  c('cis-7', 'cis-v8', 'CIS 7', 'Continuous vulnerability management', 'Develop vulnerability management process.', 'vulnerability_management', 'Scan and remediate on schedule.', ['automated_monitoring']),

  c('cis-8', 'cis-v8', 'CIS 8', 'Audit log management', 'Collect, alert, and retain audit logs.', 'audit_logging', 'Centralized log management.', ['technical_control']),

  c('cis-9', 'cis-v8', 'CIS 9', 'Email and web browser protections', 'Improve protections for email and browsers.', 'network_security', 'Email filtering and browser controls.', ['technical_control']),

  c('cis-10', 'cis-v8', 'CIS 10', 'Malware defenses', 'Prevent or control installation of malware.', 'vulnerability_management', 'EDR on endpoints.', ['technical_control']),

  c('cis-11', 'cis-v8', 'CIS 11', 'Data recovery', 'Establish and maintain data recovery practices.', 'business_continuity', 'Tested backups.', ['procedure', 'technical_control']),

  c('cis-12', 'cis-v8', 'CIS 12', 'Network infrastructure management', 'Establish and maintain network infrastructure.', 'network_security', 'Network device management.', ['technical_control']),

  c('cis-13', 'cis-v8', 'CIS 13', 'Network monitoring and defense', 'Operate processes to monitor network.', 'network_security', 'NDR or IDS deployment.', ['automated_monitoring']),

  c('cis-14', 'cis-v8', 'CIS 14', 'Security awareness training', 'Establish security awareness program.', 'human_resources', 'Phishing simulations and training.', ['training_awareness']),



  // CCPA/CPRA

  c('ccpa-notice', 'ccpa-cpra', '§1798.100', 'Notice at collection', 'Provide notice at or before collection.', 'data_protection', 'Notice at collection points.', ['policy']),

  c('ccpa-right-know', 'ccpa-cpra', '§1798.110', 'Right to know', 'Disclose categories and specific pieces of PI.', 'data_protection', 'Consumer request process.', ['procedure']),

  c('ccpa-delete', 'ccpa-cpra', '§1798.105', 'Right to delete', 'Delete consumer PI upon request.', 'data_protection', 'Deletion workflow.', ['procedure', 'technical_control']),

  c('ccpa-opt-out', 'ccpa-cpra', '§1798.120', 'Right to opt-out of sale/share', 'Do not sell or share without right to opt-out.', 'data_protection', '"Do Not Sell" link and opt-out.', ['technical_control', 'policy']),

  c('ccpa-correct', 'ccpa-cpra', '§1798.106', 'Right to correct', 'Correct inaccurate PI.', 'data_protection', 'Correction request process.', ['procedure']),

  c('ccpa-limit', 'ccpa-cpra', '§1798.121', 'Right to limit sensitive PI', 'Limit use of sensitive personal information.', 'data_protection', 'Limit use controls.', ['procedure', 'technical_control']),

  c('ccpa-security', 'ccpa-cpra', '§1798.150', 'Reasonable security', 'Implement reasonable security procedures.', 'data_protection', 'Security program aligned to data sensitivity.', ['policy', 'technical_control']),

  c('ccpa-vendor', 'ccpa-cpra', '§1798.140(w)', 'Service provider contracts', 'Written contracts with service providers.', 'vendor_management', 'CCPA-compliant vendor terms.', ['contractual']),

  c('ccpa-records', 'ccpa-cpra', '§1798.130', 'Recordkeeping', 'Maintain records of processing.', 'governance', 'Processing records for 24 months.', ['procedure']),

  c('ccpa-training', 'ccpa-cpra', '§1798.185', 'Employee training', 'Train staff handling consumer inquiries.', 'human_resources', 'Privacy training for request handlers.', ['training_awareness']),



  // SOX ITGC

  c('sox-ac-1', 'sox-itgc', 'ITGC-AC-1', 'Logical access provisioning', 'User access provisioned with approval.', 'access_control', 'SoD and approval workflow.', ['procedure']),

  c('sox-ac-2', 'sox-itgc', 'ITGC-AC-2', 'Access recertification', 'Periodic access reviews performed.', 'access_control', 'Quarterly recertification.', ['manual_process', 'procedure']),

  c('sox-ac-3', 'sox-itgc', 'ITGC-AC-3', 'Privileged access', 'Privileged access restricted and monitored.', 'access_control', 'PAM and session logging.', ['technical_control']),

  c('sox-cm-1', 'sox-itgc', 'ITGC-CM-1', 'Change management', 'Changes tested and approved before production.', 'change_management', 'Change advisory board.', ['procedure']),

  c('sox-cm-2', 'sox-itgc', 'ITGC-CM-2', 'Emergency changes', 'Emergency changes documented and reviewed.', 'change_management', 'Post-implementation review.', ['procedure']),

  c('sox-cm-3', 'sox-itgc', 'ITGC-CM-3', 'Segregation of development and production', 'Dev/test/prod environments segregated.', 'change_management', 'Environment separation.', ['technical_control']),

  c('sox-op-1', 'sox-itgc', 'ITGC-OP-1', 'Backup and recovery', 'Backups performed and recovery tested.', 'business_continuity', 'Backup monitoring and restore tests.', ['technical_control', 'procedure']),

  c('sox-op-2', 'sox-itgc', 'ITGC-OP-2', 'Job scheduling', 'Batch jobs monitored for failures.', 'governance', 'Job monitoring and alerting.', ['automated_monitoring']),

  c('sox-op-3', 'sox-itgc', 'ITGC-OP-3', 'Incident management', 'IT incidents tracked and resolved.', 'incident_response', 'ITSM ticketing for incidents.', ['procedure']),

  c('sox-sd-1', 'sox-itgc', 'ITGC-SD-1', 'SDLC controls', 'SDLC includes security and testing gates.', 'change_management', 'Security review in SDLC.', ['procedure', 'policy']),



  // FedRAMP Moderate (sample)

  c('fed-ac-2', 'fedramp-moderate', 'AC-2', 'Account management', 'Manage information system accounts.', 'access_control', 'FedRAMP account management procedures.', ['procedure', 'technical_control']),

  c('fed-ac-17', 'fedramp-moderate', 'AC-17', 'Remote access', 'Control and monitor remote access methods.', 'access_control', 'VPN with MFA for remote access.', ['technical_control']),

  c('fed-au-6', 'fedramp-moderate', 'AU-6', 'Audit review', 'Review and analyze audit logs.', 'audit_logging', 'Weekly log review.', ['procedure', 'automated_monitoring']),

  c('fed-ca-7', 'fedramp-moderate', 'CA-7', 'Continuous monitoring', 'Continuous monitoring program.', 'governance', 'ConMon plan per FedRAMP.', ['procedure']),

  c('fed-cm-2', 'fedramp-moderate', 'CM-2', 'Baseline configuration', 'Document and maintain baselines.', 'change_management', 'STIG-aligned baselines.', ['technical_control']),

  c('fed-ia-2', 'fedramp-moderate', 'IA-2', 'User identification and authentication', 'MFA for privileged and network access.', 'access_control', 'Phishing-resistant MFA.', ['technical_control']),

  c('fed-ir-4', 'fedramp-moderate', 'IR-4', 'Incident handling', 'Incident handling capability.', 'incident_response', 'FedRAMP incident reporting.', ['procedure']),

  c('fed-ra-5', 'fedramp-moderate', 'RA-5', 'Vulnerability scanning', 'Scan for vulnerabilities monthly.', 'vulnerability_management', 'Authenticated scans monthly.', ['automated_monitoring']),

  c('fed-sc-7', 'fedramp-moderate', 'SC-7', 'Boundary protection', 'Boundary protection mechanisms.', 'network_security', 'WAF and firewall rules.', ['technical_control']),

  c('fed-sc-13', 'fedramp-moderate', 'SC-13', 'Cryptographic protection', 'FIPS 140-validated cryptography.', 'cryptography', 'FIPS-validated modules.', ['technical_control']),

  c('fed-si-2', 'fedramp-moderate', 'SI-2', 'Flaw remediation', 'Flaws identified and remediated.', 'vulnerability_management', '30-day patch SLA for high.', ['procedure']),

  c('fed-si-4', 'fedramp-moderate', 'SI-4', 'Information system monitoring', 'Monitor system and network.', 'audit_logging', 'Continuous monitoring tools.', ['automated_monitoring']),



  // NIST AI RMF

  c('ai-gov-1', 'nist-ai-rmf', 'GOVERN 1', 'Policies and procedures', 'Policies for AI risk management established.', 'governance', 'AI governance policy.', ['policy']),

  c('ai-gov-2', 'nist-ai-rmf', 'GOVERN 2', 'Accountability', 'Accountability structures for AI systems.', 'governance', 'AI risk owner assigned.', ['policy', 'procedure']),

  c('ai-map-1', 'nist-ai-rmf', 'MAP 1', 'Context established', 'Context for AI system risks established.', 'risk_management', 'AI system inventory and context.', ['procedure']),

  c('ai-map-2', 'nist-ai-rmf', 'MAP 2', 'Categorization of AI', 'AI systems categorized by risk level.', 'risk_management', 'Risk tiering for AI use cases.', ['procedure', 'manual_process']),

  c('ai-msr-1', 'nist-ai-rmf', 'MEASURE 1', 'Appropriate methods selected', 'Methods to measure AI risks selected.', 'risk_management', 'Evaluation metrics defined.', ['procedure']),

  c('ai-msr-2', 'nist-ai-rmf', 'MEASURE 2', 'AI systems evaluated', 'AI systems evaluated for trustworthy characteristics.', 'governance', 'Bias and fairness testing.', ['manual_process', 'automated_monitoring']),

  c('ai-man-1', 'nist-ai-rmf', 'MANAGE 1', 'Prioritized actions', 'AI risks prioritized and treated.', 'risk_management', 'Risk treatment plans for AI.', ['procedure']),

  c('ai-man-2', 'nist-ai-rmf', 'MANAGE 2', 'Resources allocated', 'Resources allocated to manage AI risks.', 'governance', 'Budget for AI safety measures.', ['procedure']),

  c('ai-man-3', 'nist-ai-rmf', 'MANAGE 3', 'Negative impacts responded to', 'Respond to AI-related incidents.', 'incident_response', 'AI incident response plan.', ['procedure']),

  c('ai-gov-3', 'nist-ai-rmf', 'GOVERN 3', 'Workforce diversity', 'Workforce diversity in AI development considered.', 'human_resources', 'Diverse review teams for AI.', ['procedure']),



  // HITRUST

  c('hit-01-a', 'hitrust', '01.a', 'Access control policy', 'Access control policy established.', 'access_control', 'HITRUST-aligned access policy.', ['policy']),

  c('hit-01-b', 'hitrust', '01.b', 'User registration', 'Formal user registration process.', 'access_control', 'Registration workflow.', ['procedure']),

  c('hit-02-a', 'hitrust', '02.a', 'Operational procedures', 'Operating procedures documented.', 'governance', 'Documented procedures.', ['procedure']),

  c('hit-06-a', 'hitrust', '06.a', 'Organization of information security', 'Security roles and responsibilities.', 'governance', 'Security organization chart.', ['policy']),

  c('hit-09-a', 'hitrust', '09.a', 'Asset inventory', 'Assets associated with information identified.', 'asset_management', 'Asset inventory program.', ['procedure']),

  c('hit-10-a', 'hitrust', '10.a', 'Cryptographic controls', 'Cryptographic controls policy.', 'cryptography', 'Encryption standards.', ['policy', 'technical_control']),

  c('hit-11-a', 'hitrust', '11.a', 'Physical security', 'Physical security perimeter.', 'physical_security', 'Facility controls.', ['procedure']),

  c('hit-12-a', 'hitrust', '12.a', 'Operations security', 'Operational procedures and responsibilities.', 'governance', 'Ops security procedures.', ['procedure']),

  c('hit-13-a', 'hitrust', '13.a', 'Communications security', 'Network security management.', 'network_security', 'Network segmentation.', ['technical_control']),

  c('hit-16-a', 'hitrust', '16.a', 'Incident management', 'Consistent approach to incident management.', 'incident_response', 'Incident management program.', ['procedure']),

  c('hit-17-a', 'hitrust', '17.a', 'Business continuity', 'Information security continuity.', 'business_continuity', 'BCP for critical systems.', ['procedure']),

  c('hit-18-a', 'hitrust', '18.a', 'Compliance', 'Compliance with legal and contractual requirements.', 'governance', 'Compliance register.', ['procedure', 'policy']),



  // CMMC Level 2

  c('cmmc-ac-l2', 'cmmc-l2', 'AC.L2-3.1.1', 'Authorized access control', 'Limit system access to authorized users.', 'access_control', 'CUI access limited to authorized users.', ['technical_control', 'policy']),

  c('cmmc-ac-l2-2', 'cmmc-l2', 'AC.L2-3.1.2', 'Transaction and function control', 'Limit access to transactions and functions.', 'access_control', 'Function-level access controls.', ['technical_control']),

  c('cmmc-ia-l2', 'cmmc-l2', 'IA.L2-3.5.3', 'Multifactor authentication', 'Use MFA for local and network access.', 'access_control', 'MFA for all CUI system access.', ['technical_control']),

  c('cmmc-au-l2', 'cmmc-l2', 'AU.L2-3.3.1', 'System auditing', 'Create and retain audit records.', 'audit_logging', 'Audit logs for CUI systems.', ['technical_control']),

  c('cmmc-au-l2-2', 'cmmc-l2', 'AU.L2-3.3.2', 'Audit record review', 'Review and update logged events.', 'audit_logging', 'Regular audit log review.', ['procedure']),

  c('cmmc-cm-l2', 'cmmc-l2', 'CM.L2-3.4.1', 'Baseline configuration', 'Establish and maintain baseline configurations.', 'change_management', 'Secure baselines for CUI systems.', ['technical_control']),

  c('cmmc-cm-l2-2', 'cmmc-l2', 'CM.L2-3.4.2', 'Security configuration enforcement', 'Enforce security configuration settings.', 'change_management', 'Configuration enforcement tools.', ['technical_control', 'automated_monitoring']),

  c('cmmc-ir-l2', 'cmmc-l2', 'IR.L2-3.6.1', 'Incident handling', 'Establish operational incident handling.', 'incident_response', 'IR capability for CUI incidents.', ['procedure']),

  c('cmmc-ir-l2-2', 'cmmc-l2', 'IR.L2-3.6.2', 'Incident reporting', 'Track and document incidents.', 'incident_response', 'Incident tracking system.', ['procedure']),

  c('cmmc-ma-l2', 'cmmc-l2', 'MA.L2-3.7.1', 'Perform maintenance', 'Perform maintenance on organizational systems.', 'change_management', 'Controlled maintenance process.', ['procedure']),

  c('cmmc-mp-l2', 'cmmc-l2', 'MP.L2-3.8.3', 'Media sanitization', 'Sanitize or destroy media containing CUI.', 'asset_management', 'Media sanitization before disposal.', ['procedure']),

  c('cmmc-sc-l2', 'cmmc-l2', 'SC.L2-3.13.11', 'CUI encryption', 'Employ FIPS-validated encryption for CUI.', 'cryptography', 'FIPS encryption for CUI at rest and in transit.', ['technical_control']),

  // DORA
  c('dora-art5', 'dora', 'Art. 5', 'ICT risk management framework', 'Financial entities maintain ICT risk management framework.', 'governance', 'Board-approved ICT risk framework aligned to DORA.', ['policy', 'procedure']),
  c('dora-art6', 'dora', 'Art. 6', 'Governance and organization', 'Clear governance arrangements for ICT risk.', 'governance', 'Assign ICT risk roles and reporting lines.', ['policy']),
  c('dora-art8', 'dora', 'Art. 8', 'Identification of ICT risk', 'Identify ICT-related risks on ongoing basis.', 'risk_management', 'ICT risk register integrated with ERM.', ['procedure', 'manual_process']),
  c('dora-art9', 'dora', 'Art. 9', 'Protection and prevention', 'Protect ICT systems and prevent impact.', 'network_security', 'Security controls for critical ICT assets.', ['technical_control', 'policy']),
  c('dora-art10', 'dora', 'Art. 10', 'Detection', 'Detect anomalous activities and ICT-related incidents.', 'audit_logging', 'Monitoring and anomaly detection.', ['automated_monitoring', 'technical_control']),
  c('dora-art11', 'dora', 'Art. 11', 'Response and recovery', 'Response and recovery plans for ICT incidents.', 'incident_response', 'ICT incident response and recovery playbooks.', ['procedure']),
  c('dora-art17', 'dora', 'Art. 17', 'ICT-related incident reporting', 'Report major ICT-related incidents to authorities.', 'incident_response', 'Regulatory reporting procedures.', ['procedure']),
  c('dora-art28', 'dora', 'Art. 28', 'Third-party ICT risk', 'Manage ICT third-party service provider risk.', 'vendor_management', 'Register of ICT third-party providers.', ['procedure', 'contractual']),
  c('dora-art28-testing', 'dora', 'Art. 28(8)', 'Testing of ICT tools', 'Test ICT tools and systems including backup.', 'business_continuity', 'Annual resilience testing program.', ['procedure', 'manual_process']),
  c('dora-art29', 'dora', 'Art. 29', 'Preliminary assessment of ICT concentration risk', 'Assess concentration risk from ICT third parties.', 'vendor_management', 'Concentration risk analysis for critical providers.', ['procedure', 'manual_process']),

  // NIS2
  c('nis2-art21-1', 'nis2', 'Art. 21(1)', 'Risk analysis and policies', 'Policies on risk analysis and information system security.', 'governance', 'Cybersecurity policy approved by management.', ['policy']),
  c('nis2-art21-2', 'nis2', 'Art. 21(2)(a)', 'Incident handling', 'Incident handling procedures in place.', 'incident_response', 'NIS2-aligned incident handling.', ['procedure']),
  c('nis2-art21-2b', 'nis2', 'Art. 21(2)(b)', 'Business continuity', 'Business continuity and crisis management.', 'business_continuity', 'BCP and backup management.', ['procedure']),
  c('nis2-art21-2c', 'nis2', 'Art. 21(2)(c)', 'Supply chain security', 'Supply chain security for direct suppliers.', 'vendor_management', 'Supplier security assessments.', ['procedure', 'contractual']),
  c('nis2-art21-2d', 'nis2', 'Art. 21(2)(d)', 'Security in acquisition and development', 'Security in network and information system acquisition.', 'change_management', 'Secure SDLC and procurement criteria.', ['procedure', 'policy']),
  c('nis2-art21-2e', 'nis2', 'Art. 21(2)(e)', 'Effectiveness assessment', 'Assess effectiveness of cybersecurity measures.', 'governance', 'Periodic effectiveness reviews.', ['manual_process', 'third_party_attestation']),
  c('nis2-art21-2f', 'nis2', 'Art. 21(2)(f)', 'Cryptography and encryption', 'Cryptography and encryption policies.', 'cryptography', 'Encryption for data at rest and in transit.', ['policy', 'technical_control']),
  c('nis2-art21-2g', 'nis2', 'Art. 21(2)(g)', 'HR security and access control', 'Human resources security and access control policies.', 'access_control', 'Access control and HR security policies.', ['policy', 'procedure']),
  c('nis2-art21-2h', 'nis2', 'Art. 21(2)(h)', 'MFA and secure communications', 'Use of multi-factor authentication and secure communications.', 'access_control', 'MFA for privileged and remote access.', ['technical_control']),
  c('nis2-art23', 'nis2', 'Art. 23', 'Incident reporting', 'Report significant incidents to CSIRT.', 'incident_response', '24/72 hour incident notification process.', ['procedure']),

  // Essential Eight
  c('e8-1', 'essential-eight', 'ML1', 'Application control', 'Prevent execution of unapproved programs.', 'change_management', 'Application allowlisting on workstations.', ['technical_control']),
  c('e8-2', 'essential-eight', 'ML2', 'Patch applications', 'Patch applications within two weeks.', 'vulnerability_management', 'Patch SLAs for internet-facing apps.', ['automated_monitoring', 'procedure']),
  c('e8-3', 'essential-eight', 'ML3', 'Configure Microsoft Office macros', 'Configure Microsoft Office macro settings.', 'change_management', 'Block macros from internet sources.', ['technical_control']),
  c('e8-4', 'essential-eight', 'ML4', 'User application hardening', 'Configure web browsers and PDF handlers securely.', 'change_management', 'Browser and PDF security baselines.', ['technical_control']),
  c('e8-5', 'essential-eight', 'ML5', 'Restrict administrative privileges', 'Restrict and manage admin privileges.', 'access_control', 'PAM and just-in-time admin access.', ['technical_control', 'procedure']),
  c('e8-6', 'essential-eight', 'ML6', 'Patch operating systems', 'Patch OS within one month.', 'vulnerability_management', 'OS patch management program.', ['automated_monitoring', 'procedure']),
  c('e8-7', 'essential-eight', 'ML7', 'Multi-factor authentication', 'MFA for all users accessing important data.', 'access_control', 'MFA enforced org-wide.', ['technical_control']),
  c('e8-8', 'essential-eight', 'ML8', 'Regular backups', 'Perform and test regular backups.', 'business_continuity', 'Daily backups with restore testing.', ['procedure', 'technical_control']),

  // CSA STAR
  c('csa-ccm-1', 'csa-star', 'CCM IAM-01', 'Identity and access management', 'Manage identities and access to cloud services.', 'access_control', 'IAM policy for cloud environments.', ['policy', 'technical_control']),
  c('csa-ccm-2', 'csa-star', 'CCM DSI-01', 'Data security and lifecycle', 'Protect data throughout its lifecycle.', 'data_protection', 'Data classification and encryption.', ['policy', 'technical_control']),
  c('csa-ccm-3', 'csa-star', 'CCM LOG-01', 'Logging and monitoring', 'Log and monitor cloud security events.', 'audit_logging', 'Centralized cloud logging.', ['technical_control', 'automated_monitoring']),
  c('csa-ccm-4', 'csa-star', 'CCM VPM-01', 'Vulnerability management', 'Manage vulnerabilities in cloud workloads.', 'vulnerability_management', 'Cloud vulnerability scanning.', ['automated_monitoring']),
  c('csa-ccm-5', 'csa-star', 'CCM SEF-01', 'Security incident management', 'Manage cloud security incidents.', 'incident_response', 'Cloud-specific IR procedures.', ['procedure']),
  c('csa-ccm-6', 'csa-star', 'CCM BCR-01', 'Business continuity', 'Maintain resilience of cloud services.', 'business_continuity', 'Multi-region failover strategy.', ['procedure', 'technical_control']),
  c('csa-ccm-7', 'csa-star', 'CCM STA-01', 'Supply chain transparency', 'Transparency in cloud supply chain.', 'vendor_management', 'Subprocessor disclosure and assessment.', ['contractual', 'procedure']),
  c('csa-ccm-8', 'csa-star', 'CCM GRM-01', 'Governance and risk', 'Governance and risk management for cloud.', 'governance', 'Cloud risk assessment framework.', ['policy', 'procedure']),

  // LGPD
  c('lgpd-art6', 'lgpd', 'Art. 6', 'Processing principles', 'Process personal data per LGPD principles.', 'data_protection', 'Document lawful processing principles.', ['policy', 'procedure']),
  c('lgpd-art7', 'lgpd', 'Art. 7', 'Legal bases', 'Identify legal bases for processing.', 'data_protection', 'Legal basis per processing activity.', ['procedure']),
  c('lgpd-art8', 'lgpd', 'Art. 8', 'Consent', 'Obtain valid consent when required.', 'data_protection', 'Consent management process.', ['technical_control', 'procedure']),
  c('lgpd-art18', 'lgpd', 'Art. 18', 'Data subject rights', 'Facilitate data subject rights requests.', 'data_protection', 'DSAR workflow within 15 days.', ['procedure', 'manual_process']),
  c('lgpd-art33', 'lgpd', 'Art. 33', 'Security measures', 'Implement technical and administrative security measures.', 'data_protection', 'Security measures proportional to risk.', ['policy', 'technical_control']),
  c('lgpd-art37', 'lgpd', 'Art. 37', 'DPO appointment', 'Appoint data protection officer where required.', 'governance', 'DPO designated and published.', ['policy']),
  c('lgpd-art41', 'lgpd', 'Art. 41', 'Impact assessment', 'Conduct data protection impact assessments.', 'risk_management', 'RIPD for high-risk processing.', ['procedure', 'manual_process']),
  c('lgpd-art46', 'lgpd', 'Art. 46', 'International transfers', 'International transfers with adequate safeguards.', 'data_protection', 'Transfer mechanisms documented.', ['contractual', 'policy']),
];

export function getControlsByFramework(frameworkId: string): Control[] {
  return CONTROLS.filter((c) => c.frameworkId === frameworkId);
}

export function getControlById(id: string): Control | undefined {
  return CONTROLS.find((c) => c.id === id);
}

export function getControlByReference(reference: string, frameworkId?: string): Control | undefined {
  const normalized = reference.trim().toLowerCase();
  const matches = CONTROLS.filter((c) => c.reference.toLowerCase() === normalized);
  if (frameworkId) {
    return matches.find((c) => c.frameworkId === frameworkId) ?? matches[0];
  }
  return matches[0];
}

export function resolveControlLookup(input: {
  controlId?: string;
  reference?: string;
  frameworkId?: string;
}): Control | undefined {
  if (input.controlId) {
    const byId = getControlById(input.controlId);
    if (byId) return byId;
  }
  if (input.reference?.trim()) {
    return getControlByReference(input.reference, input.frameworkId);
  }
  return undefined;
}

export function getAllControlsForActivatedFrameworks(frameworkIds: string[]): Control[] {
  return CONTROLS.filter((c) => frameworkIds.includes(c.frameworkId));
}
