import type { Control, Risk, RiskTreatment } from '@/lib/types';
import { DOMAIN_LABELS, RISK_TREATMENT_LABELS } from '@/lib/types';

export type RiskRemediationStep = {
  title: string;
  detail: string;
};

export type RiskRemediationGuidance = {
  summary: string;
  treatmentLabel: string;
  whyItMatters: string;
  steps: RiskRemediationStep[];
  evidence: string[];
  nextActions: string[];
  /** Plain text suitable for seeding mitigationPlan */
  mitigationPlanDraft: string;
};

const TREATMENT_WHY: Record<RiskTreatment, string> = {
  mitigate:
    'Mitigation reduces likelihood or impact through control design, process changes, or technical fixes. Auditors expect a named owner, milestones, and residual risk after treatment.',
  accept:
    'Acceptance is appropriate only when residual risk is within appetite. Document rationale, approver, review date, and compensating monitoring.',
  transfer:
    'Transfer shifts residual exposure via insurance, contracts, or managed services. Confirm coverage scope, exclusions, and claim/notification obligations.',
  avoid:
    'Avoidance removes the activity or exposure entirely. Document what changes (scope, product, system) and validate that related controls stay coherent.',
};

const CATEGORY_HINTS: Record<string, string> = {
  compliance:
    'Map the risk to the governing framework control, close policy/process gaps, and retain evidence for the next audit cycle.',
  security:
    'Prioritize exploitability and asset criticality. Prefer containment, hardening, and monitoring before long-term redesign.',
  operational:
    'Address process ownership, capacity, and failure modes. Use runbooks, dual-control, and metrics that prove the process is working.',
  financial:
    'Quantify exposure where possible, involve finance stakeholders, and track cost of treatment vs residual exposure.',
  reputational:
    'Coordinate with communications and legal. Prefer transparent handling, customer notification readiness, and brand impact assessment.',
  legal:
    'Engage counsel early. Capture regulatory timelines, contract obligations, and approval of any acceptance or transfer decision.',
  third_party:
    'Drive vendor due diligence, contractual controls, monitoring, and exit/contingency options if the vendor cannot remediate.',
};

const TREATMENT_STEPS: Record<RiskTreatment, RiskRemediationStep[]> = {
  mitigate: [
    {
      title: 'Confirm root cause and scope',
      detail:
        'Describe the threat/event, affected assets or processes, and which control(s) failed or are missing. Align owners on a single problem statement.',
    },
    {
      title: 'Select mitigating actions',
      detail:
        'Choose people, process, and/or technology fixes that reduce likelihood and/or impact. Prefer controls already mapped to this risk where possible.',
    },
    {
      title: 'Assign owner, due date, and success criteria',
      detail:
        'Record RACI, a realistic due date, and how you will know residual risk is acceptable (re-score, evidence, or control effectiveness).',
    },
    {
      title: 'Implement and collect evidence',
      detail:
        'Track tickets/changes, retain before/after evidence, and update linked control assessments or issues when work completes.',
    },
    {
      title: 'Re-assess residual risk and close or escalate',
      detail:
        'Update present/residual likelihood and impact. Submit for review/approval or keep treating if residual remains above appetite.',
    },
  ],
  accept: [
    {
      title: 'Document acceptance rationale',
      detail:
        'Explain why mitigation is impractical or disproportionate. Reference appetite thresholds and compensating measures already in place.',
    },
    {
      title: 'Obtain formal approval',
      detail:
        'Route to the designated approver (risk/compliance/executive as required). Capture decision date and comments.',
    },
    {
      title: 'Set review cadence and monitoring',
      detail:
        'Define when the acceptance will be revisited and what signals (incidents, metrics, audit findings) would reopen treatment.',
    },
  ],
  transfer: [
    {
      title: 'Identify transfer mechanism',
      detail:
        'Insurance, contractual indemnity, managed service, or outsourced control operation — be specific about what is transferred vs retained.',
    },
    {
      title: 'Verify coverage and obligations',
      detail:
        'Confirm policy/contract language, exclusions, SLAs, notification windows, and residual duties that stay with your organization.',
    },
    {
      title: 'Track vendor/insurer performance',
      detail:
        'Monitor claim readiness, attestations, and service metrics. Keep residual risk scored for retained exposure.',
    },
  ],
  avoid: [
    {
      title: 'Define what will be stopped or redesigned',
      detail:
        'Specify the activity, product feature, system, or third-party relationship being eliminated or replaced.',
    },
    {
      title: 'Plan transition and dependencies',
      detail:
        'Identify dependent processes, communication needs, and control updates so avoidance does not create new gaps.',
    },
    {
      title: 'Validate risk is no longer present',
      detail:
        'Confirm the exposure is gone, update residual scoring to reflect avoidance, and archive evidence of the decision.',
    },
  ],
};

const TREATMENT_EVIDENCE: Record<RiskTreatment, string[]> = {
  mitigate: [
    'Updated mitigation plan with milestones',
    'Change/tickets proving remediation work',
    'Control operating evidence or re-test result',
    'Residual risk score after treatment',
  ],
  accept: [
    'Written acceptance rationale',
    'Approver decision record with date',
    'Compensating control / monitoring description',
    'Scheduled residual-risk review date',
  ],
  transfer: [
    'Contract / insurance schedule excerpt',
    'Vendor or insurer confirmation of coverage',
    'SLA / claim notification procedure',
    'Residual retained-risk narrative',
  ],
  avoid: [
    'Decision record to discontinue/redesign',
    'Transition / decommission evidence',
    'Updated process or architecture diagram',
    'Confirmation residual exposure is removed',
  ],
};

function categoryHint(category: string): string {
  return CATEGORY_HINTS[category] ?? CATEGORY_HINTS.operational;
}

function controlNextActions(control: Control | null | undefined): string[] {
  if (!control) {
    return [
      'Link at least one framework control that should mitigate this risk',
      'Assess control design/operating effectiveness from the risk workflow panel',
      'Raise a control issue if assessment finds a deviation',
    ];
  }
  return [
    `Review linked control ${control.reference} (${DOMAIN_LABELS[control.domain]}) for design gaps`,
    `Open control remediation for ${control.reference} if treatment is mitigate`,
    'Re-test mapped controls after remediation and update residual scoring',
  ];
}

export function buildRiskRemediationGuidance(
  risk: Pick<Risk, 'title' | 'description' | 'category' | 'treatment' | 'status' | 'mitigationPlan'>,
  control?: Control | null
): RiskRemediationGuidance {
  const treatment = risk.treatment;
  const steps = TREATMENT_STEPS[treatment];
  const domainNote = control
    ? ` Primary control domain: ${DOMAIN_LABELS[control.domain]} (${control.reference}).`
    : '';

  const summary = [
    `Recommended path: ${RISK_TREATMENT_LABELS[treatment]} for “${risk.title}”.`,
    categoryHint(risk.category),
    domainNote.trim(),
  ]
    .filter(Boolean)
    .join(' ');

  const nextActions = [
    ...controlNextActions(control),
    risk.status === 'identified' || risk.status === 'assessing'
      ? 'Submit for review once the mitigation plan and owners are complete'
      : 'Keep status current as each remediation milestone completes',
  ];

  const mitigationPlanDraft = [
    `Treatment: ${RISK_TREATMENT_LABELS[treatment]}`,
    '',
    'Plan:',
    ...steps.map((s, i) => `${i + 1}. ${s.title} — ${s.detail}`),
    '',
    'Evidence to retain:',
    ...TREATMENT_EVIDENCE[treatment].map((e) => `- ${e}`),
    control ? `\nLinked control: ${control.reference} — ${control.title}` : '',
  ]
    .filter((line) => line !== undefined)
    .join('\n');

  return {
    summary,
    treatmentLabel: RISK_TREATMENT_LABELS[treatment],
    whyItMatters: TREATMENT_WHY[treatment],
    steps,
    evidence: TREATMENT_EVIDENCE[treatment],
    nextActions,
    mitigationPlanDraft,
  };
}

/** Compact tips for the create modal while a risk is being raised. */
export function buildRiskRaiseTips(input: {
  treatment: RiskTreatment;
  category: string;
}): string[] {
  const steps = TREATMENT_STEPS[input.treatment].slice(0, 3);
  return [
    categoryHint(input.category),
    ...steps.map((s) => `${s.title}: ${s.detail}`),
  ];
}
