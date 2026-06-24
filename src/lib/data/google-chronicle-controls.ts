import type { Control, ComplianceMethod, ControlDomain } from '../types';

function chronicle(
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
    frameworkId: 'google-chronicle',
    reference,
    title,
    description,
    domain,
    guidance,
    suggestedMethods,
  };
}

/**
 * Google Security Operations (Chronicle) — SIEM/SOAR deployment and intelligence controls.
 * Aligns with Chronicle SecOps: ingestion, detection, investigation, response, and governance.
 */
export const GOOGLE_CHRONICLE_CONTROLS: Control[] = [
  chronicle(
    'chron-gov-1',
    'Gov 1',
    'SecOps program governance',
    'Establish governance for Google Security Operations (Chronicle) including ownership, charter, and alignment with enterprise risk and compliance objectives.',
    'governance',
    'Document SecOps charter with CISO sponsorship and quarterly review cadence.',
    ['policy', 'procedure']
  ),
  chronicle(
    'chron-gov-2',
    'Gov 2',
    'Chronicle RBAC and least privilege',
    'Configure role-based access in Chronicle with least privilege — separate roles for analysts, hunters, admins, and auditors. Enforce MFA for console access.',
    'access_control',
    'Map IAM roles to job functions; review access quarterly; disable dormant accounts.',
    ['technical_control', 'procedure']
  ),
  chronicle(
    'chron-gov-3',
    'Gov 3',
    'Data residency and tenant isolation',
    'Deploy Chronicle in the approved GCP region and document data residency, tenant boundaries, and cross-border log handling requirements.',
    'data_protection',
    'Confirm instance region matches regulatory requirements; document log data location.',
    ['policy', 'procedure']
  ),
  chronicle(
    'chron-ingest-1',
    'Ingest 1',
    'Log source inventory and coverage',
    'Maintain an inventory of all log sources forwarded to Chronicle — cloud (GCP/AWS/Azure), identity, endpoint, network, SaaS, and application logs.',
    'asset_management',
    'Map log sources to MITRE ATT&CK coverage gaps; target critical assets at 100% ingestion.',
    ['procedure', 'manual_process']
  ),
  chronicle(
    'chron-ingest-2',
    'Ingest 2',
    'Ingestion agent and forwarder hardening',
    'Deploy and harden Chronicle forwarders, bindplane, or native integrations with authenticated, encrypted transport and monitored health.',
    'network_security',
    'Monitor forwarder uptime; alert on ingestion lag exceeding defined SLA.',
    ['technical_control', 'automated_monitoring']
  ),
  chronicle(
    'chron-ingest-3',
    'Ingest 3',
    'Parser and normalization quality',
    'Configure parsers and UDM field mapping so security events normalize correctly for search, rules, and entity graph correlation.',
    'audit_logging',
    'Validate parser output against sample logs; track unmapped field rate below threshold.',
    ['technical_control', 'procedure']
  ),
  chronicle(
    'chron-ingest-4',
    'Ingest 4',
    'Ingestion SLA and capacity planning',
    'Define ingestion volume SLAs, license capacity limits, and alerting when throughput approaches entitlement or drops unexpectedly.',
    'governance',
    'Dashboard ingestion EPS/events-per-day vs. license; capacity review monthly.',
    ['automated_monitoring', 'procedure']
  ),
  chronicle(
    'chron-detect-1',
    'Detect 1',
    'Detection rule lifecycle management',
    'Manage YARA-L and built-in detection rules with documented lifecycle — develop, test, tune, deploy, retire — and version control.',
    'vulnerability_management',
    'Use rule repositories with peer review; track false positive rate per rule.',
    ['procedure', 'technical_control']
  ),
  chronicle(
    'chron-detect-2',
    'Detect 2',
    'MITRE ATT&CK-aligned detections',
    'Map detection rules to MITRE ATT&CK techniques and maintain coverage for priority threat scenarios relevant to the organization.',
    'risk_management',
    'ATT&CK coverage matrix updated quarterly; prioritize gaps for high-risk techniques.',
    ['procedure', 'manual_process']
  ),
  chronicle(
    'chron-detect-3',
    'Detect 3',
    'IOC and threat intelligence feeds',
    'Integrate IOC feeds, Mandiant intelligence, and curated threat intel into Chronicle for proactive matching and retrohunt.',
    'network_security',
    'Validate feed freshness; run retrohunts after major intel drops.',
    ['technical_control', 'automated_monitoring']
  ),
  chronicle(
    'chron-detect-4',
    'Detect 4',
    'Alert tuning and suppression governance',
    'Govern alert tuning, suppression rules, and risk scoring to reduce noise while preserving detection fidelity — changes require approval.',
    'change_management',
    'Change log for suppressions; review weekly with SOC lead sign-off.',
    ['procedure']
  ),
  chronicle(
    'chron-invest-1',
    'Investigate 1',
    'Case management workflow',
    'Use Chronicle cases for alert triage, investigation notes, evidence attachment, and handoff between Tier 1 and Tier 2 analysts.',
    'incident_response',
    'Define case states, SLAs, and escalation paths aligned to IR plan.',
    ['procedure', 'manual_process']
  ),
  chronicle(
    'chron-invest-2',
    'Investigate 2',
    'Entity graph and UEBA investigation',
    'Leverage entity graph, user behavior analytics, and search across UDM for lateral movement, credential abuse, and insider threat investigations.',
    'audit_logging',
    'Analyst playbooks for entity-centric investigation; training on Search and Data Canvas.',
    ['procedure', 'training_awareness']
  ),
  chronicle(
    'chron-invest-3',
    'Investigate 3',
    'Search and retention for forensics',
    'Ensure log retention and search performance support forensic timelines required by incident response and regulatory inquiry.',
    'audit_logging',
    'Document retention tiers; test search across incident time windows.',
    ['procedure', 'technical_control']
  ),
  chronicle(
    'chron-respond-1',
    'Respond 1',
    'SOAR and automated response playbooks',
    'Integrate Chronicle with SOAR or Google SecOps automation for enrichment, containment, and ticketing on high-confidence alerts.',
    'incident_response',
    'Playbooks for phishing, malware, and compromised account scenarios with human approval gates.',
    ['technical_control', 'procedure']
  ),
  chronicle(
    'chron-respond-2',
    'Respond 2',
    'Incident escalation and notification',
    'Define escalation from Chronicle alerts to incident command, legal, and executive notification per severity matrix.',
    'incident_response',
    'Run tabletop exercises using Chronicle-derived scenarios.',
    ['procedure']
  ),
  chronicle(
    'chron-integ-1',
    'Integrate 1',
    'GCP Security Command Center integration',
    'Integrate GCP SCC findings, Cloud Logging, and VPC Flow Logs into Chronicle for unified cloud visibility.',
    'network_security',
    'Verify SCC and Cloud Logging feeds; correlate with on-prem sources.',
    ['technical_control']
  ),
  chronicle(
    'chron-integ-2',
    'Integrate 2',
    'Third-party SIEM and ticketing export',
    'Where required, export Chronicle alerts or cases to enterprise SIEM, ITSM, or GRC tools for unified workflow.',
    'vendor_management',
    'Document integration architecture and data flow diagrams.',
    ['procedure', 'technical_control']
  ),
  chronicle(
    'chron-ret-1',
    'Ret 1',
    'Log retention and archival policy',
    'Define retention periods by log type aligned to compliance (SOC 2, ISO 27001, regulatory) and Chronicle license entitlements.',
    'data_protection',
    'Retention schedule mapped to control requirements; cold storage for long-term forensics.',
    ['policy', 'procedure']
  ),
  chronicle(
    'chron-ret-2',
    'Ret 2',
    'Backup and disaster recovery for SecOps',
    'Maintain backup of detection rules, parsers, dashboards, and runbooks; test recovery of Chronicle configuration after failure.',
    'business_continuity',
    'Export rule sets to version control; DR test annually.',
    ['procedure', 'manual_process']
  ),
  chronicle(
    'chron-metrics-1',
    'Metrics 1',
    'SOC metrics and KPI reporting',
    'Track MTTD, MTTR, alert volume, true positive rate, and ingestion health; report to leadership and GRC monthly.',
    'governance',
    'Executive dashboard in Chronicle or BI tool; tie metrics to risk register.',
    ['automated_monitoring', 'procedure']
  ),
  chronicle(
    'chron-metrics-2',
    'Metrics 2',
    'Detection coverage and purple team validation',
    'Validate detection efficacy through purple team exercises, atomic tests, and purple-knight style assessments mapped to Chronicle rules.',
    'vulnerability_management',
    'Annual purple team; remediate detection gaps within 30 days.',
    ['manual_process', 'third_party_attestation']
  ),
  chronicle(
    'chron-comp-1',
    'Comp 1',
    'Audit and compliance evidence from Chronicle',
    'Use Chronicle search, cases, and reports to produce audit evidence for logging, monitoring, and incident response controls.',
    'audit_logging',
    'Saved searches and scheduled reports for auditor requests; export case timelines.',
    ['procedure', 'manual_process']
  ),
];
