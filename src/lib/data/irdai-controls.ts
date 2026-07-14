import type { Control, ComplianceMethod, ControlDomain } from '../types';

function irdai(
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
    frameworkId: 'irdai',
    reference,
    title,
    description,
    domain,
    guidance,
    suggestedMethods,
  };
}

/** IRDAI Cybersecurity Framework for insurance companies in India. */
export const IRDAI_CONTROLS: Control[] = [
  irdai('irdai-gov-1', 'Gov 1', 'Board oversight of cyber resilience', 'Board and senior management shall oversee cyber resilience strategy and risk appetite.', 'governance', 'Quarterly cyber resilience reporting to board or risk committee.', ['policy', 'procedure']),
  irdai('irdai-gov-2', 'Gov 2', 'Cybersecurity policy', 'Documented cybersecurity policy aligned to IRDAI framework, reviewed annually.', 'governance', 'Policy suite covering IAM, encryption, BCP, and vendor security.', ['policy']),
  irdai('irdai-gov-3', 'Gov 3', 'CISO appointment', 'Designate a CISO or equivalent with authority and direct senior management reporting.', 'governance', 'CISO charter with independence and incident escalation authority.', ['policy']),
  irdai('irdai-id-1', 'Identify 1', 'Asset inventory', 'Maintain inventory of IT assets, applications, and data with owners and criticality.', 'asset_management', 'CMDB covering policy admin, claims, and customer-facing systems.', ['procedure', 'technical_control']),
  irdai('irdai-id-2', 'Identify 2', 'Critical system identification', 'Identify systems critical to policyholder data and insurance operations.', 'governance', 'Critical system register with enhanced controls for core insurance platforms.', ['procedure']),
  irdai('irdai-prot-1', 'Protect 1', 'Access control and MFA', 'Role-based access control and MFA for privileged and remote access.', 'access_control', 'PAM for admin accounts on policy and claims systems.', ['technical_control', 'policy']),
  irdai('irdai-prot-2', 'Protect 2', 'Data encryption', 'Encrypt sensitive policyholder and financial data at rest and in transit.', 'cryptography', 'TLS 1.2+ and field-level encryption for PII and payment data.', ['technical_control']),
  irdai('irdai-prot-3', 'Protect 3', 'Endpoint and email security', 'Protect endpoints and email channels against malware and phishing.', 'network_security', 'EDR on workstations; anti-phishing for underwriters and customer service.', ['technical_control']),
  irdai('irdai-det-1', 'Detect 1', 'Security monitoring', 'Continuous monitoring and alerting for security events on critical systems.', 'audit_logging', 'SIEM with use cases for fraud, privilege abuse, and data exfiltration.', ['automated_monitoring', 'technical_control']),
  irdai('irdai-det-2', 'Detect 2', 'Vulnerability management', 'Periodic vulnerability assessment and timely remediation.', 'vulnerability_management', 'Monthly VA scans; critical patch SLAs for internet-facing apps.', ['procedure', 'automated_monitoring']),
  irdai('irdai-res-1', 'Respond 1', 'Incident response plan', 'Documented IR plan with roles, communication, and regulatory notification.', 'incident_response', 'IRDAI and CERT-In notification workflows within required timelines.', ['procedure']),
  irdai('irdai-res-2', 'Respond 2', 'Business continuity', 'BCP and disaster recovery for critical insurance operations.', 'business_continuity', 'RTO/RPO for policy issuance, claims, and payment systems.', ['procedure']),
  irdai('irdai-tprm-1', 'TPRM 1', 'Third-party risk management', 'Assess and monitor cybersecurity posture of outsourced IT and cloud providers.', 'vendor_management', 'Vendor risk assessments for TPAs, cloud hosts, and IT service providers.', ['contractual', 'procedure']),
  irdai('irdai-rec-1', 'Recover 1', 'Backup and restoration', 'Regular backups with tested restoration for critical systems and data.', 'business_continuity', 'Immutable backups and annual restore tests for core databases.', ['procedure', 'technical_control']),
];
