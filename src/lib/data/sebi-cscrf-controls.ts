import type { Control, ComplianceMethod, ControlDomain } from '../types';

function sebi(
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
    frameworkId: 'sebi-cscrf',
    reference,
    title,
    description,
    domain,
    guidance,
    suggestedMethods,
  };
}

/** SEBI Cybersecurity and Cyber Resilience Framework (CSCRF) for regulated entities. */
export const SEBI_CSCRF_CONTROLS: Control[] = [
  sebi(
    'sebi-gov-1',
    'Gov 1',
    'Board and senior management oversight',
    'The board and senior management shall provide oversight of cyber resilience, approve cybersecurity strategy, and review cyber risk posture periodically.',
    'governance',
    'Quarterly cyber resilience reporting to board or risk committee with KPIs and open risks.',
    ['policy', 'procedure']
  ),
  sebi(
    'sebi-gov-2',
    'Gov 2',
    'Cybersecurity policy and standards',
    'Documented cybersecurity policy aligned to SEBI CSCRF, reviewed annually and communicated across the organization.',
    'governance',
    'Maintain policy suite covering access, encryption, incident response, and vendor security.',
    ['policy']
  ),
  sebi(
    'sebi-gov-3',
    'Gov 3',
    'CISO and cyber governance structure',
    'Designate a Chief Information Security Officer (or equivalent) with authority, independence, and direct reporting to senior management.',
    'governance',
    'Define CISO roles, responsibilities, and escalation paths for cyber incidents.',
    ['policy', 'procedure']
  ),
  sebi(
    'sebi-gov-4',
    'Gov 4',
    'Cyber risk assessment program',
    'Conduct periodic cyber risk assessments covering people, process, technology, and third parties; maintain a risk register with treatment plans.',
    'risk_management',
    'Annual enterprise cyber risk assessment mapped to CSCRF domains and business services.',
    ['procedure', 'manual_process']
  ),
  sebi(
    'sebi-id-1',
    'Identify 1',
    'Asset inventory and classification',
    'Maintain an inventory of IT assets, applications, and data stores with owners, criticality, and classification labels.',
    'asset_management',
    'Automated discovery for servers and endpoints; manual register for critical market systems.',
    ['procedure', 'technical_control']
  ),
  sebi(
    'sebi-id-2',
    'Identify 2',
    'Critical system identification',
    'Identify systems critical to market operations, customer data, and regulatory reporting; apply enhanced controls proportionate to impact.',
    'governance',
    'Maintain critical system list reviewed when architecture or outsourcing changes.',
    ['procedure', 'policy']
  ),
  sebi(
    'sebi-id-3',
    'Identify 3',
    'Threat intelligence',
    'Subscribe to relevant threat intelligence feeds and integrate insights into vulnerability and incident prioritization.',
    'risk_management',
    'ISAC or sector-specific feeds for capital markets threats; monthly threat briefings to SOC and CISO.',
    ['procedure', 'automated_monitoring']
  ),
  sebi(
    'sebi-prot-1',
    'Protect 1',
    'Identity and access management',
    'Enforce least privilege, role-based access, periodic access reviews, and timely de-provisioning for workforce and privileged users.',
    'access_control',
    'Integrate IdP with HR lifecycle; quarterly access recertification for trading and back-office systems.',
    ['technical_control', 'procedure']
  ),
  sebi(
    'sebi-prot-2',
    'Protect 2',
    'Multi-factor authentication',
    'MFA for remote access, privileged accounts, and access to critical systems and market infrastructure interfaces.',
    'access_control',
    'Phishing-resistant MFA for administrators; enforce MFA on VPN and cloud consoles.',
    ['technical_control']
  ),
  sebi(
    'sebi-prot-3',
    'Protect 3',
    'Network segmentation and perimeter security',
    'Segment networks to isolate critical systems; restrict east-west traffic and monitor boundary controls.',
    'network_security',
    'DMZ for external-facing services; firewall rules reviewed on change and quarterly.',
    ['technical_control', 'procedure']
  ),
  sebi(
    'sebi-prot-4',
    'Protect 4',
    'Encryption and key management',
    'Encrypt sensitive data at rest and in transit; manage cryptographic keys through approved key management processes.',
    'cryptography',
    'TLS 1.2+ for client and inter-system traffic; HSM or KMS for key storage where required.',
    ['technical_control', 'policy']
  ),
  sebi(
    'sebi-prot-5',
    'Protect 5',
    'Vulnerability and patch management',
    'Identify vulnerabilities through scanning and remediate per severity-based SLAs; emergency patching for critical exposures.',
    'vulnerability_management',
    'Monthly VA scans; critical patches within 7 days; track exceptions with risk acceptance.',
    ['procedure', 'technical_control']
  ),
  sebi(
    'sebi-prot-6',
    'Protect 6',
    'Secure software development',
    'Apply secure SDLC practices including code review, dependency scanning, and security testing before production release.',
    'change_management',
    'SAST/DAST in CI/CD; security sign-off for changes to critical applications.',
    ['procedure', 'technical_control']
  ),
  sebi(
    'sebi-prot-7',
    'Protect 7',
    'Endpoint and malware protection',
    'Deploy endpoint protection, EDR where appropriate, and enforce hardened baselines on servers and workstations.',
    'asset_management',
    'EDR on critical servers; standard build images with CIS-aligned hardening.',
    ['technical_control']
  ),
  sebi(
    'sebi-det-1',
    'Detect 1',
    'Logging and monitoring',
    'Centralized logging for critical systems with retention aligned to investigation and regulatory needs; protect log integrity.',
    'audit_logging',
    'SIEM ingestion for auth, firewall, application, and trading system logs; 180+ day retention.',
    ['technical_control', 'automated_monitoring']
  ),
  sebi(
    'sebi-det-2',
    'Detect 2',
    'Security operations and alerting',
    'Operate or outsource a security monitoring capability with defined use cases, alert triage, and escalation to incident response.',
    'incident_response',
    '24x7 or follow-the-sun SOC for critical entities; runbooks for high-severity alert types.',
    ['procedure', 'automated_monitoring']
  ),
  sebi(
    'sebi-det-3',
    'Detect 3',
    'Anomaly detection for market systems',
    'Monitor for anomalous activity on systems supporting trading, clearing, and customer-facing services.',
    'audit_logging',
    'UEBA or rule-based detection for unusual login patterns, data exfiltration, and privileged misuse.',
    ['technical_control', 'automated_monitoring']
  ),
  sebi(
    'sebi-res-1',
    'Respond 1',
    'Incident response plan',
    'Maintain and test an incident response plan covering detection, containment, eradication, recovery, and communication.',
    'incident_response',
    'Tabletop exercises at least annually; post-incident reviews with corrective actions.',
    ['policy', 'procedure']
  ),
  sebi(
    'sebi-res-2',
    'Respond 2',
    'SEBI and stakeholder notification',
    'Define criteria and timelines for notifying SEBI, exchanges, depositories, and affected stakeholders per regulatory requirements.',
    'incident_response',
    'Incident classification matrix with regulatory notification triggers and draft communication templates.',
    ['procedure', 'policy']
  ),
  sebi(
    'sebi-res-3',
    'Respond 3',
    'Forensics and evidence preservation',
    'Preserve forensic evidence and chain of custody for significant cyber incidents to support investigation and regulatory inquiry.',
    'incident_response',
    'Forensic toolkit and retained external IR partner for major incidents.',
    ['procedure', 'manual_process']
  ),
  sebi(
    'sebi-rec-1',
    'Recover 1',
    'Business continuity and disaster recovery',
    'BCP and DR plans for critical systems with defined RTO/RPO; test recovery procedures at least annually.',
    'business_continuity',
    'DR drill for core trading and settlement systems; document test results and gaps.',
    ['procedure', 'technical_control']
  ),
  sebi(
    'sebi-rec-2',
    'Recover 2',
    'Backup and restoration',
    'Perform encrypted backups of critical data and systems; test restoration regularly.',
    'business_continuity',
    'Immutable or air-gapped backups for ransomware resilience; quarterly restore tests.',
    ['technical_control', 'procedure']
  ),
  sebi(
    'sebi-test-1',
    'Test 1',
    'Vulnerability assessment and penetration testing',
    'Conduct periodic VAPT on internet-facing and critical internal systems by qualified independent assessors.',
    'vulnerability_management',
    'Annual external VAPT; remediate findings per risk rating; retain reports for audit.',
    ['third_party_attestation', 'procedure']
  ),
  sebi(
    'sebi-test-2',
    'Test 2',
    'Cyber resilience testing program',
    'Include scenario-based tests (tabletop, simulation, or red team where applicable) to validate detection and response capabilities.',
    'risk_management',
    'Annual resilience exercise covering ransomware and market disruption scenarios.',
    ['procedure', 'manual_process']
  ),
  sebi(
    'sebi-vendor-1',
    'Vendor 1',
    'Third-party and outsourcing risk',
    'Assess cybersecurity posture of material vendors, cloud providers, and outsourced operations before onboarding and periodically thereafter.',
    'vendor_management',
    'Due diligence questionnaires, SOC 2/ISO reports, and contractual security clauses for critical vendors.',
    ['contractual', 'procedure']
  ),
  sebi(
    'sebi-vendor-2',
    'Vendor 2',
    'Market infrastructure connectivity',
    'Apply enhanced controls for connections to exchanges, depositories, and other market infrastructure providers.',
    'vendor_management',
    'Documented connectivity architecture, approved APIs, and monitoring of integration points.',
    ['procedure', 'technical_control']
  ),
  sebi(
    'sebi-hr-1',
    'HR 1',
    'Cybersecurity awareness and training',
    'Mandatory cybersecurity awareness for all personnel and role-based training for privileged and development staff.',
    'human_resources',
    'Annual awareness program with phishing simulations; developer secure coding training.',
    ['training_awareness']
  ),
  sebi(
    'sebi-hr-2',
    'HR 2',
    'Insider risk and personnel screening',
    'Background verification and insider threat controls for roles with access to critical systems or sensitive market data.',
    'human_resources',
    'Pre-employment checks and exit procedures revoking access on last working day.',
    ['procedure', 'policy']
  ),
];
