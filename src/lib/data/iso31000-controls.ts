import type { Control, ComplianceMethod, ControlDomain } from '../types';

function rm(
  ref: string,
  title: string,
  description: string,
  domain: ControlDomain,
  guidance: string,
  suggestedMethods: ComplianceMethod[] = ['policy', 'procedure']
): Control {
  const id = `iso31000-${ref.toLowerCase().replace(/\./g, '-')}`;
  return {
    id,
    frameworkId: 'iso31000',
    reference: ref,
    title,
    description,
    domain,
    guidance,
    suggestedMethods,
  };
}

/** ISO 31000:2018 risk management guidelines — framework and process controls. */
export const ISO31000_CONTROLS: Control[] = [
  rm(
    '4',
    'Risk management principles',
    'Apply integrated, structured, and continually improving risk management principles.',
    'governance',
    'Document adoption of ISO 31000 principles in enterprise risk policy.',
    ['policy']
  ),
  rm(
    '5.2',
    'Leadership and commitment',
    'Top management demonstrates leadership and commitment to risk management.',
    'governance',
    'Executive sponsor for ERM with board risk committee oversight.',
    ['policy', 'procedure']
  ),
  rm(
    '5.3',
    'Integration',
    'Integrate risk management into governance, strategy, and all organizational activities.',
    'governance',
    'Risk considerations embedded in strategy, procurement, projects, and change control.',
    ['procedure', 'policy']
  ),
  rm(
    '5.4',
    'Design',
    'Design a risk management framework tailored to organizational context.',
    'governance',
    'ERM framework document defining scope, roles, tools, and reporting cadence.',
    ['policy', 'procedure']
  ),
  rm(
    '5.5',
    'Implementation',
    'Implement the risk management framework with appropriate resources.',
    'governance',
    'Rollout plan with training, tooling, and risk register adoption milestones.',
    ['procedure', 'training_awareness']
  ),
  rm(
    '6.2',
    'Communication and consultation',
    'Communicate and consult with stakeholders throughout the risk management process.',
    'governance',
    'Stakeholder communication plan for risk identification, treatment, and reporting.',
    ['procedure']
  ),
  rm(
    '6.3',
    'Establishing context and criteria',
    'Define scope, external/internal context, and risk criteria including appetite and tolerance.',
    'risk_management',
    'Risk appetite statement and scoring matrix approved by leadership.',
    ['policy', 'procedure']
  ),
  rm(
    '6.4.1',
    'Risk identification',
    'Identify sources of risk, areas of impact, events, and their causes and potential consequences.',
    'risk_management',
    'Structured risk identification workshops and threat catalog reviews.',
    ['procedure', 'manual_process']
  ),
  rm(
    '6.4.2',
    'Risk analysis',
    'Analyze risks to understand likelihood, consequences, controls, and velocity.',
    'risk_management',
    'Consistent scoring methodology with inherent and residual risk views.',
    ['procedure', 'manual_process']
  ),
  rm(
    '6.4.3',
    'Risk evaluation',
    'Compare risk analysis results against criteria to prioritize treatment.',
    'risk_management',
    'Risk evaluation against appetite with documented accept/treat/transfer/avoid decisions.',
    ['procedure']
  ),
  rm(
    '6.5',
    'Risk treatment',
    'Select and implement risk treatment options and controls.',
    'risk_management',
    'Treatment plans with owners, deadlines, and linked mitigating controls.',
    ['procedure', 'policy']
  ),
  rm(
    '6.6',
    'Monitoring and review',
    'Monitor and review the risk management process and its outcomes.',
    'risk_management',
    'Quarterly risk register review and trigger-based reassessment after major changes.',
    ['procedure', 'automated_monitoring']
  ),
  rm(
    '6.7',
    'Recording and reporting',
    'Record and report risk management activities and outcomes.',
    'governance',
    'Risk register, heat maps, and executive risk reports with audit trail.',
    ['procedure', 'manual_process']
  ),
  rm(
    '10',
    'Continual improvement',
    'Continually improve the risk management framework and process.',
    'governance',
    'Lessons learned from incidents, audits, and risk reviews feed framework updates.',
    ['procedure']
  ),
];
