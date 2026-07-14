import type { Control, ComplianceMethod, ControlDomain } from '../types';

function certin(
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
    frameworkId: 'cert-in',
    reference,
    title,
    description,
    domain,
    guidance,
    suggestedMethods,
  };
}

/** CERT-In Cyber Security Directions (2022) — Indian Computer Emergency Response Team. */
export const CERT_IN_CONTROLS: Control[] = [
  certin('certin-1', 'Dir. 1', 'Incident reporting to CERT-In', 'Report cyber incidents to CERT-In within six hours of detection or awareness.', 'incident_response', '24x7 incident hotline and CERT-In portal submission workflow.', ['procedure']),
  certin('certin-2', 'Dir. 2', 'Designated Point of Contact', 'Appoint and register a Point of Contact with CERT-In for coordination.', 'governance', 'Named POC with deputy; contact details updated with CERT-In.', ['policy', 'procedure']),
  certin('certin-3', 'Dir. 3', 'Log retention 180 days', 'Retain ICT system logs for a rolling period of 180 days within Indian jurisdiction.', 'audit_logging', 'Centralized log storage with tamper protection and India data residency.', ['technical_control', 'procedure']),
  certin('certin-4', 'Dir. 4', 'NTP synchronization', 'Synchronize ICT system clocks with NTP servers of NPL India or NIC.', 'network_security', 'NTP stratum configuration on servers, firewalls, and security appliances.', ['technical_control']),
  certin('certin-5', 'Dir. 5', 'Subscriber KYC for service providers', 'Maintain KYC records for subscribers per applicable service provider obligations.', 'data_protection', 'KYC process for customers per IT Act and intermediary rules.', ['procedure', 'policy']),
  certin('certin-6', 'Dir. 6', 'ICT system information on request', 'Provide information on ICT systems and compliance to CERT-In within stipulated timelines.', 'governance', 'Compliance register and evidence repository for audit requests.', ['procedure', 'manual_process']),
  certin('certin-7', 'Dir. 7', 'Vulnerability and patch management', 'Address known vulnerabilities and apply security patches in a timely manner.', 'vulnerability_management', 'Patch SLAs; emergency patching for actively exploited CVEs.', ['procedure', 'automated_monitoring']),
  certin('certin-8', 'Dir. 8', 'Network security controls', 'Implement firewalls, IDS/IPS, and segmentation for internet-facing systems.', 'network_security', 'Perimeter controls and DMZ architecture for public services.', ['technical_control']),
  certin('certin-9', 'Dir. 9', 'Access control', 'Restrict privileged access and enforce strong authentication.', 'access_control', 'MFA for admin access; periodic access reviews.', ['technical_control', 'policy']),
  certin('certin-10', 'Dir. 10', 'Security awareness training', 'Conduct periodic cybersecurity awareness for personnel handling ICT systems.', 'human_resources', 'Annual training with phishing simulations and role-based modules.', ['training_awareness']),
  certin('certin-11', 'Dir. 11', 'Data localization for logs', 'Ensure security logs and incident data required by directions remain accessible in India.', 'data_protection', 'In-country log aggregation; cross-border transfer assessment.', ['policy', 'technical_control']),
  certin('certin-12', 'Dir. 12', 'Web application and API security', 'Protect web applications and APIs against common attacks and misconfigurations.', 'vulnerability_management', 'WAF, secure SDLC, and periodic penetration testing.', ['technical_control', 'procedure']),
];
