export type SolutionGuide = {
  id: string;
  title: string;
  tagline: string;
  /** Short card blurb on /solutions */
  description: string;
  overview: string;
  whoItsFor: string;
  keyCapabilities: string[];
  howComplAIHelps: string[];
  /** Secondary CTA — explore related platform area */
  platformHref: string;
  platformLabel: string;
};

export const MARKETING_SOLUTIONS: SolutionGuide[] = [
  {
    id: 'compliance',
    title: 'Simplify compliance',
    tagline: 'Get and stay compliant across every framework you need.',
    description:
      'Get and stay compliant across SOC 2, ISO 27001, GDPR, HIPAA, PCI DSS, and regional frameworks — with pre-mapped controls and clear implementation guidance.',
    overview:
      'Multi-framework compliance does not have to mean duplicate work. ComplAI maps controls once and reuses them across SOC 2, ISO 27001, GDPR, HIPAA, PCI DSS, India DPDP, SEBI CSCRF, and other standards — so your team implements once and evidences everywhere.',
    whoItsFor:
      'Security and compliance teams preparing for a first certification, adding a second framework, or consolidating overlapping audit programs without hiring a large GRC staff.',
    keyCapabilities: [
      'Pre-mapped control libraries for major global and regional frameworks',
      'Unified control mapping — implement once, reuse across certifications',
      'Framework readiness scores with RAG status per standard',
      'Regional coverage including India DPDP and SEBI CSCRF',
      'Continuous tracking instead of pre-audit scrambles',
    ],
    howComplAIHelps: [
      'Start from auditor-aligned control sets instead of blank spreadsheets',
      'See which controls satisfy multiple frameworks at once',
      'Track implementation status and evidence per control in one workspace',
      'Surface gaps on leadership dashboards before auditors do',
    ],
    platformHref: '/platform/#frameworks',
    platformLabel: 'Explore framework compliance',
  },
  {
    id: 'audits',
    title: 'Streamline audits',
    tagline: 'Share, track, and close audits faster.',
    description:
      'Track evidence, policy approvals, and control status in one place. Export auditor-ready Word documents and breeze through internal and external reviews.',
    overview:
      'Audit readiness is a workflow problem as much as a controls problem. ComplAI centralizes evidence collection, approval chains, and control status so internal reviews and external audits run from a single source of truth — not email threads and shared drives.',
    whoItsFor:
      'Teams facing SOC 2, ISO 27001, or internal audit cycles who spend weeks hunting evidence, chasing approvers, and reconciling outdated documents before every review.',
    keyCapabilities: [
      'Evidence upload and linking per control',
      'Multi-stage policy approval workflows with My Approvals inbox',
      'Auditor-ready Word export for ISMS documents',
      'Issue logging and remediation tracking per control',
      'Real-time control status visible to auditors and leadership',
    ],
    howComplAIHelps: [
      'Replace shared-drive evidence hunts with centralized control evidence',
      'Route policies through configurable prepare and review steps',
      'Export formatted Word documents that match auditor expectations',
      'Keep audit trails and version history without manual file naming',
    ],
    platformHref: '/platform/#approvals',
    platformLabel: 'See approval workflows',
  },
  {
    id: 'policies',
    title: 'Policy & ISMS management',
    tagline: 'Templates, workflows, and Word export — built for ISMS teams.',
    description:
      '100+ ISO 27001 Annex A templates, multi-stage approval workflows, My Approvals inbox, and in-app editing with Word export.',
    overview:
      'Building an ISMS from scratch slows every audit. ComplAI ships 100+ ISO 27001 Annex A-aligned policy and procedure templates, supports in-app editing, and exports to Word — so your team publishes approved documents faster and keeps versions under control.',
    whoItsFor:
      'Organizations establishing or refreshing an ISMS, especially teams pursuing ISO 27001 who need Annex A-aligned policies without starting from blank documents.',
    keyCapabilities: [
      '100+ auditor-ready ISMS policy and procedure templates',
      'Upload existing documents or create from templates',
      'In-app editing with version lifecycle tracking',
      'Word export matching document-style formatting',
      'Approval workflows tied to each policy version',
    ],
    howComplAIHelps: [
      'Deploy Annex A coverage quickly with pre-built templates',
      'Run policies through formal approval before audit',
      'Give every employee a My Approvals inbox for pending actions',
      'Maintain one canonical policy library instead of scattered files',
    ],
    platformHref: '/platform/#policies',
    platformLabel: 'Browse policy templates',
  },
  {
    id: 'risk',
    title: 'Monitor cyber risk',
    tagline: 'Build a live, collaborative risk program.',
    description:
      'Maintain a living risk register with scoring and treatment status, linked to controls and surfaced on the leadership dashboard.',
    overview:
      'Risk registers in spreadsheets go stale the week they are created. ComplAI keeps risks scored, owned, and linked to mitigating controls — with executive visibility so leadership sees posture changes without waiting for quarterly slide decks.',
    whoItsFor:
      'CISOs, risk owners, and GRC leads who need a risk register that stays current and connects to the control program — not a static Excel file updated before board meetings.',
    keyCapabilities: [
      'Living risk register with scoring and treatment status',
      'Link risks to mitigating controls and evidence',
      'Ownership and review tracking per risk item',
      'Executive dashboard roll-up of open and high-severity risks',
      'Configurable risk formulas for your program',
    ],
    howComplAIHelps: [
      'Connect risks to controls so remediation is actionable',
      'Surface high and critical risks on leadership dashboards',
      'Track treatment progress alongside compliance work',
      'Replace manual risk spreadsheets with a shared workspace',
    ],
    platformHref: '/platform/#risk',
    platformLabel: 'View risk register',
  },
  {
    id: 'vendors',
    title: 'Assess third-party risk',
    tagline: 'Manage vendor risk with real insight.',
    description:
      'Track vendor assessments, due diligence status, and compliance posture alongside your internal control program.',
    overview:
      'Third-party risk lives in questionnaires, emails, and spreadsheets — disconnected from your internal controls. ComplAI tracks vendor tier, assessment status, and due diligence alongside ISO and SOC control requirements so supplier risk is part of one GRC program.',
    whoItsFor:
      'Teams managing SaaS vendors, processors, and critical suppliers who need due diligence tracking aligned to frameworks like ISO 27001 A.5.19 and SOC 2 vendor management controls.',
    keyCapabilities: [
      'Vendor inventory with tier classification (Critical, High, Medium)',
      'Due diligence and assessment status tracking',
      'Questionnaire templates mapped to supplier controls',
      'Compliance posture visible next to internal controls',
      'Executive summary of open vendor gaps',
    ],
    howComplAIHelps: [
      'Stop tracking vendors in a separate tool from your ISMS',
      'Tie vendor assessments to framework control requirements',
      'Prioritize critical and high-tier suppliers automatically',
      'Give auditors a clear third-party risk narrative',
    ],
    platformHref: '/platform/#vendors',
    platformLabel: 'See vendor assessments',
  },
  {
    id: 'integrations',
    title: 'Integrate your tech stack',
    tagline: 'Connect the tools you already use.',
    description:
      'Connect HRMS, IAM, SIEM, VAPT, and SSO tools with setup guides for automated evidence and continuous monitoring.',
    overview:
      'GRC programs fail when evidence collection is manual. ComplAI catalogs HRMS, IAM, SIEM, VAPT, and SSO integrations with step-by-step setup guides — so your team connects existing tools for automated evidence and continuous control monitoring.',
    whoItsFor:
      'Security engineers and GRC operators who need Okta, Workday, Sentinel, CrowdStrike, Tenable, and similar tools feeding evidence into the compliance program without custom scripts per audit.',
    keyCapabilities: [
      '80+ integration tools across HRMS, IDAM, SIEM, VAPT, and SSO',
      'Step-by-step setup guides per integration',
      'Deployment model and capability tags per tool',
      'Control-level integration mapping for evidence',
      'Continuous monitoring hooks for access and configuration drift',
    ],
    howComplAIHelps: [
      'Browse integrations by category and deployment model',
      'Follow guided setup instead of guessing API scopes',
      'Map integration outputs to specific controls',
      'Reduce manual screenshot evidence for access reviews',
    ],
    platformHref: '/help/',
    platformLabel: 'Browse integration guides',
  },
  {
    id: 'intelligence',
    title: 'AI-powered GRC',
    tagline: 'Resolve gaps faster with AI guidance.',
    description:
      'Gap analysis, security questionnaires, remediation guidance, and SecOps intelligence — embedded in the platform.',
    overview:
      'Compliance teams lose days on security questionnaires, gap analysis, and repetitive auditor questions. ComplAI Intelligence embeds AI-assisted guidance across the platform — from questionnaire responses to remediation suggestions and SecOps context — so experts focus on decisions, not document hunting.',
    whoItsFor:
      'Teams answering customer security questionnaires, running gap assessments, or needing faster remediation guidance during audit prep and continuous monitoring.',
    keyCapabilities: [
      'AI copilot for compliance and risk questions',
      'Gap analysis against framework requirements',
      'Security questionnaire assistance',
      'Remediation guidance linked to controls',
      'Google Chronicle SecOps intelligence integration',
    ],
    howComplAIHelps: [
      'Draft questionnaire answers from your control evidence',
      'Identify gaps before external auditors do',
      'Get contextual remediation steps per failing control',
      'Reduce time spent searching docs and past audit files',
    ],
    platformHref: '/platform/#intelligence',
    platformLabel: 'Explore ComplAI Intelligence',
  },
  {
    id: 'dashboard',
    title: 'Leadership visibility',
    tagline: 'Real-time dashboards for CISOs and CIOs.',
    description:
      'CISO and CIO dashboard with RAG status by domain, framework readiness, risk summary, and prioritized actions.',
    overview:
      'Leadership needs posture at a glance — not 200-row spreadsheets. ComplAI leadership dashboards show RAG status by security domain, framework readiness, open risks, and prioritized actions so CISOs and CIOs steer the program with current data.',
    whoItsFor:
      'CISOs, CIOs, and GRC program sponsors who present to boards and executives and need trustworthy, filterable compliance and risk views without manual PowerPoint assembly.',
    keyCapabilities: [
      'RAG status across security domains and frameworks',
      'Framework readiness scores with drill-down',
      'Risk summary with high/critical highlighting',
      'Prioritized action items for leadership review',
      'Filter by framework, severity, and ownership',
    ],
    howComplAIHelps: [
      'Replace quarterly manual dashboard builds with live views',
      'Show green/amber/red posture consistently across frameworks',
      'Highlight what needs attention this week, not last quarter',
      'Give auditors and executives a credible program snapshot',
    ],
    platformHref: '/platform/#dashboard',
    platformLabel: 'See leadership dashboard',
  },
];

export function getSolutionGuide(id: string): SolutionGuide | undefined {
  return MARKETING_SOLUTIONS.find((s) => s.id === id);
}

export function getAllSolutionSlugs(): string[] {
  return MARKETING_SOLUTIONS.map((s) => s.id);
}

export function solutionPageHref(id: string): string {
  return `/solutions/${id}`;
}
