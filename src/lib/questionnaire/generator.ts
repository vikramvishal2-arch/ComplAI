import 'server-only';
import { CONTROLS } from '../data/controls';
import {
  getActivatedFrameworkIds,
  getControlComplianceBatch,
  getOrganizationName,
  createDefaultCompliance,
} from '../store';

export { SAMPLE_QUESTIONNAIRE } from './constants';

export interface QuestionnaireAnswer {
  question: string;
  answer: string;
  confidence: 'high' | 'medium' | 'low' | 'needs_review';
  sourceControlIds: string[];
  sourceNotes: string;
}

const KEYWORD_MAP: { keywords: string[]; controlPatterns: RegExp[]; template: string }[] = [
  {
    keywords: ['access control', 'authentication', 'mfa', 'multi-factor', 'sso', 'identity'],
    controlPatterns: [/access/i, /CC6/i, /A\.5\.15/i, /A\.8\.5/i, /auth/i],
    template:
      'We enforce role-based access control with least privilege. Authentication uses SSO/MFA for workforce access. Access is reviewed periodically and provisioned via approved workflows.',
  },
  {
    keywords: ['encryption', 'data at rest', 'data in transit', 'cryptograph'],
    controlPatterns: [/encrypt/i, /crypt/i, /A\.8\.24/i, /CC6\.7/i],
    template:
      'Sensitive data is encrypted in transit (TLS 1.2+) and at rest using industry-standard encryption. Key management follows documented procedures with restricted access.',
  },
  {
    keywords: ['incident', 'breach', 'security event', 'ir plan'],
    controlPatterns: [/incident/i, /breach/i, /A\.5\.24/i, /CC7/i],
    template:
      'We maintain a documented incident response plan with defined roles, escalation paths, and breach notification procedures aligned to regulatory requirements.',
  },
  {
    keywords: ['vendor', 'third party', 'subprocessor', 'supplier'],
    controlPatterns: [/vendor/i, /third/i, /CC9/i, /A\.5\.19/i],
    template:
      'Third-party vendors are assessed before onboarding, contractually bound to security requirements, and reviewed periodically based on risk tier.',
  },
  {
    keywords: ['backup', 'recovery', 'business continuity', 'disaster'],
    controlPatterns: [/backup/i, /continuity/i, /A\.5\.29/i, /A\.8\.13/i],
    template:
      'Business continuity and backup procedures are documented. Critical systems are backed up on a defined schedule with tested restore procedures.',
  },
  {
    keywords: ['vulnerability', 'patch', 'penetration', 'vapt', 'security testing'],
    controlPatterns: [/vulner/i, /patch/i, /A\.8\.8/i, /CC7\.1/i],
    template:
      'Vulnerability management includes regular scanning, prioritized patching, and periodic penetration testing for critical applications.',
  },
  {
    keywords: ['privacy', 'personal data', 'gdpr', 'dpdp', 'data protection', 'pdpl'],
    controlPatterns: [/privacy/i, /data_protection/i, /dpdp/i, /gdpr/i, /pdpl/i],
    template:
      'Personal data processing follows documented privacy policies with lawful basis, data subject rights processes, and breach notification procedures.',
  },
  {
    keywords: ['policy', 'security policy', 'information security'],
    controlPatterns: [/policy/i, /governance/i, /CC1/i, /A\.5\.1/i],
    template:
      'Information security policies are approved by leadership, communicated to personnel, and reviewed at least annually.',
  },
  {
    keywords: ['logging', 'monitoring', 'siem', 'audit log'],
    controlPatterns: [/log/i, /monitor/i, /A\.8\.15/i, /CC7\.2/i],
    template:
      'Security-relevant events are logged and monitored. Audit logs are protected from tampering and retained per policy.',
  },
  {
    keywords: ['training', 'awareness', 'phishing'],
    controlPatterns: [/training/i, /awareness/i, /A\.6\.3/i],
    template:
      'Security awareness training is provided to workforce members on hire and periodically thereafter, including phishing simulations.',
  },
];

function scoreControlMatch(
  question: string,
  controlTitle: string,
  controlDesc: string,
  approach: string
): number {
  const q = question.toLowerCase();
  let score = 0;
  const text = `${controlTitle} ${controlDesc} ${approach}`.toLowerCase();
  const words = q.split(/\W+/).filter((w) => w.length > 3);
  for (const word of words) {
    if (text.includes(word)) score += 2;
  }
  return score;
}

export async function generateQuestionnaireAnswers(
  questions: string[]
): Promise<{ organizationName: string; answers: QuestionnaireAnswer[] }> {
  const orgName = await getOrganizationName();
  const activatedIds = await getActivatedFrameworkIds();
  const controls = CONTROLS.filter((c) => activatedIds.includes(c.frameworkId));
  const complianceMap = await getControlComplianceBatch(controls.map((c) => c.id));

  const answers: QuestionnaireAnswer[] = [];

  for (const question of questions) {
    const qLower = question.toLowerCase();
    let matchedTemplate: (typeof KEYWORD_MAP)[0] | null = null;
    for (const entry of KEYWORD_MAP) {
      if (entry.keywords.some((k) => qLower.includes(k))) {
        matchedTemplate = entry;
        break;
      }
    }

    const scoredControls = controls
      .map((control) => {
        const compliance = complianceMap.get(control.id) ?? createDefaultCompliance(control.id);
        let score = scoreControlMatch(
          question,
          control.title,
          control.description,
          compliance.implementationApproach
        );
        if (matchedTemplate?.controlPatterns.some((p) => p.test(control.title + control.reference))) {
          score += 10;
        }
        if (compliance.implementationApproach.trim()) score += 5;
        if (compliance.evidenceNotes.trim()) score += 3;
        return { control, compliance, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (scoredControls.length === 0 && matchedTemplate) {
      answers.push({
        question,
        answer: `${matchedTemplate.template} [Draft — map to specific controls and evidence before submission.]`,
        confidence: 'low',
        sourceControlIds: [],
        sourceNotes: 'Template answer — no matching control narratives found',
      });
      continue;
    }

    if (scoredControls.length === 0) {
      answers.push({
        question,
        answer: 'Needs review — no matching control documentation found. Add implementation approach and evidence notes to relevant controls.',
        confidence: 'needs_review',
        sourceControlIds: [],
        sourceNotes: 'No match',
      });
      continue;
    }

    const primary = scoredControls[0];
    const approach = primary.compliance.implementationApproach.trim();
    const evidence = primary.compliance.evidenceNotes.trim();

    let answer: string;
    let confidence: QuestionnaireAnswer['confidence'];

    if (approach.length > 80) {
      answer = approach;
      if (evidence) answer += ` Evidence: ${evidence}`;
      confidence = evidence ? 'high' : 'medium';
    } else if (matchedTemplate) {
      answer = matchedTemplate.template;
      if (approach) answer += ` ${approach}`;
      confidence = approach ? 'medium' : 'low';
    } else {
      answer = `${primary.control.title}: ${primary.control.description}`;
      confidence = 'low';
    }

    answers.push({
      question,
      answer,
      confidence,
      sourceControlIds: scoredControls.map((s) => s.control.id),
      sourceNotes: scoredControls.map((s) => s.control.reference).join(', '),
    });
  }

  return { organizationName: orgName, answers };
}

