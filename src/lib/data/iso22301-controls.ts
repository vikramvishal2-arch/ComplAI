import type { Control, ComplianceMethod, ControlDomain } from '../types';

function bcms(
  ref: string,
  title: string,
  description: string,
  domain: ControlDomain,
  guidance: string,
  suggestedMethods: ComplianceMethod[] = ['policy', 'procedure']
): Control {
  const id = `iso22301-${ref.toLowerCase().replace(/\./g, '-')}`;
  return {
    id,
    frameworkId: 'iso22301',
    reference: ref,
    title,
    description,
    domain,
    guidance,
    suggestedMethods,
  };
}

/** ISO 22301:2019 BCMS — core clause requirements (representative control set). */
export const ISO22301_CONTROLS: Control[] = [
  bcms(
    '4.1',
    'Understanding the organization and its context',
    'Determine external and internal issues relevant to the BCMS and business continuity objectives.',
    'governance',
    'Document organizational context, regulatory drivers, and dependencies in BCMS scope statement.',
    ['policy', 'procedure']
  ),
  bcms(
    '4.2',
    'Needs and expectations of interested parties',
    'Identify interested parties and their requirements relevant to business continuity.',
    'governance',
    'Stakeholder register with BC requirements from regulators, customers, and leadership.',
    ['procedure']
  ),
  bcms(
    '5.2',
    'Business continuity policy',
    'Establish, implement, and maintain a business continuity policy appropriate to the organization.',
    'governance',
    'Board-approved BC policy reviewed annually and communicated org-wide.',
    ['policy']
  ),
  bcms(
    '5.3',
    'Organizational roles, responsibilities and authorities',
    'Assign and communicate BCMS roles, responsibilities, and authorities.',
    'governance',
    'BC manager, crisis team, and escalation RACI documented and trained.',
    ['policy', 'procedure']
  ),
  bcms(
    '6.1',
    'Actions to address risks and opportunities',
    'Plan actions to address BCMS risks and opportunities.',
    'risk_management',
    'BC risk register integrated with enterprise risk management.',
    ['procedure', 'manual_process']
  ),
  bcms(
    '6.2',
    'Business continuity objectives and planning',
    'Establish measurable BC objectives and plans to achieve them.',
    'governance',
    'SMART BC objectives aligned to RTO/RPO targets and leadership approval.',
    ['policy', 'procedure']
  ),
  bcms(
    '8.2',
    'Business impact analysis and risk assessment',
    'Conduct BIA and risk assessment to establish priorities and recovery requirements.',
    'business_continuity',
    'BIA covering critical activities, MTPD, RTO, RPO, and resource dependencies.',
    ['procedure', 'manual_process']
  ),
  bcms(
    '8.3',
    'Business continuity strategies and solutions',
    'Select strategies and solutions to meet recovery objectives.',
    'business_continuity',
    'Documented recovery strategies for people, technology, facilities, and suppliers.',
    ['procedure', 'policy']
  ),
  bcms(
    '8.4',
    'Business continuity plans and procedures',
    'Establish BC plans and procedures for disruption response and recovery.',
    'business_continuity',
    'Crisis management, communication, and recovery plans maintained and accessible offline.',
    ['procedure', 'policy']
  ),
  bcms(
    '8.5',
    'Exercise and testing',
    'Exercise and test BC plans and capabilities at planned intervals.',
    'business_continuity',
    'Annual tabletop plus periodic technical recovery tests with documented results.',
    ['procedure', 'manual_process']
  ),
  bcms(
    '8.6',
    'Evaluation of business continuity documentation and capabilities',
    'Evaluate BC documentation and capabilities after changes, incidents, or exercises.',
    'governance',
    'Post-exercise and post-incident reviews with tracked improvement actions.',
    ['procedure']
  ),
  bcms(
    '9.1',
    'Monitoring, measurement, analysis and evaluation',
    'Monitor BCMS performance and the effectiveness of BC capabilities.',
    'governance',
    'BC KPIs such as exercise completion, plan review status, and RTO achievement.',
    ['procedure', 'automated_monitoring']
  ),
  bcms(
    '9.2',
    'Internal audit',
    'Conduct internal audits of the BCMS at planned intervals.',
    'governance',
    'Independent BCMS audit program with findings tracked to closure.',
    ['manual_process', 'third_party_attestation']
  ),
  bcms(
    '9.3',
    'Management review',
    'Top management reviews the BCMS at planned intervals.',
    'governance',
    'Annual management review with inputs from audits, exercises, incidents, and KPIs.',
    ['procedure', 'policy']
  ),
  bcms(
    '10.1',
    'Continual improvement',
    'Continually improve the suitability, adequacy, and effectiveness of the BCMS.',
    'governance',
    'Corrective action process for BC gaps identified through audits and exercises.',
    ['procedure']
  ),
];
