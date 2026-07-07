import type { PrivacyControl, PrivacyModuleId, FrameworkMapping } from '../../types';

function ctrl(
  id: string,
  moduleId: PrivacyModuleId,
  reference: string,
  title: string,
  description: string,
  guidance: string,
  frameworkMappings: FrameworkMapping[]
): PrivacyControl {
  return { id, moduleId, reference, title, description, guidance, frameworkMappings };
}

/** Unified privacy control catalog mapped to NIST PF, ISO 27701, GDPR, and DPDP. */
export const PRIVACY_CONTROLS: PrivacyControl[] = [
  // ── Governance ──────────────────────────────────────────────────────────
  ctrl(
    'pc-gov-01',
    'governance',
    'GOV-01',
    'Privacy program charter',
    'Establish a documented privacy program with defined scope, objectives, and executive sponsorship.',
    'Publish a privacy program charter approved by executive leadership; review annually.',
    [
      { frameworkId: 'nist-privacy', reference: 'GV.PO-P1' },
      { frameworkId: 'iso27701', reference: '5.1' },
      { frameworkId: 'gdpr', reference: 'Art. 24' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8(1)' },
    ]
  ),
  ctrl(
    'pc-gov-02',
    'governance',
    'GOV-02',
    'Privacy roles and responsibilities',
    'Define and assign privacy roles including DPO/Privacy Lead, with clear accountability across business units.',
    'Maintain RACI matrix; appoint DPO where required under Art. 37 / DPDP Rules.',
    [
      { frameworkId: 'nist-privacy', reference: 'GV.PO-P2' },
      { frameworkId: 'iso27701', reference: '5.2' },
      { frameworkId: 'gdpr', reference: 'Art. 37-39' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 10' },
    ]
  ),
  ctrl(
    'pc-gov-03',
    'governance',
    'GOV-03',
    'Privacy policy framework',
    'Maintain a hierarchy of privacy policies covering processing principles, roles, and minimum standards.',
    'Align policies with applicable law; version control and annual review cycle.',
    [
      { frameworkId: 'nist-privacy', reference: 'GV.PO-P3' },
      { frameworkId: 'iso27701', reference: '5.3' },
      { frameworkId: 'gdpr', reference: 'Art. 5, 24' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 4, 8' },
    ]
  ),
  ctrl(
    'pc-gov-04',
    'governance',
    'GOV-04',
    'Regulatory and legal inventory',
    'Maintain an inventory of applicable privacy laws, regulations, and contractual obligations.',
    'Map obligations to controls; update on regulatory changes (DPDP Rules, state laws, sector rules).',
    [
      { frameworkId: 'nist-privacy', reference: 'GV.MT-P1' },
      { frameworkId: 'iso27701', reference: '5.4' },
      { frameworkId: 'gdpr', reference: 'Art. 24' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8' },
    ]
  ),

  // ── Data Inventory ────────────────────────────────────────────────────────
  ctrl(
    'pc-inv-01',
    'data-inventory',
    'INV-01',
    'Records of Processing Activities (RoPA)',
    'Maintain comprehensive records of all processing activities including purposes, categories, recipients, and retention.',
    'RoPA must be available to supervisory authority on request; review quarterly.',
    [
      { frameworkId: 'nist-privacy', reference: 'ID.IM-P1' },
      { frameworkId: 'iso27701', reference: '7.2.1' },
      { frameworkId: 'gdpr', reference: 'Art. 30' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8(9)' },
    ]
  ),
  ctrl(
    'pc-inv-02',
    'data-inventory',
    'INV-02',
    'Data flow mapping',
    'Document data flows from collection through processing, storage, sharing, and deletion.',
    'Use data flow diagrams per system; identify cross-border flows.',
    [
      { frameworkId: 'nist-privacy', reference: 'ID.IM-P2' },
      { frameworkId: 'iso27701', reference: '7.2.2' },
      { frameworkId: 'gdpr', reference: 'Art. 30' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8' },
    ]
  ),
  ctrl(
    'pc-inv-03',
    'data-inventory',
    'INV-03',
    'Personal data categorization',
    'Classify personal data by category (contact, financial, health, biometric, children data, etc.).',
    'Apply enhanced controls for special categories and children data per DPDP Sec. 9.',
    [
      { frameworkId: 'nist-privacy', reference: 'ID.DE-P1' },
      { frameworkId: 'iso27701', reference: '7.2.3' },
      { frameworkId: 'gdpr', reference: 'Art. 9' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 9' },
    ]
  ),
  ctrl(
    'pc-inv-04',
    'data-inventory',
    'INV-04',
    'System and application inventory',
    'Inventory all systems processing personal data with owners, data types, and integration points.',
    'Link systems to RoPA entries; flag shadow IT and unsanctioned tools.',
    [
      { frameworkId: 'nist-privacy', reference: 'ID.AM-P1' },
      { frameworkId: 'iso27701', reference: '7.2.4' },
      { frameworkId: 'gdpr', reference: 'Art. 30' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8' },
    ]
  ),

  // ── Data Discovery ────────────────────────────────────────────────────────
  ctrl(
    'pc-disc-01',
    'data-discovery',
    'DISC-01',
    'Data discovery program and scope',
    'Define and maintain a data discovery program covering in-scope systems, scan frequency, and accountable owners.',
    'Document discovery scope aligned to RoPA; executive sponsor for enterprise-wide coverage.',
    [
      { frameworkId: 'nist-privacy', reference: 'ID.AM-P2' },
      { frameworkId: 'iso27701', reference: '7.2.5' },
      { frameworkId: 'gdpr', reference: 'Art. 30' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8(9)' },
    ]
  ),
  ctrl(
    'pc-disc-02',
    'data-discovery',
    'DISC-02',
    'Structured data source discovery',
    'Discover personal data in databases, data warehouses, and application backends using automated scanning.',
    'Schedule recurring scans; validate findings with system owners; track remediation of unknown stores.',
    [
      { frameworkId: 'nist-privacy', reference: 'ID.AM-P3' },
      { frameworkId: 'iso27701', reference: '7.2.6' },
      { frameworkId: 'gdpr', reference: 'Art. 30(1)' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8' },
    ]
  ),
  ctrl(
    'pc-disc-03',
    'data-discovery',
    'DISC-03',
    'Unstructured and cloud SaaS discovery',
    'Discover personal data in file shares, collaboration tools, email archives, and sanctioned/unsanctioned SaaS.',
    'Include M365, Google Workspace, Slack, and cloud storage; flag shadow IT processing personal data.',
    [
      { frameworkId: 'nist-privacy', reference: 'ID.AM-P4' },
      { frameworkId: 'iso27701', reference: '7.2.7' },
      { frameworkId: 'gdpr', reference: 'Art. 30, 32' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8(5)' },
    ]
  ),
  ctrl(
    'pc-disc-04',
    'data-discovery',
    'DISC-04',
    'Discovery validation and RoPA feed',
    'Validate discovery results, resolve false positives, and feed confirmed assets into RoPA and classification.',
    'Quarterly reconciliation between discovery inventory and RoPA; escalate gaps to data owners.',
    [
      { frameworkId: 'nist-privacy', reference: 'ID.IM-P3' },
      { frameworkId: 'iso27701', reference: '7.2.8' },
      { frameworkId: 'gdpr', reference: 'Art. 30' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8(9)' },
    ]
  ),

  // ── Data Classification ───────────────────────────────────────────────────
  ctrl(
    'pc-clas-01',
    'data-classification',
    'CLAS-01',
    'Classification taxonomy and scheme',
    'Establish a data classification taxonomy covering personal data categories, sensitivity levels, and handling requirements.',
    'Publish taxonomy approved by DPO; map to ISO 27001 / internal data handling standards.',
    [
      { frameworkId: 'nist-privacy', reference: 'ID.DE-P2' },
      { frameworkId: 'iso27701', reference: '7.3.1' },
      { frameworkId: 'gdpr', reference: 'Art. 5, 9' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 9' },
    ]
  ),
  ctrl(
    'pc-clas-02',
    'data-classification',
    'CLAS-02',
    'Automated classification and labeling',
    'Implement automated classification rules, DLP labels, or discovery-based tagging for personal data at rest and in motion.',
    'Tune rules for PII patterns; integrate with email, files, and databases; review false positive rates.',
    [
      { frameworkId: 'nist-privacy', reference: 'ID.DE-P3' },
      { frameworkId: 'iso27701', reference: '7.3.2' },
      { frameworkId: 'gdpr', reference: 'Art. 25, 32' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8(5)' },
    ]
  ),
  ctrl(
    'pc-clas-03',
    'data-classification',
    'CLAS-03',
    'Sensitive and special category handling',
    'Define enhanced handling rules for special category data, children data, financial, health, and biometric information.',
    'Apply stricter access, encryption, and retention per category; DPDP Sec. 9 verifiable parental consent where applicable.',
    [
      { frameworkId: 'nist-privacy', reference: 'ID.DE-P4' },
      { frameworkId: 'iso27701', reference: '7.3.3' },
      { frameworkId: 'gdpr', reference: 'Art. 9, 10' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 9' },
    ]
  ),
  ctrl(
    'pc-clas-04',
    'data-classification',
    'CLAS-04',
    'Classification review and accuracy',
    'Periodically review classification accuracy, reclassify on processing changes, and measure coverage metrics.',
    'Target >90% labeled coverage for in-scope stores; sample-based accuracy audits quarterly.',
    [
      { frameworkId: 'nist-privacy', reference: 'ID.DE-P5' },
      { frameworkId: 'iso27701', reference: '7.3.4' },
      { frameworkId: 'gdpr', reference: 'Art. 5(1)(d)' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8' },
    ]
  ),

  // ── Risk & DPIA ───────────────────────────────────────────────────────────
  ctrl(
    'pc-risk-01',
    'risk-dpia',
    'RISK-01',
    'Privacy risk assessment program',
    'Conduct periodic privacy risk assessments across processing activities and organizational changes.',
    'Integrate with enterprise risk management; reassess on material changes.',
    [
      { frameworkId: 'nist-privacy', reference: 'GV.RM-P1' },
      { frameworkId: 'iso27701', reference: '6.1' },
      { frameworkId: 'gdpr', reference: 'Art. 24, 32' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8(5)' },
    ]
  ),
  ctrl(
    'pc-risk-02',
    'risk-dpia',
    'RISK-02',
    'Data Protection Impact Assessment (DPIA)',
    'Perform DPIAs for high-risk processing including profiling, large-scale monitoring, and sensitive data.',
    'DPIA triggers documented; consult DPO; seek supervisory authority opinion if residual risk remains.',
    [
      { frameworkId: 'nist-privacy', reference: 'ID.RA-P1' },
      { frameworkId: 'iso27701', reference: '6.2' },
      { frameworkId: 'gdpr', reference: 'Art. 35' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8(5)' },
    ]
  ),
  ctrl(
    'pc-risk-03',
    'risk-dpia',
    'RISK-03',
    'Legitimate Interest Assessment',
    'Document and balance legitimate interests against data subject rights where relied upon as legal basis.',
    'Three-part test: purpose, necessity, balancing; retain LIA records.',
    [
      { frameworkId: 'nist-privacy', reference: 'ID.RA-P2' },
      { frameworkId: 'iso27701', reference: '7.2.5' },
      { frameworkId: 'gdpr', reference: 'Art. 6(1)(f)' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 7' },
    ]
  ),

  // ── Consent & Legal Basis ─────────────────────────────────────────────────
  ctrl(
    'pc-con-01',
    'consent-legal-basis',
    'CON-01',
    'Lawful basis determination',
    'Identify and document lawful basis (consent, contract, legal obligation, vital interests, public task, legitimate use) for each activity.',
    'One basis per activity; document in RoPA; review on purpose changes.',
    [
      { frameworkId: 'nist-privacy', reference: 'CT.DM-P1' },
      { frameworkId: 'iso27701', reference: '7.2.6' },
      { frameworkId: 'gdpr', reference: 'Art. 6' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 4, 7' },
    ]
  ),
  ctrl(
    'pc-con-02',
    'consent-legal-basis',
    'CON-02',
    'Valid consent management',
    'Obtain consent that is free, specific, informed, and unambiguous with clear affirmative action.',
    'No pre-ticked boxes; granular options; record timestamp, scope, and channel.',
    [
      { frameworkId: 'nist-privacy', reference: 'CT.DM-P2' },
      { frameworkId: 'iso27701', reference: '7.2.7' },
      { frameworkId: 'gdpr', reference: 'Art. 7' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 6' },
    ]
  ),
  ctrl(
    'pc-con-03',
    'consent-legal-basis',
    'CON-03',
    'Consent withdrawal',
    'Enable data principals to withdraw consent as easily as giving it; cease processing upon withdrawal.',
    'Self-service withdrawal; propagate to processors within SLA; audit trail.',
    [
      { frameworkId: 'nist-privacy', reference: 'CT.DM-P3' },
      { frameworkId: 'iso27701', reference: '7.2.8' },
      { frameworkId: 'gdpr', reference: 'Art. 7(3)' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 6(4)' },
    ]
  ),
  ctrl(
    'pc-con-04',
    'consent-legal-basis',
    'CON-04',
    'Purpose limitation',
    'Process personal data only for specified, explicit, and legitimate purposes; no further incompatible processing.',
    'Purpose fields in RoPA; change management for new purposes requiring new basis.',
    [
      { frameworkId: 'nist-privacy', reference: 'CT.DP-P1' },
      { frameworkId: 'iso27701', reference: '7.2.9' },
      { frameworkId: 'gdpr', reference: 'Art. 5(1)(b)' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 4' },
    ]
  ),

  // ── Transparency ──────────────────────────────────────────────────────────
  ctrl(
    'pc-trn-01',
    'transparency',
    'TRN-01',
    'Privacy notice at collection',
    'Provide clear privacy notices at or before data collection with required disclosures.',
    'Layered notices; plain language; DPDP notice in English and optionally regional languages.',
    [
      { frameworkId: 'nist-privacy', reference: 'CM.AW-P1' },
      { frameworkId: 'iso27701', reference: '7.3.1' },
      { frameworkId: 'gdpr', reference: 'Art. 12-14' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 5' },
    ]
  ),
  ctrl(
    'pc-trn-02',
    'transparency',
    'TRN-02',
    'Cookie and tracking disclosures',
    'Disclose use of cookies, pixels, and tracking technologies with consent where required.',
    'Cookie banner with granular categories; honor Do Not Track where applicable.',
    [
      { frameworkId: 'nist-privacy', reference: 'CM.AW-P2' },
      { frameworkId: 'iso27701', reference: '7.3.2' },
      { frameworkId: 'gdpr', reference: 'Art. 13-14, ePrivacy' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 5' },
    ]
  ),
  ctrl(
    'pc-trn-03',
    'transparency',
    'TRN-03',
    'Employee and candidate privacy notices',
    'Provide workforce-specific privacy notices for HR processing activities.',
    'Separate notice for employees, contractors, and candidates.',
    [
      { frameworkId: 'nist-privacy', reference: 'CM.AW-P3' },
      { frameworkId: 'iso27701', reference: '7.3.3' },
      { frameworkId: 'gdpr', reference: 'Art. 13-14' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 5, 7' },
    ]
  ),

  // ── Data Subject Rights ─────────────────────────────────────────────────────
  ctrl(
    'pc-dsr-01',
    'data-subject-rights',
    'DSR-01',
    'DSAR intake and verification',
    'Establish a channel for data subject requests with identity verification procedures.',
    'Web form, email, or portal; verify requester identity proportionately.',
    [
      { frameworkId: 'nist-privacy', reference: 'CT.DP-P2' },
      { frameworkId: 'iso27701', reference: '7.3.4' },
      { frameworkId: 'gdpr', reference: 'Art. 12' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 11' },
    ]
  ),
  ctrl(
    'pc-dsr-02',
    'data-subject-rights',
    'DSR-02',
    'Right of access',
    'Fulfill access requests with a copy of personal data and supplementary information within legal timelines.',
    '30 days GDPR; reasonable period under DPDP; extend with notice if complex.',
    [
      { frameworkId: 'nist-privacy', reference: 'CT.DP-P3' },
      { frameworkId: 'iso27701', reference: '7.3.5' },
      { frameworkId: 'gdpr', reference: 'Art. 15' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 11' },
    ]
  ),
  ctrl(
    'pc-dsr-03',
    'data-subject-rights',
    'DSR-03',
    'Rectification and erasure',
    'Process requests to correct inaccurate data and erase data when no lawful basis remains.',
    'Propagate corrections to processors; document erasure across systems.',
    [
      { frameworkId: 'nist-privacy', reference: 'CT.DP-P4' },
      { frameworkId: 'iso27701', reference: '7.3.6' },
      { frameworkId: 'gdpr', reference: 'Art. 16-17' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 12' },
    ]
  ),
  ctrl(
    'pc-dsr-04',
    'data-subject-rights',
    'DSR-04',
    'Portability and objection',
    'Provide data in structured, machine-readable format; honor objections to processing.',
    'Export in JSON/CSV; stop processing on valid objection unless compelling grounds.',
    [
      { frameworkId: 'nist-privacy', reference: 'CT.DP-P5' },
      { frameworkId: 'iso27701', reference: '7.3.7' },
      { frameworkId: 'gdpr', reference: 'Art. 18-21' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 11-12' },
    ]
  ),
  ctrl(
    'pc-dsr-05',
    'data-subject-rights',
    'DSR-05',
    'Nomination of another individual',
    'Enable Data Principals to nominate another individual to exercise rights in case of death or incapacity.',
    'DPDP-specific requirement; nomination register and verification process.',
    [
      { frameworkId: 'nist-privacy', reference: 'CT.DP-P6' },
      { frameworkId: 'iso27701', reference: '7.3.8' },
      { frameworkId: 'gdpr', reference: 'Art. 80' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 14' },
    ]
  ),

  // ── Privacy by Design ───────────────────────────────────────────────────────
  ctrl(
    'pc-pbd-01',
    'privacy-by-design',
    'PBD-01',
    'Privacy in SDLC',
    'Integrate privacy reviews into software development lifecycle gates for new features and systems.',
    'Privacy checklist at design, build, and release; block release on high-risk gaps.',
    [
      { frameworkId: 'nist-privacy', reference: 'CT.PO-P1' },
      { frameworkId: 'iso27701', reference: '7.4.1' },
      { frameworkId: 'gdpr', reference: 'Art. 25' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8(5)' },
    ]
  ),
  ctrl(
    'pc-pbd-02',
    'privacy-by-design',
    'PBD-02',
    'Data minimization',
    'Collect and process only personal data adequate, relevant, and limited to what is necessary.',
    'Field-level justification; periodic data audits; delete unused fields.',
    [
      { frameworkId: 'nist-privacy', reference: 'CT.DP-P7' },
      { frameworkId: 'iso27701', reference: '7.4.2' },
      { frameworkId: 'gdpr', reference: 'Art. 5(1)(c)' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 4' },
    ]
  ),
  ctrl(
    'pc-pbd-03',
    'privacy-by-design',
    'PBD-03',
    'Privacy by default',
    'Default settings must ensure only necessary personal data is processed by default.',
    'Opt-in not opt-out for optional processing; minimal visibility by default.',
    [
      { frameworkId: 'nist-privacy', reference: 'CT.PO-P2' },
      { frameworkId: 'iso27701', reference: '7.4.3' },
      { frameworkId: 'gdpr', reference: 'Art. 25(2)' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8(5)' },
    ]
  ),
  ctrl(
    'pc-pbd-04',
    'privacy-by-design',
    'PBD-04',
    'Automated decision-making safeguards',
    'Provide transparency and safeguards for automated processing including profiling with legal effects.',
    'Human review option; logic explanation; DPDP significant decision rights.',
    [
      { frameworkId: 'nist-privacy', reference: 'CT.PO-P3' },
      { frameworkId: 'iso27701', reference: '7.4.4' },
      { frameworkId: 'gdpr', reference: 'Art. 22' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 15' },
    ]
  ),

  // ── Processors & Vendors ────────────────────────────────────────────────────
  ctrl(
    'pc-vnd-01',
    'processors-vendors',
    'VND-01',
    'Processor agreements (DPA)',
    'Execute written data processing agreements with all processors covering required clauses.',
    'GDPR Art. 28 clauses; DPDP processor obligations; sub-processor flow-down.',
    [
      { frameworkId: 'nist-privacy', reference: 'GV.PO-P4' },
      { frameworkId: 'iso27701', reference: '7.5.1' },
      { frameworkId: 'gdpr', reference: 'Art. 28' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8(8)' },
    ]
  ),
  ctrl(
    'pc-vnd-02',
    'processors-vendors',
    'VND-02',
    'Sub-processor management',
    'Maintain register of sub-processors; obtain authorization; notify on changes.',
    'Sub-processor list published; objection rights; due diligence on additions.',
    [
      { frameworkId: 'nist-privacy', reference: 'GV.PO-P5' },
      { frameworkId: 'iso27701', reference: '7.5.2' },
      { frameworkId: 'gdpr', reference: 'Art. 28(2-4)' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8(8)' },
    ]
  ),
  ctrl(
    'pc-vnd-03',
    'processors-vendors',
    'VND-03',
    'Vendor privacy assessment',
    'Assess processor privacy posture before onboarding and periodically thereafter.',
    'Questionnaire aligned to SIG Lite / custom; risk-tiered review frequency.',
    [
      { frameworkId: 'nist-privacy', reference: 'GV.PO-P6' },
      { frameworkId: 'iso27701', reference: '7.5.3' },
      { frameworkId: 'gdpr', reference: 'Art. 28, 32' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8(8)' },
    ]
  ),
  ctrl(
    'pc-vnd-04',
    'processors-vendors',
    'VND-04',
    'Processor oversight and audit',
    'Monitor processor compliance through audits, certifications, and assurance reports.',
    'Annual SOC 2 / ISO 27001 review; right-to-audit clauses exercised on risk.',
    [
      { frameworkId: 'nist-privacy', reference: 'GV.MT-P2' },
      { frameworkId: 'iso27701', reference: '7.5.4' },
      { frameworkId: 'gdpr', reference: 'Art. 28(3)(h)' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8(8)' },
    ]
  ),

  // ── Cross-Border Transfers ──────────────────────────────────────────────────
  ctrl(
    'pc-xfr-01',
    'cross-border-transfers',
    'XFR-01',
    'Transfer register',
    'Document all cross-border personal data transfers with destination, mechanism, and legal basis.',
    'Map flows in RoPA; flag restricted destinations.',
    [
      { frameworkId: 'nist-privacy', reference: 'CT.DM-P4' },
      { frameworkId: 'iso27701', reference: '7.5.5' },
      { frameworkId: 'gdpr', reference: 'Art. 44' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 16' },
    ]
  ),
  ctrl(
    'pc-xfr-02',
    'cross-border-transfers',
    'XFR-02',
    'Transfer mechanisms',
    'Implement appropriate safeguards — SCCs, adequacy decisions, BCRs, or statutory exemptions.',
    'Execute 2021 SCCs; India government whitelist per DPDP Rules.',
    [
      { frameworkId: 'nist-privacy', reference: 'CT.DM-P5' },
      { frameworkId: 'iso27701', reference: '7.5.6' },
      { frameworkId: 'gdpr', reference: 'Art. 46-49' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 16' },
    ]
  ),
  ctrl(
    'pc-xfr-03',
    'cross-border-transfers',
    'XFR-03',
    'Transfer Impact Assessment',
    'Assess destination country laws and supplementary measures for transfers.',
    'TIA per Schrems II; document supplementary technical and organizational measures.',
    [
      { frameworkId: 'nist-privacy', reference: 'ID.RA-P3' },
      { frameworkId: 'iso27701', reference: '7.5.7' },
      { frameworkId: 'gdpr', reference: 'Art. 46' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 16' },
    ]
  ),

  // ── Breach Response ─────────────────────────────────────────────────────────
  ctrl(
    'pc-br-01',
    'breach-response',
    'BR-01',
    'Breach detection and triage',
    'Detect and triage suspected personal data breaches through defined incident procedures.',
    'Integrate with SOC/SIEM; privacy team on-call; severity classification.',
    [
      { frameworkId: 'nist-privacy', reference: 'PR.DS-P1' },
      { frameworkId: 'iso27701', reference: '7.3.9' },
      { frameworkId: 'gdpr', reference: 'Art. 33-34' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8(6)' },
    ]
  ),
  ctrl(
    'pc-br-02',
    'breach-response',
    'BR-02',
    'Regulatory breach notification',
    'Notify supervisory authority / Board within required timelines when breach poses risk.',
    '72 hours GDPR; DPDP Board notification per Rules; document decision rationale.',
    [
      { frameworkId: 'nist-privacy', reference: 'CM.BP-P1' },
      { frameworkId: 'iso27701', reference: '7.3.10' },
      { frameworkId: 'gdpr', reference: 'Art. 33' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8(6)' },
    ]
  ),
  ctrl(
    'pc-br-03',
    'breach-response',
    'BR-03',
    'Data Principal breach communication',
    'Notify affected Data Principals when breach is likely to result in significant harm.',
    'Clear communication with nature of breach, consequences, and remedial measures.',
    [
      { frameworkId: 'nist-privacy', reference: 'CM.BP-P2' },
      { frameworkId: 'iso27701', reference: '7.3.11' },
      { frameworkId: 'gdpr', reference: 'Art. 34' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8(6)' },
    ]
  ),
  ctrl(
    'pc-br-04',
    'breach-response',
    'BR-04',
    'Breach register and lessons learned',
    'Maintain breach register and conduct post-incident reviews with corrective actions.',
    'All breaches logged regardless of notification; trend analysis quarterly.',
    [
      { frameworkId: 'nist-privacy', reference: 'GV.MT-P3' },
      { frameworkId: 'iso27701', reference: '7.3.12' },
      { frameworkId: 'gdpr', reference: 'Art. 33(5)' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8(6)' },
    ]
  ),

  // ── Retention & Disposal ────────────────────────────────────────────────────
  ctrl(
    'pc-ret-01',
    'retention-disposal',
    'RET-01',
    'Retention schedule',
    'Define and enforce retention periods for each category of personal data.',
    'Legal and business justification per category; publish internal schedule.',
    [
      { frameworkId: 'nist-privacy', reference: 'CT.DM-P6' },
      { frameworkId: 'iso27701', reference: '7.2.10' },
      { frameworkId: 'gdpr', reference: 'Art. 5(1)(e)' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8(7)' },
    ]
  ),
  ctrl(
    'pc-ret-02',
    'retention-disposal',
    'RET-02',
    'Automated deletion',
    'Implement technical controls to delete or anonymize data when retention period expires.',
    'Scheduled jobs; deletion certificates; exception for legal hold.',
    [
      { frameworkId: 'nist-privacy', reference: 'CT.DM-P7' },
      { frameworkId: 'iso27701', reference: '7.2.11' },
      { frameworkId: 'gdpr', reference: 'Art. 5(1)(e), 17' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8(7), 12' },
    ]
  ),
  ctrl(
    'pc-ret-03',
    'retention-disposal',
    'RET-03',
    'Secure disposal',
    'Securely dispose of personal data on physical and electronic media.',
    'NIST 800-88 sanitization; certified destruction for hardware.',
    [
      { frameworkId: 'nist-privacy', reference: 'PR.DS-P2' },
      { frameworkId: 'iso27701', reference: '7.2.12' },
      { frameworkId: 'gdpr', reference: 'Art. 5(1)(e), 32' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8(7)' },
    ]
  ),

  // ── Training & Awareness ────────────────────────────────────────────────────
  ctrl(
    'pc-trn-04',
    'training-awareness',
    'TRN-04',
    'Privacy awareness training',
    'Deliver annual privacy training to all personnel with role-based modules.',
    'Track completion; remedial training for repeat incidents.',
    [
      { frameworkId: 'nist-privacy', reference: 'GV.PO-P7' },
      { frameworkId: 'iso27701', reference: '7.2.13' },
      { frameworkId: 'gdpr', reference: 'Art. 39' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8' },
    ]
  ),
  ctrl(
    'pc-trn-05',
    'training-awareness',
    'TRN-05',
    'Role-based privacy training',
    'Provide specialized training for engineering, HR, marketing, and customer support teams.',
    'Developer secure coding; HR lawful processing; marketing consent rules.',
    [
      { frameworkId: 'nist-privacy', reference: 'GV.PO-P8' },
      { frameworkId: 'iso27701', reference: '7.2.14' },
      { frameworkId: 'gdpr', reference: 'Art. 39' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8' },
    ]
  ),

  // ── Monitoring & Audit ────────────────────────────────────────────────────────
  ctrl(
    'pc-aud-01',
    'monitoring-audit',
    'AUD-01',
    'Privacy program metrics',
    'Define and track KPIs for privacy program effectiveness and maturity.',
    'DSAR SLA, training completion, open risks, breach count, control coverage.',
    [
      { frameworkId: 'nist-privacy', reference: 'GV.MT-P4' },
      { frameworkId: 'iso27701', reference: '9.1' },
      { frameworkId: 'gdpr', reference: 'Art. 24' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8' },
    ]
  ),
  ctrl(
    'pc-aud-02',
    'monitoring-audit',
    'AUD-02',
    'Internal privacy audit',
    'Conduct periodic internal audits of privacy controls and processing activities.',
    'Annual audit plan; findings tracked to remediation.',
    [
      { frameworkId: 'nist-privacy', reference: 'GV.MT-P5' },
      { frameworkId: 'iso27701', reference: '9.2' },
      { frameworkId: 'gdpr', reference: 'Art. 24' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8' },
    ]
  ),
  ctrl(
    'pc-aud-03',
    'monitoring-audit',
    'AUD-03',
    'Demonstrate accountability',
    'Maintain evidence demonstrating compliance with privacy obligations.',
    'Evidence repository per control; audit-ready export.',
    [
      { frameworkId: 'nist-privacy', reference: 'GV.MT-P6' },
      { frameworkId: 'iso27701', reference: '9.3' },
      { frameworkId: 'gdpr', reference: 'Art. 5(2), 24' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8(1)' },
    ]
  ),
  ctrl(
    'pc-aud-04',
    'monitoring-audit',
    'AUD-04',
    'Security of processing',
    'Implement appropriate technical and organizational security measures for personal data.',
    'Encryption, access control, resilience, testing — aligned with ISO 27001 Annex A.',
    [
      { frameworkId: 'nist-privacy', reference: 'PR.DS-P3' },
      { frameworkId: 'iso27701', reference: '8.2' },
      { frameworkId: 'gdpr', reference: 'Art. 32' },
      { frameworkId: 'india-dpdp', reference: 'Sec. 8(5)' },
    ]
  ),
];

export function getControlsForModule(moduleId: string): PrivacyControl[] {
  return PRIVACY_CONTROLS.filter((c) => c.moduleId === moduleId);
}

export function getControlsForFramework(frameworkId: string): PrivacyControl[] {
  return PRIVACY_CONTROLS.filter((c) =>
    c.frameworkMappings.some((m) => m.frameworkId === frameworkId)
  );
}

export function getControlById(id: string) {
  return PRIVACY_CONTROLS.find((c) => c.id === id);
}
