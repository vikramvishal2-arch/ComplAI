import type { PolicyTemplateDef } from './policy-template-catalog';
import { buildAllFrameworkSections, resolveFrameworkTags } from './policy-framework-mappings';
import {
  buildPolicyMarkdown,
  buildProcedureMarkdown,
  STANDARD_ISMS_DEFINITIONS,
  STANDARD_ROLES,
  type DocumentMeta,
  type PolicyContentParams,
  type ProcedureContentParams,
  type ProcedureStep,
  type RoleEntry,
} from './policy-template-sections';

function metaFromDef(def: PolicyTemplateDef): DocumentMeta {
  return {
    title: def.title,
    documentType: def.documentType,
    isoReference: def.isoReference,
    owner: categoryOwner(def.categoryId),
    applicableFrameworks: resolveFrameworkTags(def),
  };
}

function categoryOwner(categoryId: string): string {
  const owners: Record<string, string> = {
    governance: '[Role: CISO / ISMS Manager]',
    'risk-program': '[Role: Risk Manager / CISO]',
    'access-identity': '[Role: IAM Manager / CISO]',
    'asset-data': '[Role: Data Protection Officer / IT Asset Manager]',
    'hr-people': '[Role: HR Director / CISO]',
    physical: '[Role: Facilities Security Manager]',
    network: '[Role: Network Security Manager]',
    operations: '[Role: IT Operations Manager / CISO]',
    supplier: '[Role: Vendor Risk Manager / Procurement]',
    'incident-bc': '[Role: Incident Response Manager / BCP Lead]',
    'privacy-legal': '[Role: DPO / General Counsel]',
    'ai-governance': '[Role: AI Governance Lead / CISO]',
  };
  return owners[categoryId] ?? '[Role: Policy Owner]';
}

function standardScope(def: PolicyTemplateDef): string[] {
  return [
    `This document applies to all employees, contractors, temporary staff, and third parties who perform activities within the scope of ${def.title.toLowerCase()} for [Organization Name].`,
    `It covers all information assets, systems, facilities, and processes within the ISMS scope as defined in the Information Security Policy and Statement of Applicability, unless explicitly excluded with documented justification.`,
    `Exclusions require documented risk acceptance and approval from executive management and Information Security.`,
  ];
}

function standardProcedureScope(def: PolicyTemplateDef): string[] {
  return [
    `This procedure applies to personnel and teams responsible for executing, overseeing, or auditing activities related to ${def.title.toLowerCase()}.`,
    `It applies across all business units, locations, and technology environments within the ISMS scope unless a documented exclusion exists.`,
    `Third parties performing equivalent activities on behalf of the organization shall comply with contractually equivalent requirements.`,
  ];
}

function policyStatementsFromDef(def: PolicyTemplateDef): PolicyContentParams['policyStatements'] {
  const topic = def.title.replace(/ Policy$| Standard$/, '');
  const iso = def.isoReference;

  const overrides = POLICY_STATEMENT_OVERRIDES[def.id];
  if (overrides) return overrides;

  return [
    {
      heading: 'General Requirements',
      statements: [
        `${topic} requirements shall be defined, documented, approved by management, published, communicated to relevant personnel, and reviewed at planned intervals in accordance with ISO 27001:2022 Clause 5.2 and Annex A control ${iso}.`,
        `[Organization Name] shall implement controls proportional to the risk and sensitivity of affected information assets, aligned with the risk treatment plan and Statement of Applicability.`,
        `${def.description}. All personnel with responsibilities in this domain shall receive appropriate awareness and role-based training before performing related duties.`,
      ],
    },
    {
      heading: 'Control Implementation',
      statements: [
        `Technical and organizational controls supporting ${topic.toLowerCase()} shall be selected based on risk assessment outcomes and documented in the SoA with clear ownership and implementation status.`,
        `Control effectiveness shall be measured through defined metrics, periodic testing, and internal audit. Deficiencies are tracked to closure through the corrective action process.`,
        `Changes affecting ${topic.toLowerCase()} controls shall follow the Change Management Procedure with security impact assessment and appropriate authorization.`,
      ],
    },
    {
      heading: 'Accountability and Governance',
      statements: [
        `The document owner shall maintain this policy, coordinate reviews at least annually, and ensure alignment with legal, regulatory, and contractual obligations.`,
        `Management shall review ${topic.toLowerCase()} performance, incidents, and audit findings during ISMS management review meetings at planned intervals.`,
        `Deviations from mandatory requirements require documented risk acceptance, compensating controls, time-bound approval, and entry in the exception register.`,
      ],
    },
    {
      heading: 'Integration with the ISMS',
      statements: [
        `This policy integrates with the Information Security Policy, risk management processes, and supporting procedures. Conflicts are escalated to the CISO for resolution.`,
        `Evidence of conformity (records, logs, approvals, training completion) shall be retained per the Records Protection Procedure.`,
        `This policy supports audit and certification activities; personnel shall cooperate with internal and external auditors as required.`,
      ],
    },
  ];
}

function procedureStepsFromDef(def: PolicyTemplateDef): ProcedureStep[] {
  const overrides = PROCEDURE_STEP_OVERRIDES[def.id];
  if (overrides) return overrides;

  const topic = def.title.replace(/ Procedure$/, '').toLowerCase();
  return [
    {
      heading: 'Initiate and Plan',
      description: [
        `Identify the trigger event or scheduled activity requiring ${topic}. Confirm scope, affected assets, stakeholders, and applicable controls (${def.isoReference}).`,
        `Gather prerequisites, authorization requirements, and reference documents. Assign a responsible performer and document the planned start time.`,
      ],
      substeps: [
        'Verify requester authorization and business justification.',
        'Confirm no conflicting activities (e.g., change freeze, maintenance window).',
        'Open a ticket or workflow record for traceability.',
      ],
    },
    {
      heading: 'Execute Core Activities',
      description: [
        `Perform ${topic} activities in accordance with this procedure, applicable policies, and operational runbooks. ${def.description}`,
        `Apply segregation of duties: the person approving sensitive actions shall not be the sole executor where conflicts exist.`,
      ],
      substeps: [
        'Follow documented checklists and control steps without skipping mandatory verification points.',
        'Escalate anomalies, control failures, or policy conflicts to Information Security immediately.',
        'Record timestamps, decisions, and responsible parties at each stage.',
      ],
    },
    {
      heading: 'Verify and Validate',
      description: [
        `Validate that outcomes meet defined acceptance criteria and do not introduce unacceptable risk. Perform independent verification for high-risk activities where required.`,
        `Confirm that logging, monitoring, and evidence capture are functioning as expected.`,
      ],
      substeps: [
        'Peer review or secondary approval for privileged or production-impacting actions.',
        'Run automated validation or test cases where applicable.',
        'Document validation results and attach to the workflow record.',
      ],
    },
    {
      heading: 'Communicate and Close',
      description: [
        `Notify affected stakeholders of completion, outcomes, and any follow-up actions. Update relevant registers, asset records, or access matrices.`,
        `Close the workflow record with summary, evidence links, and sign-off from the procedure owner or delegate.`,
      ],
    },
    {
      heading: 'Review and Improve',
      description: [
        `Periodically review procedure effectiveness during internal audits, post-incident reviews, and management review. Incorporate lessons learned and update this procedure through controlled change.`,
      ],
    },
  ];
}

const POLICY_STATEMENT_OVERRIDES: Record<string, PolicyContentParams['policyStatements']> = {
  'isms-information-security': [
    {
      heading: 'Management Commitment',
      statements: [
        'Executive management shall demonstrate leadership and commitment to the ISMS by establishing information security objectives, integrating security into business processes, and ensuring resources are available for effective operation.',
        'Management shall approve and communicate this Information Security Policy and ensure topic-specific policies are defined, approved, published, and reviewed at planned intervals per ISO 27001:2022 Annex A.5.1.',
        '[Organization Name] commits to satisfying applicable legal, regulatory, and contractual requirements relating to information security and to continual improvement of the ISMS.',
      ],
    },
    {
      heading: 'Information Security Objectives',
      statements: [
        'Protect the confidentiality, integrity, and availability of information assets in proportion to their classification and business value.',
        'Identify, assess, and treat information security risks in accordance with the risk management methodology and maintain an accurate Statement of Applicability.',
        'Ensure personnel are aware of their security responsibilities and receive appropriate training commensurate with their role.',
        'Detect, respond to, and recover from security events in a timely manner; learn from incidents to strengthen controls.',
        'Maintain business continuity and ICT readiness for critical services within defined RTO and RPO targets.',
      ],
    },
    {
      heading: 'Risk Management Approach',
      statements: [
        'Risk assessments shall be conducted at planned intervals and upon significant change, using a documented methodology consistent with ISO 27001 Clause 6.1.',
        'Risk treatment options (modify, retain, avoid, share) shall be documented with assigned owners, target dates, and residual risk acceptance by authorized management.',
        'The risk register and SoA shall be maintained as living documents and presented during management review.',
      ],
    },
    {
      heading: 'Acceptable Use and Access Principles',
      statements: [
        'Information systems shall be used lawfully and for authorized business purposes. Acceptable use requirements are defined in the Acceptable Use Policy.',
        'Access to information and systems shall be granted on least privilege and need-to-know bases with strong authentication for sensitive systems.',
        'Security incidents and suspected weaknesses shall be reported without delay through defined channels.',
      ],
    },
    {
      heading: 'Compliance and Continual Improvement',
      statements: [
        'Compliance with ISMS policies and applicable controls shall be monitored through audit, metrics, and automated tooling where feasible.',
        'Non-conformities and improvement opportunities are managed through corrective action with root cause analysis for significant findings.',
        'This policy and the ISMS shall be reviewed at least annually and updated to reflect organizational, technological, and threat landscape changes.',
      ],
    },
  ],
  'access-control': [
    {
      heading: 'Access Principles',
      statements: [
        'Logical and physical access shall be granted based on least privilege, need-to-know, and segregation of duties.',
        'Access requests require documented business justification, manager approval, and provisioning per the Identity Management Procedure.',
        'Shared, generic, and orphaned accounts are prohibited except where technically unavoidable and formally approved with compensating controls.',
      ],
    },
    {
      heading: 'Provisioning and Lifecycle',
      statements: [
        'Joiner-mover-leaver processes shall ensure timely provisioning, modification, and deprovisioning of access rights.',
        'Privileged and administrative access requires enhanced approval, monitoring, and periodic recertification.',
        'Emergency access ("break-glass") shall be time-bound, logged, and reviewed within 24 hours of use.',
      ],
    },
    {
      heading: 'Periodic Review',
      statements: [
        'Access rights for critical systems shall be recertified at least quarterly by data/system owners and line managers.',
        'Dormant accounts and excessive privileges shall be removed promptly upon identification.',
        'Access review evidence is retained for audit purposes.',
      ],
    },
  ],
  'acceptable-use': [
    {
      heading: 'Authorized Use',
      statements: [
        'Organization IT resources are provided primarily for business purposes. Limited personal use is permitted only if it does not interfere with work, consume excessive resources, or violate policy.',
        'Users shall protect credentials, lock workstations when unattended, and comply with classification and data handling requirements.',
      ],
    },
    {
      heading: 'Prohibited Activities',
      statements: [
        'Users shall not install unauthorized software, disable security controls, attempt unauthorized access, or exfiltrate organizational data.',
        'Prohibited activities include harassment, distribution of illegal content, cryptocurrency mining without approval, and use of organization resources for personal commercial gain.',
        'Use of unauthorized cloud storage, personal email for sensitive data, or unapproved AI services with confidential data is prohibited unless explicitly approved.',
      ],
    },
    {
      heading: 'Monitoring and Privacy',
      statements: [
        'The organization may monitor use of its systems and networks for security, compliance, and operational purposes in accordance with law and privacy obligations.',
        'Users should have no expectation of privacy when using organization-provided systems except where mandated by applicable privacy law.',
      ],
    },
  ],
  'incident-response-plan': [
    {
      heading: 'Incident Management Framework',
      statements: [
        'An incident response capability shall be maintained with defined roles, escalation paths, and communication plans.',
        'All personnel shall report suspected security events immediately via defined channels. Failure to report may constitute a policy violation.',
        'The incident response team coordinates detection, analysis, containment, eradication, recovery, and post-incident activities.',
      ],
    },
    {
      heading: 'Classification and Notification',
      statements: [
        'Incidents are classified by severity with corresponding response time targets and notification requirements.',
        'Regulatory, contractual, and customer notification obligations are assessed by legal and privacy teams with defined timelines.',
        'Evidence is preserved to support investigation, legal proceedings, and regulatory reporting where required.',
      ],
    },
    {
      heading: 'Post-Incident Improvement',
      statements: [
        'Post-incident reviews are conducted for significant events within five business days, documenting root cause, impact, and corrective actions.',
        'Lessons learned feed into risk treatment, control improvements, and awareness training updates.',
      ],
    },
  ],
  'password-authentication': [
    {
      heading: 'Authentication Requirements',
      statements: [
        'Multi-factor authentication (MFA) is mandatory for remote access, privileged accounts, cloud administration, and access to sensitive data systems.',
        'Passwords shall meet minimum complexity, length, and rotation requirements defined in the authentication standard; passphrases are encouraged where supported.',
        'Password reuse across organization and personal accounts is prohibited. Password managers approved by IT may be used.',
      ],
    },
    {
      heading: 'Credential Protection',
      statements: [
        'Credentials shall not be shared, written in plain text, or embedded in code repositories. Service accounts require vault storage and rotation.',
        'Failed authentication attempts are logged and may trigger lockout or alerting per defined thresholds.',
      ],
    },
  ],
  'privacy-pii': [
    {
      heading: 'Privacy Governance',
      statements: [
        'Personal data shall be processed lawfully, fairly, and transparently with a documented lawful basis and purpose limitation.',
        'A Record of Processing Activities (RoPA) is maintained and updated when processing activities change materially.',
        'Data Protection Impact Assessments (DPIAs) are conducted for high-risk processing before commencement.',
      ],
    },
    {
      heading: 'Data Subject Rights',
      statements: [
        'Procedures exist to facilitate data subject rights requests (access, rectification, erasure, restriction, portability, objection) within regulatory timelines.',
        'Privacy notices are provided at collection points and kept current with processing activities.',
      ],
    },
    {
      heading: 'Privacy by Design',
      statements: [
        'Privacy requirements are integrated into projects, system design, and vendor selection through privacy-by-design and default principles.',
        'Cross-border transfers require appropriate safeguards (e.g., SCCs, adequacy decisions, DPDP-notified conditions) documented and approved.',
      ],
    },
  ],
  'dpdp-data-protection': [
    {
      heading: 'DPDP Act Scope and Accountability',
      statements: [
        '[Organization Name] processes digital personal data as a Data Fiduciary (or Data Processor where applicable) in compliance with the Digital Personal Data Protection Act, 2023 and DPDP Rules, 2025.',
        'A designated grievance officer or Data Protection Officer contact point is published and accessible to Data Principals.',
        'Processing records, consent logs, and notice versions are maintained to demonstrate accountability to the Data Protection Board of India.',
      ],
    },
    {
      heading: 'Consent, Notice, and Lawful Processing',
      statements: [
        'Consent is obtained free, specific, informed, unconditional, and unambiguous before processing where consent is the lawful basis; consent notices are provided in plain language.',
        'Purpose limitation and data minimisation apply — personal data is collected only for specified, legitimate purposes and retained only as long as necessary.',
        'Consent withdrawal is as simple as granting consent; processing ceases upon withdrawal unless another lawful basis applies under the Act.',
      ],
    },
    {
      heading: 'Data Principal Rights and Grievance Redressal',
      statements: [
        'Procedures enable Data Principals to exercise rights of access, correction, erasure, and grievance redressal within prescribed timelines.',
        'Grievances are acknowledged, investigated, and resolved; unresolved grievances may be escalated to the Data Protection Board.',
        'Children\'s data (under 18) requires verifiable parental consent and prohibits behavioural tracking or targeted advertising.',
      ],
    },
    {
      heading: 'Security, Breach Notification, and SDF Obligations',
      statements: [
        'Reasonable security safeguards protect personal data; personal data breaches trigger notification to the Data Protection Board and affected Data Principals without undue delay, with detailed report within 72 hours.',
        'Significant Data Fiduciaries (where designated) appoint an India-based DPO, conduct annual DPIA and independent audit, and perform algorithmic due diligence.',
        'Processor agreements impose equivalent DPDP obligations and permit audit and breach notification cooperation.',
      ],
    },
  ],
  'ai-governance': [
    {
      heading: 'AI Governance Framework',
      statements: [
        'Executive management establishes AI governance accountability, risk appetite, and resource allocation for trustworthy AI deployment.',
        'An AI governance committee (technology, legal, privacy, risk, business) reviews high-risk AI use cases and approves deployment.',
        'An AI system inventory is maintained with purpose, owner, data sources, risk classification, and deployment status.',
      ],
    },
    {
      heading: 'Risk Classification and Lifecycle',
      statements: [
        'All AI systems are classified by risk tier (prohibited, high-risk, limited-risk, minimal-risk) aligned with EU AI Act categories before deployment.',
        'High-risk AI systems require pre-deployment risk assessment, conformity documentation, human oversight, and continuous monitoring.',
        'Prohibited AI practices (social scoring, subliminal manipulation, untargeted facial scraping) are not permitted under any circumstances.',
      ],
    },
    {
      heading: 'Transparency, Oversight, and Accountability',
      statements: [
        'Meaningful human oversight is required for high-stakes automated decisions affecting individuals (employment, credit, safety-critical).',
        'AI-generated content and AI-assisted decisions are disclosed to affected individuals where required by law or this policy.',
        'AI incidents (data leakage via prompts, biased outputs, unauthorised model use) are reported and managed through defined incident procedures.',
      ],
    },
  ],
  'ai-acceptable-use': [
    {
      heading: 'Approved AI Tools and Data Classification',
      statements: [
        'Personnel may use only AI tools on the organisation\'s approved register; unapproved public AI services must not receive confidential, personal, or regulated data.',
        'Data classification tiers map to permitted AI tools: public data may use approved public AI; internal/confidential data requires enterprise or private AI deployments with no training on inputs.',
        'Shadow AI (unapproved tools) is prohibited; IT security monitors for unauthorised AI service usage.',
      ],
    },
    {
      heading: 'Prohibited Uses',
      statements: [
        'Entering credentials, encryption keys, unreleased financial data, PHI, or personal data into unapproved AI tools is prohibited.',
        'Using AI for decisions prohibited by the EU AI Act or organisational risk appetite (e.g., social scoring, covert biometric identification) is forbidden.',
        'Automated decisions with legal or similarly significant effects require human review unless explicitly approved with documented safeguards.',
      ],
    },
    {
      heading: 'Employee Responsibilities',
      statements: [
        'Verify AI-generated outputs before use in business decisions, customer communications, or code deployment; do not rely solely on AI output for critical tasks.',
        'Report suspected AI policy violations, data leakage incidents, or discovery of unapproved AI tools to Information Security immediately.',
        'Complete mandatory AI awareness training before using approved AI tools with organisational data.',
      ],
    },
  ],
  'ai-risk-management': [
    {
      heading: 'AI Risk Assessment (NIST AI RMF — MAP)',
      statements: [
        'Pre-deployment AI risk assessments evaluate context, stakeholders, intended use, foreseeable misuse, bias, safety, security, and privacy impacts.',
        'Risk assessments are updated upon material changes to model, training data, deployment context, or applicable regulations.',
        'Risk treatment decisions (mitigate, transfer, accept, avoid) are documented with assigned owners and target dates.',
      ],
    },
    {
      heading: 'Measurement and Monitoring (NIST AI RMF — MEASURE, MANAGE)',
      statements: [
        'Deployed AI systems are monitored for performance drift, bias emergence, security vulnerabilities, and regulatory compliance on a defined cadence.',
        'Metrics and thresholds trigger escalation when model performance degrades below acceptable levels or produces harmful outputs.',
        'Post-market monitoring and incident learning feed back into model updates, retraining decisions, and policy revisions.',
      ],
    },
    {
      heading: 'Human Oversight and EU AI Act Alignment',
      statements: [
        'High-risk AI systems implement human-in-the-loop or human-on-the-loop oversight commensurate with risk and legal requirements.',
        'Technical documentation, logging, and traceability support conformity assessment and audit for high-risk AI systems under EU AI Act.',
        'AI vendors are assessed for model transparency, data handling, subprocessor chains, and regulatory compliance before procurement.',
      ],
    },
  ],
};

const PROCEDURE_STEP_OVERRIDES: Record<string, ProcedureStep[]> = {
  'identity-management': [
    {
      heading: 'Joiner — New Identity Provisioning',
      description: [
        'Upon approved hire or engagement, HR or the hiring manager initiates an access request with role, department, start date, and required systems.',
      ],
      substeps: [
        'HR validates employment/contract status and screening completion per Personnel Screening Procedure.',
        'IAM creates identity in authoritative directory with unique identifier; no shared accounts.',
        'Provision access per role-based access matrix with manager approval; default deny for non-standard access.',
        'Issue credentials via secure channel; require MFA enrollment before production access.',
        'Log all provisioning actions with ticket reference and approver identity.',
      ],
    },
    {
      heading: 'Mover — Role or Department Change',
      description: [
        'When a user changes role, department, or location, the manager submits a modification request within five business days of the effective date.',
      ],
      substeps: [
        'Review current access against new role requirements; remove access no longer required before granting new access.',
        'Obtain approvals for elevated or privileged access changes.',
        'Update access matrices and asset ownership records as applicable.',
      ],
    },
    {
      heading: 'Leaver — Termination and Deprovisioning',
      description: [
        'HR notifies IAM of termination (voluntary or involuntary) with last working day and required access cutoff time.',
      ],
      substeps: [
        'Disable all logical access before end of last working day (or immediately for involuntary termination).',
        'Revoke VPN, MFA tokens, physical badges, and remote device management enrollment.',
        'Initiate Return of Assets Procedure and transfer data per manager instructions.',
        'Retain audit logs of deprovisioning for minimum retention period.',
      ],
    },
  ],
  'incident-response': [
    {
      heading: 'Detection and Reporting',
      description: [
        'Upon report or automated detection, the SOC/on-call analyst acknowledges the event within 30 minutes and creates an incident record.',
      ],
      substeps: [
        'Capture initial details: reporter, affected systems, symptoms, time of detection.',
        'Perform preliminary triage against Security Event Assessment Procedure classification criteria.',
        'Notify incident commander for Severity 2+ events.',
      ],
    },
    {
      heading: 'Containment',
      description: [
        'Limit impact by isolating affected systems, blocking malicious indicators, or disabling compromised accounts while preserving evidence.',
      ],
      substeps: [
        'Document containment actions with timestamps and approver for production-impacting steps.',
        'Preserve logs, disk images, and network captures per Digital Evidence Collection Procedure.',
      ],
    },
    {
      heading: 'Eradication and Recovery',
      description: [
        'Remove root cause (malware, unauthorized access, misconfiguration) and restore services from known-good backups or rebuild procedures.',
      ],
      substeps: [
        'Validate eradication through scanning and monitoring before returning systems to production.',
        'Communicate status to stakeholders per incident communication plan.',
      ],
    },
    {
      heading: 'Post-Incident Review',
      description: [
        'Conduct lessons learned within five business days for significant incidents; update runbooks, controls, and risk register entries.',
      ],
    },
  ],
  'access-rights-review': [
    {
      heading: 'Generate Access Reports',
      description: [
        'Quarterly, IAM extracts access reports for all in-scope critical systems including users, roles, last login, and privilege level.',
      ],
    },
    {
      heading: 'Manager Certification',
      description: [
        'System and line managers certify that listed access remains appropriate within 10 business days. Non-responses trigger escalation.',
      ],
    },
    {
      heading: 'Remediate Findings',
      description: [
        'Remove orphaned, excessive, or non-certified access immediately. Document exceptions with time-bound approval.',
      ],
    },
    {
      heading: 'Report and Retain Evidence',
      description: [
        'Summarize review completion rates and remediations for management and audit. Retain certification records per retention schedule.',
      ],
    },
  ],
  'change-management': [
    {
      heading: 'Submit Change Request',
      description: [
        'Requester documents change description, business justification, affected systems, rollback plan, and security impact assessment.',
      ],
    },
    {
      heading: 'Assess and Approve',
      description: [
        'Change Advisory Board (CAB) or delegated approvers review risk, test evidence, and maintenance window. Emergency changes require post-implementation review within 24 hours.',
      ],
    },
    {
      heading: 'Implement and Test',
      description: [
        'Execute change in approved window following runbooks. Perform validation testing before closing the change record.',
      ],
    },
    {
      heading: 'Close and Review',
      description: [
        'Document actual outcome, incidents during change, and lessons learned. Failed changes initiate rollback per documented plan.',
      ],
    },
  ],
  'risk-assessment': [
    {
      heading: 'Establish Context',
      description: [
        'Define assessment scope, assets, threat actors, and criteria aligned with ISO 27001 Clause 6.1 and organizational risk appetite.',
      ],
    },
    {
      heading: 'Identify and Analyze Risks',
      description: [
        'Identify threats and vulnerabilities; analyze likelihood and impact using the approved scoring methodology.',
      ],
    },
    {
      heading: 'Evaluate and Treat',
      description: [
        'Compare risk levels against acceptance criteria. Document treatment decisions and update risk register and SoA.',
      ],
    },
    {
      heading: 'Report and Monitor',
      description: [
        'Present results to risk owners and management. Schedule reassessment triggers (annual, major change, incident).',
      ],
    },
  ],
  'ai-model-governance': [
    {
      heading: 'Register and Classify AI System',
      description: [
        'Document the AI system in the organisational inventory with purpose, owner, data sources, model type, and EU AI Act / internal risk classification before development or procurement proceeds.',
      ],
      substeps: [
        'Complete AI risk assessment per AI Risk Management Policy.',
        'Assign model owner and technical lead; define success metrics and monitoring thresholds.',
        'Obtain governance committee approval for high-risk classifications.',
      ],
    },
    {
      heading: 'Develop, Validate, and Test',
      description: [
        'Train or configure the model using approved data sources; validate for bias, accuracy, safety, and security before deployment.',
      ],
      substeps: [
        'Document training data provenance and preprocessing steps.',
        'Run bias, performance, and adversarial testing against acceptance criteria.',
        'Peer review model card / technical documentation.',
        'Security review for prompt injection, data leakage, and API exposure risks.',
      ],
    },
    {
      heading: 'Deploy with Approval',
      description: [
        'Obtain formal deployment approval from model owner and AI governance lead; implement logging, monitoring, and human oversight controls.',
      ],
      substeps: [
        'Configure audit logging and alerting for production inference.',
        'Publish user guidance and transparency disclosures where required.',
        'Record deployment date, version, and approvers in AI inventory.',
      ],
    },
    {
      heading: 'Monitor, Retire, and Improve',
      description: [
        'Continuously monitor model performance, drift, and incidents; retire or retrain models that no longer meet acceptance criteria.',
      ],
      substeps: [
        'Review monitoring dashboards on defined cadence (monthly for high-risk systems).',
        'Document incidents and feed lessons learned into model updates.',
        'Archive model artefacts and documentation upon retirement per retention schedule.',
      ],
    },
  ],
};

const POLICY_PURPOSE_OVERRIDES: Record<string, string[]> = {
  'isms-information-security': [
    'This Information Security Policy establishes [Organization Name]\'s commitment to protecting information assets and defines the framework for the Information Security Management System (ISMS) in accordance with ISO/IEC 27001:2022.',
    'It sets management direction, information security objectives, and mandatory requirements that govern how confidentiality, integrity, and availability are preserved across people, processes, and technology.',
    'This top-level policy satisfies ISO 27001 Clause 5.2 and Annex A.5.1 and provides the foundation upon which all topic-specific policies and procedures are built.',
  ],
};

function buildPolicyContent(def: PolicyTemplateDef): string {
  const purpose =
    POLICY_PURPOSE_OVERRIDES[def.id] ??
    [
      `This policy defines mandatory requirements for ${def.title.replace(/ Policy$| Standard$/, '')} to protect [Organization Name] information assets and support conformity with ISO/IEC 27001:2022.`,
      `${def.description}`,
      `It establishes clear expectations for personnel, control owners, and management to implement Annex A control ${def.isoReference} consistently across the ISMS scope.`,
    ];

  const params: PolicyContentParams = {
    meta: metaFromDef(def),
    purpose,
    scope: standardScope(def),
    objectives: def.id === 'isms-information-security'
      ? [
          'Protect information assets commensurate with classification and business value.',
          'Maintain an effective ISMS aligned with ISO 27001:2022 and continual improvement.',
          'Meet applicable legal, regulatory, and contractual security obligations.',
          'Enable secure and resilient business operations with measurable security outcomes.',
        ]
      : def.categoryId === 'ai-governance'
        ? [
            'Establish accountable AI governance aligned with EU AI Act, NIST AI RMF, and ISO/IEC 42001.',
            'Classify and manage AI risks commensurate with system impact and regulatory tier.',
            'Enable trustworthy AI deployment with human oversight, transparency, and audit-ready evidence.',
          ]
        : def.id === 'dpdp-data-protection'
          ? [
              'Achieve compliance with India\'s Digital Personal Data Protection Act, 2023 and DPDP Rules, 2025.',
              'Protect Data Principal rights through transparent notice, consent, and grievance mechanisms.',
              'Implement security safeguards and breach notification aligned with Data Protection Board requirements.',
            ]
          : [
              `Implement ${def.isoReference} controls effectively and measurably.`,
              'Reduce information security risk to acceptable levels per risk treatment plan.',
              'Provide clear accountability and audit-ready evidence of conformity.',
            ],
    definitions: { ...STANDARD_ISMS_DEFINITIONS, ...(def.categoryId === 'ai-governance' ? AI_DEFINITIONS : {}), ...(def.categoryId === 'privacy-legal' || def.id === 'dpdp-data-protection' ? PRIVACY_DEFINITIONS : {}) },
    roles: categoryRoles(def),
    policyStatements: policyStatementsFromDef(def),
    frameworkSections: buildAllFrameworkSections(def),
    relatedDocuments: relatedDocsForCategory(def.categoryId),
  };

  return buildPolicyMarkdown(params);
}

function buildProcedureContent(def: PolicyTemplateDef): string {
  const purpose = [
    `This procedure describes the standardized process for ${def.title.replace(/ Procedure$/, '').toLowerCase()} at [Organization Name].`,
    `${def.description}`,
    `It ensures consistent, repeatable, and auditable execution of activities supporting ISO 27001:2022 control ${def.isoReference}.`,
  ];

  const params: ProcedureContentParams = {
    meta: metaFromDef(def),
    purpose,
    scope: standardProcedureScope(def),
    definitions: { ...STANDARD_ISMS_DEFINITIONS, ...(def.categoryId === 'ai-governance' ? AI_DEFINITIONS : {}) },
    roles: categoryRoles(def),
    prerequisites: [
      'Applicable policies and standards read and understood by performers.',
      'Authorization to perform activities per segregation of duties requirements.',
      'Access to ISMS document repository, ticketing/workflow system, and required tools.',
      'Completed role-based training for personnel executing this procedure.',
    ],
    steps: procedureStepsFromDef(def),
    frameworkSections: buildAllFrameworkSections(def),
    records: procedureRecords(def),
    relatedDocuments: relatedDocsForCategory(def.categoryId),
  };

  return buildProcedureMarkdown(params);
}

function categoryRoles(def: PolicyTemplateDef): RoleEntry[] {
  const extra: RoleEntry[] = [];
  switch (def.categoryId) {
    case 'access-identity':
      extra.push({ role: 'IAM / Identity team', responsibility: 'Execute provisioning, deprovisioning, and access reviews per defined SLAs.' });
      break;
    case 'operations':
      extra.push({ role: 'IT Operations / Engineering', responsibility: 'Implement operational controls, changes, and monitoring per approved procedures.' });
      break;
    case 'incident-bc':
      extra.push({ role: 'Incident Response Team / SOC', responsibility: 'Coordinate detection, response, and recovery activities for security events.' });
      break;
    case 'supplier':
      extra.push({ role: 'Vendor Risk / Procurement', responsibility: 'Assess supplier security, contract clauses, and ongoing monitoring.' });
      break;
    case 'privacy-legal':
      extra.push({ role: 'Data Protection Officer / Legal', responsibility: 'Advise on privacy, regulatory, and contractual compliance requirements.' });
      break;
    case 'ai-governance':
      extra.push({ role: 'AI Governance Lead / CAIO', responsibility: 'Maintain AI inventory, chair governance reviews, and enforce AI risk classification.' });
      extra.push({ role: 'Model owner', responsibility: 'Accountable for AI system performance, monitoring, and lifecycle decisions.' });
      break;
    default:
      break;
  }
  return [...STANDARD_ROLES.slice(0, 3), ...extra, ...STANDARD_ROLES.slice(3)];
}

function relatedDocsForCategory(categoryId: string): string[] {
  const base = [
    'Information Security Policy',
    'Documented Operating Procedures Standard (A.5.37)',
    'Statement of Applicability (SoA)',
    'Risk Assessment and Treatment Procedure',
  ];
  const byCategory: Record<string, string[]> = {
    governance: ['Compliance with Policies Policy (A.5.36)', 'Independent Review Policy (A.5.35)'],
    'access-identity': ['Access Control Policy (A.5.15)', 'Identity Management Procedure (A.5.16)', 'Access Rights Review Procedure (A.5.18)'],
    'asset-data': ['Asset Management Policy (A.5.9)', 'Information Classification Policy (A.5.12)', 'Data Retention and Disposal Policy'],
    'hr-people': ['Acceptable Use Policy (A.5.10)', 'Security Awareness and Training Policy (A.6.3)'],
    operations: ['Change Management Procedure (A.8.32)', 'Logging and Monitoring Policy (A.8.15–A.8.16)'],
    'incident-bc': ['Incident Response Policy (A.5.24)', 'Business Continuity Policy (A.5.29–A.5.30)'],
    'privacy-legal': ['Privacy and PII Protection Policy (A.5.34)', 'DPDP Data Protection Policy', 'Legal and Regulatory Compliance Policy (A.5.31)'],
    supplier: ['Third-Party Security Policy (A.5.19)', 'Supplier Security Agreements Procedure (A.5.20)'],
    'ai-governance': ['AI Governance Policy', 'AI Acceptable Use Policy', 'AI Risk Management Policy', 'Information Security Policy (A.5.1)'],
  };
  return [...base, ...(byCategory[categoryId] ?? [])];
}

function procedureRecords(def: PolicyTemplateDef): string[] {
  return [
    `Workflow/ticket records with timestamps, performers, and approvers for ${def.title.toLowerCase()} activities.`,
    'Checklists, screenshots, or system-generated logs demonstrating completion of mandatory steps.',
    'Approval records and exception documentation where deviations occurred.',
    'Evidence retained per Records Protection Procedure and applicable retention schedules (minimum three years unless otherwise required).',
  ];
}

/** Build comprehensive ISO 27001-aligned markdown content for a catalog template definition. */
export function buildRichTemplateContent(def: PolicyTemplateDef): string {
  return def.documentType === 'procedure' ? buildProcedureContent(def) : buildPolicyContent(def);
}

const AI_DEFINITIONS: Record<string, string> = {
  'AI system': 'A machine-based system that generates outputs such as predictions, recommendations, or decisions for given objectives.',
  'High-risk AI': 'AI systems classified as high-risk under the EU AI Act or internal risk taxonomy requiring enhanced governance controls.',
  'Human oversight': 'Meaningful review by qualified personnel before or during AI-influenced decisions with authority to override.',
  'Model card': 'Documentation describing model purpose, training data, performance metrics, limitations, and known biases.',
};

const PRIVACY_DEFINITIONS: Record<string, string> = {
  'Data Principal': 'The individual to whom personal data relates (DPDP Act terminology).',
  'Data Fiduciary': 'Entity determining the purpose and means of processing personal data under the DPDP Act.',
  DPO: 'Data Protection Officer — designated individual responsible for privacy compliance and Data Principal liaison.',
  RoPA: 'Record of Processing Activities — documents processing purposes, categories, recipients, and retention.',
};
