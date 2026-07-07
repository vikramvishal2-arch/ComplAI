import type {
  ComplianceMethod,
  ComplianceStatus,
  ControlIssueSeverity,
  PrivacyModuleId,
  RemediationAction,
} from '../types';

export interface ComplianceTemplate {
  id: string;
  name: string;
  status: ComplianceStatus;
  complianceMethod: ComplianceMethod;
  owner: string;
  implementationApproach: string;
  evidenceNotes: string;
}

export interface RemediationTemplate {
  id: string;
  name: string;
  action: Omit<RemediationAction, 'id'>;
}

export interface IssueTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  severity: ControlIssueSeverity;
}

const MODULE_COMPLIANCE: Record<PrivacyModuleId, ComplianceTemplate[]> = {
  governance: [
    {
      id: 'gov-policy',
      name: 'Policy-based compliance',
      status: 'implementing',
      complianceMethod: 'policy',
      owner: 'DPO / Privacy Lead',
      implementationApproach:
        'Adopt the PrivyCore privacy program charter template. Obtain executive sign-off. Publish on intranet and communicate to all business units annually.',
      evidenceNotes: 'Signed charter PDF, board/executive approval email, intranet publication screenshot.',
    },
    {
      id: 'gov-procedure',
      name: 'Procedure & RACI',
      status: 'planning',
      complianceMethod: 'procedure',
      owner: 'Privacy Program Manager',
      implementationApproach:
        'Document privacy roles (DPO, Privacy Champions, Legal, IT) in a RACI matrix. Assign owners per processing activity in RoPA.',
      evidenceNotes: 'RACI matrix, role appointment letters, org chart with privacy contacts.',
    },
  ],
  'data-inventory': [
    {
      id: 'inv-ropa',
      name: 'RoPA template rollout',
      status: 'implementing',
      complianceMethod: 'manual_process',
      owner: 'Data Governance Lead',
      implementationApproach:
        'Deploy standard RoPA template (Art. 30 / DPDP Sec. 8). Interview system owners. Maintain central register with quarterly review.',
      evidenceNotes: 'RoPA spreadsheet/export, interview records, quarterly review sign-off.',
    },
    {
      id: 'inv-flow',
      name: 'Data flow mapping',
      status: 'planning',
      complianceMethod: 'procedure',
      owner: 'Enterprise Architecture',
      implementationApproach:
        'Create data flow diagrams for top 10 processing activities. Identify collection points, processors, and cross-border transfers.',
      evidenceNotes: 'Data flow diagrams (Visio/Lucidchart), system integration inventory.',
    },
  ],
  'data-discovery': [
    {
      id: 'disc-program',
      name: 'Discovery program charter',
      status: 'planning',
      complianceMethod: 'procedure',
      owner: 'Data Discovery Lead',
      implementationApproach:
        'Define discovery scope: production DBs, data warehouses, file shares, M365, and top 20 SaaS apps. Set monthly scan cadence and owner validation SLA.',
      evidenceNotes: 'Discovery scope document, scan schedule, tool configuration export.',
    },
    {
      id: 'disc-tool',
      name: 'Automated discovery tool',
      status: 'implementing',
      complianceMethod: 'technical_control',
      owner: 'IT Security / Data Team',
      implementationApproach:
        'Deploy discovery scanner (e.g. Microsoft Purview, BigID, or open-source). Connect structured sources first, then unstructured. Feed results to RoPA workflow.',
      evidenceNotes: 'Tool deployment evidence, connector list, sample discovery report.',
    },
  ],
  'data-classification': [
    {
      id: 'clas-taxonomy',
      name: 'Classification taxonomy',
      status: 'planning',
      complianceMethod: 'policy',
      owner: 'Data Protection Officer',
      implementationApproach:
        'Publish 4-tier taxonomy: Public, Internal, Confidential, Restricted. Map PII types (contact, financial, health, children) to handling rules per tier.',
      evidenceNotes: 'Approved taxonomy document, handling rules matrix, staff communication.',
    },
    {
      id: 'clas-dlp',
      name: 'DLP / auto-labeling',
      status: 'implementing',
      complianceMethod: 'technical_control',
      owner: 'Information Security',
      implementationApproach:
        'Configure DLP or sensitivity labels in M365/Google. Auto-tag PII patterns. Block external sharing of Restricted data. Review false positives monthly.',
      evidenceNotes: 'DLP policy export, label configuration, tuning log, coverage dashboard.',
    },
  ],
  'risk-dpia': [
    {
      id: 'dpia-template',
      name: 'DPIA template & workflow',
      status: 'implementing',
      complianceMethod: 'procedure',
      owner: 'Privacy Risk Manager',
      implementationApproach:
        'Roll out DPIA template aligned to ICO/EDPB guidelines. Require DPIA for new high-risk processing, AI, large-scale profiling, and children data.',
      evidenceNotes: 'DPIA template, completed sample DPIA, workflow approval records.',
    },
    {
      id: 'dpia-register',
      name: 'Privacy risk register',
      status: 'planning',
      complianceMethod: 'manual_process',
      owner: 'DPO',
      implementationApproach:
        'Maintain privacy risk register linked to processing activities. Score inherent/residual risk. Track treatment plans to closure.',
      evidenceNotes: 'Risk register export, treatment plan evidence, management review minutes.',
    },
  ],
  'consent-legal-basis': [
    {
      id: 'consent-cmp',
      name: 'Consent management platform',
      status: 'implementing',
      complianceMethod: 'technical_control',
      owner: 'Marketing / Product Privacy',
      implementationApproach:
        'Implement CMP for web/mobile. Capture granular consent, store proof, propagate withdrawal to downstream systems within 72 hours.',
      evidenceNotes: 'CMP configuration, consent logs sample, withdrawal propagation test.',
    },
    {
      id: 'consent-lia',
      name: 'Lawful basis register',
      status: 'planning',
      complianceMethod: 'procedure',
      owner: 'Legal / DPO',
      implementationApproach:
        'Document lawful basis per RoPA entry. Complete LIA where legitimate interests relied upon. Review on processing changes.',
      evidenceNotes: 'Lawful basis column in RoPA, LIA documents, legal sign-off.',
    },
  ],
  transparency: [
    {
      id: 'trans-notice',
      name: 'Privacy notice template',
      status: 'implementing',
      complianceMethod: 'policy',
      owner: 'Legal / DPO',
      implementationApproach:
        'Publish layered privacy notice covering purposes, legal bases, rights, retention, transfers, and DPO contact. Version-control and track publication dates.',
      evidenceNotes: 'Published notice URL, version history, translation records if applicable.',
    },
    {
      id: 'trans-cookie',
      name: 'Cookie & tracking notice',
      status: 'planning',
      complianceMethod: 'technical_control',
      owner: 'Digital / Marketing',
      implementationApproach:
        'Deploy cookie banner with granular categories. Maintain cookie inventory. Block non-essential cookies until consent.',
      evidenceNotes: 'Cookie policy, CMP scan report, consent statistics.',
    },
  ],
  'data-subject-rights': [
    {
      id: 'dsar-intake',
      name: 'DSAR intake workflow',
      status: 'implementing',
      complianceMethod: 'procedure',
      owner: 'Privacy Operations',
      implementationApproach:
        'Establish DSAR portal/email intake, identity verification, 30-day SLA tracking (GDPR) / DPDP timelines. Assign owners per system.',
      evidenceNotes: 'DSAR procedure, ticket samples, SLA compliance report.',
    },
    {
      id: 'dsar-portability',
      name: 'Data portability process',
      status: 'planning',
      complianceMethod: 'manual_process',
      owner: 'IT / Privacy Ops',
      implementationApproach:
        'Define export format (JSON/CSV). Map data sources per request type. Test end-to-end portability for top 5 systems.',
      evidenceNotes: 'Portability procedure, test export samples, system mapping.',
    },
  ],
  'privacy-by-design': [
    {
      id: 'pbd-sdlc',
      name: 'Privacy in SDLC gate',
      status: 'implementing',
      complianceMethod: 'procedure',
      owner: 'Engineering / Privacy',
      implementationApproach:
        'Add privacy review gate before production release. Checklist: minimization, defaults, notice, legal basis, retention, security.',
      evidenceNotes: 'SDLC gate checklist, sample privacy review sign-offs, Jira/workflow config.',
    },
    {
      id: 'pbd-minimize',
      name: 'Data minimization standard',
      status: 'planning',
      complianceMethod: 'policy',
      owner: 'Chief Privacy Officer',
      implementationApproach:
        'Publish data minimization standard for product and engineering. Require justification for new PII fields. Review quarterly.',
      evidenceNotes: 'Minimization policy, field justification log, review records.',
    },
  ],
  'processors-vendors': [
    {
      id: 'proc-dpa',
      name: 'DPA template & execution',
      status: 'implementing',
      complianceMethod: 'contractual',
      owner: 'Vendor Management / Legal',
      implementationApproach:
        'Use GDPR/DPDP-aligned DPA template. Execute with all processors. Track sub-processor notifications and objections.',
      evidenceNotes: 'Executed DPAs, sub-processor list, notification records.',
    },
    {
      id: 'proc-assess',
      name: 'Vendor privacy assessment',
      status: 'planning',
      complianceMethod: 'procedure',
      owner: 'TPRM / Privacy',
      implementationApproach:
        'Privacy questionnaire for new vendors. Risk-tier vendors annually. Block onboarding without completed assessment.',
      evidenceNotes: 'Questionnaire template, completed assessments, risk ratings.',
    },
  ],
  'cross-border-transfers': [
    {
      id: 'xfer-register',
      name: 'Transfer register & SCCs',
      status: 'implementing',
      complianceMethod: 'contractual',
      owner: 'Legal / DPO',
      implementationApproach:
        'Maintain transfer register mapping destinations, mechanisms (SCCs, adequacy, BCRs). Execute 2021 SCCs where required. Complete TIA for each transfer.',
      evidenceNotes: 'Transfer register, executed SCCs, TIA documents.',
    },
    {
      id: 'xfer-tia',
      name: 'Transfer Impact Assessment',
      status: 'planning',
      complianceMethod: 'procedure',
      owner: 'Privacy / Legal',
      implementationApproach:
        'TIA template per EDPB Recommendations. Assess government access laws, supplementary measures. Re-assess on legal changes.',
      evidenceNotes: 'TIA template, completed TIAs, supplementary measures evidence.',
    },
  ],
  'breach-response': [
    {
      id: 'brch-playbook',
      name: 'Breach response playbook',
      status: 'implementing',
      complianceMethod: 'procedure',
      owner: 'CISO / DPO',
      implementationApproach:
        'Document 72-hour notification playbook. Define severity tiers, escalation, regulatory notification templates (GDPR Art. 33, DPDP Board).',
      evidenceNotes: 'Playbook document, tabletop exercise records, notification templates.',
    },
    {
      id: 'brch-register',
      name: 'Breach register',
      status: 'planning',
      complianceMethod: 'manual_process',
      owner: 'Privacy / Security',
      implementationApproach:
        'Log all personal data incidents. Track assessment, containment, notification decisions. Post-incident review within 14 days.',
      evidenceNotes: 'Breach register, incident tickets, PIR reports.',
    },
  ],
  'retention-disposal': [
    {
      id: 'ret-schedule',
      name: 'Retention schedule',
      status: 'implementing',
      complianceMethod: 'policy',
      owner: 'Records Management / DPO',
      implementationApproach:
        'Publish retention schedule by data category aligned to legal requirements. Implement automated deletion where feasible.',
      evidenceNotes: 'Retention schedule, legal basis references, deletion job logs.',
    },
    {
      id: 'ret-disposal',
      name: 'Secure disposal procedure',
      status: 'planning',
      complianceMethod: 'procedure',
      owner: 'IT Operations',
      implementationApproach:
        'Define secure deletion for digital records and physical media. Certificate of destruction for outsourced disposal.',
      evidenceNotes: 'Disposal procedure, destruction certificates, audit logs.',
    },
  ],
  'training-awareness': [
    {
      id: 'train-annual',
      name: 'Annual privacy training',
      status: 'implementing',
      complianceMethod: 'training_awareness',
      owner: 'HR / Privacy',
      implementationApproach:
        'Mandatory annual privacy training for all staff. Role-based modules for HR, Engineering, Sales. Track completion >95%.',
      evidenceNotes: 'LMS completion report, training content, attendance records.',
    },
    {
      id: 'train-onboard',
      name: 'New hire privacy onboarding',
      status: 'planning',
      complianceMethod: 'training_awareness',
      owner: 'HR',
      implementationApproach:
        'Privacy module in new hire onboarding within first week. Cover acceptable use, DSAR handling, breach reporting.',
      evidenceNotes: 'Onboarding checklist, LMS records, acknowledgment forms.',
    },
  ],
  'monitoring-audit': [
    {
      id: 'aud-kpi',
      name: 'Privacy KPI dashboard',
      status: 'implementing',
      complianceMethod: 'manual_process',
      owner: 'DPO',
      implementationApproach:
        'Track KPIs: RoPA coverage, DSAR SLA, training completion, open issues, control readiness. Report to leadership quarterly.',
      evidenceNotes: 'Dashboard screenshots, quarterly reports, leadership presentation.',
    },
    {
      id: 'aud-internal',
      name: 'Internal privacy audit',
      status: 'planning',
      complianceMethod: 'procedure',
      owner: 'Internal Audit / DPO',
      implementationApproach:
        'Annual internal audit against ISO 27701 / NIST PF. Sample controls per module. Track findings to closure.',
      evidenceNotes: 'Audit plan, working papers, finding remediation evidence.',
    },
  ],
};

const MODULE_REMEDIATION: Record<PrivacyModuleId, RemediationTemplate[]> = {
  governance: [
    {
      id: 'rem-gov-charter',
      name: 'Draft & approve charter',
      action: {
        title: 'Publish privacy program charter',
        description: 'Draft charter using template, circulate for legal review, obtain CEO/CPO sign-off, publish on intranet.',
        remediationLink: '',
        linkLabel: '',
        status: 'open',
        assignee: 'DPO',
        dueDate: null,
        notes: '',
      },
    },
    {
      id: 'rem-gov-raci',
      name: 'Assign privacy roles',
      action: {
        title: 'Complete RACI and appoint DPO',
        description: 'Map privacy responsibilities across Legal, IT, HR, Product. Formalize DPO appointment where required.',
        remediationLink: '',
        linkLabel: '',
        status: 'open',
        assignee: 'Privacy Lead',
        dueDate: null,
        notes: '',
      },
    },
  ],
  'data-inventory': [
    {
      id: 'rem-inv-ropa',
      name: 'Complete RoPA entries',
      action: {
        title: 'Interview owners and populate RoPA',
        description: 'Schedule interviews with system owners for missing RoPA entries. Validate purposes, categories, retention.',
        remediationLink: '',
        linkLabel: '',
        status: 'open',
        assignee: 'Data Governance',
        dueDate: null,
        notes: '',
      },
    },
    {
      id: 'rem-inv-shadow',
      name: 'Resolve shadow IT gaps',
      action: {
        title: 'Sanction or decommission unsanctioned tools',
        description: 'Identify tools processing PII outside inventory. Risk-assess and either onboard to RoPA or decommission.',
        remediationLink: '',
        linkLabel: '',
        status: 'open',
        assignee: 'IT Security',
        dueDate: null,
        notes: '',
      },
    },
  ],
  'data-discovery': [
    {
      id: 'rem-disc-connect',
      name: 'Connect discovery sources',
      action: {
        title: 'Onboard priority data sources to scanner',
        description: 'Connect production databases, data lake, and M365 tenant. Run initial full scan and assign validation owners.',
        remediationLink: '',
        linkLabel: '',
        status: 'open',
        assignee: 'Data Discovery Lead',
        dueDate: null,
        notes: '',
      },
    },
    {
      id: 'rem-disc-reconcile',
      name: 'Reconcile with RoPA',
      action: {
        title: 'Close discovery–RoPA gaps',
        description: 'Compare discovery findings to RoPA. Create new RoPA entries or update existing for undocumented processing.',
        remediationLink: '',
        linkLabel: '',
        status: 'open',
        assignee: 'Data Governance',
        dueDate: null,
        notes: '',
      },
    },
  ],
  'data-classification': [
    {
      id: 'rem-clas-label',
      name: 'Apply sensitivity labels',
      action: {
        title: 'Roll out labels to top repositories',
        description: 'Enable auto-labeling on SharePoint, email, and key DBs. Train owners on manual classification for edge cases.',
        remediationLink: '',
        linkLabel: '',
        status: 'open',
        assignee: 'InfoSec',
        dueDate: null,
        notes: '',
      },
    },
    {
      id: 'rem-clas-review',
      name: 'Classification accuracy review',
      action: {
        title: 'Sample and correct misclassified data',
        description: 'Sample 100 records per tier. Correct labels. Tune DLP rules based on findings.',
        remediationLink: '',
        linkLabel: '',
        status: 'open',
        assignee: 'Data Steward',
        dueDate: null,
        notes: '',
      },
    },
  ],
  'risk-dpia': [
    {
      id: 'rem-dpia-backlog',
      name: 'Clear DPIA backlog',
      action: {
        title: 'Complete pending DPIAs for high-risk processing',
        description: 'Prioritize AI, profiling, and children-data activities. Complete DPIA and obtain DPO sign-off.',
        remediationLink: '',
        linkLabel: '',
        status: 'open',
        assignee: 'Privacy Risk',
        dueDate: null,
        notes: '',
      },
    },
  ],
  'consent-legal-basis': [
    {
      id: 'rem-consent-withdraw',
      name: 'Fix consent withdrawal',
      action: {
        title: 'Propagate consent withdrawal to all systems',
        description: 'Map downstream systems receiving consent signals. Test withdrawal end-to-end within SLA.',
        remediationLink: '',
        linkLabel: '',
        status: 'open',
        assignee: 'Engineering',
        dueDate: null,
        notes: '',
      },
    },
  ],
  transparency: [
    {
      id: 'rem-trans-update',
      name: 'Update privacy notice',
      action: {
        title: 'Refresh notice for new processing',
        description: 'Update notice to reflect new purposes or processors. Publish and notify data subjects if material change.',
        remediationLink: '',
        linkLabel: '',
        status: 'open',
        assignee: 'Legal',
        dueDate: null,
        notes: '',
      },
    },
  ],
  'data-subject-rights': [
    {
      id: 'rem-dsar-sla',
      name: 'Clear DSAR backlog',
      action: {
        title: 'Resolve overdue DSAR requests',
        description: 'Identify overdue requests. Escalate to system owners. Complete within regulatory deadline.',
        remediationLink: '',
        linkLabel: '',
        status: 'open',
        assignee: 'Privacy Ops',
        dueDate: null,
        notes: '',
      },
    },
  ],
  'privacy-by-design': [
    {
      id: 'rem-pbd-gate',
      name: 'Enable SDLC privacy gate',
      action: {
        title: 'Add privacy checkpoint to release pipeline',
        description: 'Configure mandatory privacy review in Jira/Azure DevOps before production deploy.',
        remediationLink: '',
        linkLabel: '',
        status: 'open',
        assignee: 'Engineering Manager',
        dueDate: null,
        notes: '',
      },
    },
  ],
  'processors-vendors': [
    {
      id: 'rem-proc-dpa',
      name: 'Execute missing DPAs',
      action: {
        title: 'Sign DPAs with processors lacking contracts',
        description: 'Identify processors without DPA. Legal to execute template. Block data sharing until signed.',
        remediationLink: '',
        linkLabel: '',
        status: 'open',
        assignee: 'Vendor Management',
        dueDate: null,
        notes: '',
      },
    },
  ],
  'cross-border-transfers': [
    {
      id: 'rem-xfer-scc',
      name: 'Execute SCCs',
      action: {
        title: 'Sign 2021 SCCs for US transfers',
        description: 'Complete TIA, execute SCCs with US subprocessors, implement supplementary measures if needed.',
        remediationLink: '',
        linkLabel: '',
        status: 'open',
        assignee: 'Legal',
        dueDate: null,
        notes: '',
      },
    },
  ],
  'breach-response': [
    {
      id: 'rem-brch-tabletop',
      name: 'Breach tabletop exercise',
      action: {
        title: 'Run annual breach simulation',
        description: 'Simulate personal data breach. Test 72-hour notification timeline. Document lessons learned.',
        remediationLink: '',
        linkLabel: '',
        status: 'open',
        assignee: 'CISO',
        dueDate: null,
        notes: '',
      },
    },
  ],
  'retention-disposal': [
    {
      id: 'rem-ret-delete',
      name: 'Enable automated deletion',
      action: {
        title: 'Configure retention jobs for key systems',
        description: 'Implement automated deletion per retention schedule in CRM, HRIS, and marketing platforms.',
        remediationLink: '',
        linkLabel: '',
        status: 'open',
        assignee: 'IT Ops',
        dueDate: null,
        notes: '',
      },
    },
  ],
  'training-awareness': [
    {
      id: 'rem-train-gap',
      name: 'Close training gaps',
      action: {
        title: 'Chase incomplete privacy training',
        description: 'Identify staff below 95% completion. Manager escalation. Block access until complete if policy requires.',
        remediationLink: '',
        linkLabel: '',
        status: 'open',
        assignee: 'HR',
        dueDate: null,
        notes: '',
      },
    },
  ],
  'monitoring-audit': [
    {
      id: 'rem-aud-findings',
      name: 'Close audit findings',
      action: {
        title: 'Remediate open privacy audit findings',
        description: 'Assign owners to each finding. Target closure within 90 days. Verify with re-test.',
        remediationLink: '',
        linkLabel: '',
        status: 'open',
        assignee: 'DPO',
        dueDate: null,
        notes: '',
      },
    },
  ],
};

const MODULE_ISSUES: Record<PrivacyModuleId, IssueTemplate[]> = {
  governance: [
    {
      id: 'iss-gov-charter',
      name: 'Missing program charter',
      title: 'Privacy program charter not approved',
      description: 'No executive-approved privacy charter on file. Accountability under Art. 24 / DPDP Sec. 8 at risk.',
      severity: 'high',
    },
    {
      id: 'iss-gov-dpo',
      name: 'DPO not appointed',
      title: 'Data Protection Officer role vacant',
      description: 'DPO appointment required but role unfilled or contact not published.',
      severity: 'critical',
    },
  ],
  'data-inventory': [
    {
      id: 'iss-inv-ropa-gap',
      name: 'Incomplete RoPA',
      title: 'RoPA missing processing activities',
      description: 'Known systems not reflected in Records of Processing Activities.',
      severity: 'high',
    },
    {
      id: 'iss-inv-stale',
      name: 'Stale RoPA review',
      title: 'RoPA not reviewed in last 12 months',
      description: 'Quarterly/annual RoPA review overdue per policy.',
      severity: 'medium',
    },
  ],
  'data-discovery': [
    {
      id: 'iss-disc-coverage',
      name: 'Discovery coverage gap',
      title: 'Production databases not in discovery scope',
      description: 'Critical data stores excluded from automated discovery scans.',
      severity: 'high',
    },
    {
      id: 'iss-disc-shadow',
      name: 'Unvalidated shadow SaaS',
      title: 'Shadow SaaS with PII discovered',
      description: 'Discovery found personal data in unsanctioned cloud application without RoPA entry.',
      severity: 'critical',
    },
  ],
  'data-classification': [
    {
      id: 'iss-clas-unlabeled',
      name: 'Unclassified sensitive data',
      title: 'PII repositories without classification labels',
      description: 'Discovery found stores with personal data but no sensitivity label applied.',
      severity: 'high',
    },
    {
      id: 'iss-clas-children',
      name: 'Children data misclassified',
      title: 'Children personal data not tagged as Restricted',
      description: 'DPDP Sec. 9 / GDPR Art. 8 — children data requires enhanced handling.',
      severity: 'critical',
    },
  ],
  'risk-dpia': [
    {
      id: 'iss-dpia-missing',
      name: 'DPIA not conducted',
      title: 'High-risk processing without DPIA',
      description: 'New processing activity launched without required Data Protection Impact Assessment.',
      severity: 'critical',
    },
  ],
  'consent-legal-basis': [
    {
      id: 'iss-consent-invalid',
      name: 'Invalid consent mechanism',
      title: 'Pre-ticked consent boxes on web forms',
      description: 'Consent not freely given per GDPR Art. 7 / DPDP consent requirements.',
      severity: 'high',
    },
  ],
  transparency: [
    {
      id: 'iss-trans-outdated',
      name: 'Outdated privacy notice',
      title: 'Privacy notice does not reflect current processing',
      description: 'Notice missing new purposes, processors, or transfer destinations.',
      severity: 'medium',
    },
  ],
  'data-subject-rights': [
    {
      id: 'iss-dsar-overdue',
      name: 'Overdue DSAR',
      title: 'Data subject request past regulatory deadline',
      description: 'Access/erasure request not fulfilled within 30-day GDPR / DPDP timeline.',
      severity: 'critical',
    },
  ],
  'privacy-by-design': [
    {
      id: 'iss-pbd-bypass',
      name: 'SDLC gate bypassed',
      title: 'Release deployed without privacy review',
      description: 'Production deployment skipped mandatory privacy checkpoint.',
      severity: 'high',
    },
  ],
  'processors-vendors': [
    {
      id: 'iss-proc-no-dpa',
      name: 'Processor without DPA',
      title: 'Active processor missing Data Processing Agreement',
      description: 'Personal data shared with vendor without executed DPA.',
      severity: 'critical',
    },
  ],
  'cross-border-transfers': [
    {
      id: 'iss-xfer-no-mechanism',
      name: 'Transfer without legal mechanism',
      title: 'Cross-border transfer lacks SCCs or adequacy',
      description: 'Data transferred internationally without documented transfer mechanism.',
      severity: 'critical',
    },
  ],
  'breach-response': [
    {
      id: 'iss-brch-late',
      name: 'Late breach notification',
      title: 'Regulatory breach notification potentially late',
      description: 'Personal data breach may not have been reported within 72 hours.',
      severity: 'critical',
    },
  ],
  'retention-disposal': [
    {
      id: 'iss-ret-overretain',
      name: 'Over-retention of personal data',
      title: 'Data retained beyond schedule',
      description: 'Records found past defined retention period without legal hold.',
      severity: 'medium',
    },
  ],
  'training-awareness': [
    {
      id: 'iss-train-low',
      name: 'Low training completion',
      title: 'Privacy training completion below 80%',
      description: 'Significant portion of workforce has not completed mandatory privacy training.',
      severity: 'medium',
    },
  ],
  'monitoring-audit': [
    {
      id: 'iss-aud-finding',
      name: 'Open audit finding',
      title: 'Unresolved privacy audit finding',
      description: 'Internal or external audit finding open past agreed remediation date.',
      severity: 'high',
    },
  ],
};

/** Control-specific templates override or supplement module defaults */
const CONTROL_COMPLIANCE: Partial<Record<string, ComplianceTemplate[]>> = {
  'pc-gov-01': [
    {
      id: 'pc-gov-01-charter',
      name: 'Privacy program charter (GOV-01)',
      status: 'implementing',
      complianceMethod: 'policy',
      owner: 'Chief Privacy Officer',
      implementationApproach:
        '1. Use PrivyCore charter template\n2. Define scope: entities, geographies, data types\n3. Set objectives aligned to NIST Govern-P\n4. Obtain board/CEO approval\n5. Publish and communicate annually',
      evidenceNotes: 'Signed charter, board minutes, intranet link, annual review record.',
    },
  ],
  'pc-disc-01': [
    {
      id: 'pc-disc-01-scope',
      name: 'Discovery scope document (DISC-01)',
      status: 'planning',
      complianceMethod: 'procedure',
      owner: 'Data Discovery Lead',
      implementationApproach:
        'Document in-scope: all production DBs, data warehouse, file shares, M365, top 20 SaaS. Define scan frequency, validation SLA, and escalation path.',
      evidenceNotes: 'Discovery scope doc, asset inventory, scan calendar.',
    },
  ],
  'pc-clas-01': [
    {
      id: 'pc-clas-01-tax',
      name: 'Classification taxonomy (CLAS-01)',
      status: 'planning',
      complianceMethod: 'policy',
      owner: 'DPO',
      implementationApproach:
        'Define tiers: Public, Internal, Confidential, Restricted. Map PII categories. Link to encryption, access, retention, and sharing rules per tier.',
      evidenceNotes: 'Approved taxonomy, handling matrix, staff training record.',
    },
  ],
};

const CONTROL_REMEDIATION: Partial<Record<string, RemediationTemplate[]>> = {};
const CONTROL_ISSUES: Partial<Record<string, IssueTemplate[]>> = {};

function mergeUnique<T extends { id: string }>(primary: T[], secondary: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of [...primary, ...secondary]) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

export function getComplianceTemplates(
  controlId: string,
  moduleId: PrivacyModuleId
): ComplianceTemplate[] {
  return mergeUnique(
    CONTROL_COMPLIANCE[controlId] ?? [],
    MODULE_COMPLIANCE[moduleId] ?? []
  );
}

export function getRemediationTemplates(
  controlId: string,
  moduleId: PrivacyModuleId
): RemediationTemplate[] {
  return mergeUnique(
    CONTROL_REMEDIATION[controlId] ?? [],
    MODULE_REMEDIATION[moduleId] ?? []
  );
}

export function getIssueTemplates(
  controlId: string,
  moduleId: PrivacyModuleId
): IssueTemplate[] {
  return mergeUnique(CONTROL_ISSUES[controlId] ?? [], MODULE_ISSUES[moduleId] ?? []);
}

export function remediationTemplateToAction(
  template: RemediationTemplate
): RemediationAction {
  return {
    ...template.action,
    id: `ra-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  };
}
