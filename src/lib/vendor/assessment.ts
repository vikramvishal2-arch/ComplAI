import 'server-only';
import { completeChat } from '../ai/client';
import { getAiConfig } from '../ai/config';
import { getPredefinedVendorAssessmentQuestions } from '../data/vendor-assessment-controls';

export interface VendorQuestion {
  id: string;
  category: string;
  checklistLabel?: string;
  question: string;
  weight: number;
  controlIds?: string[];
  controlRefs?: string[];
  evidenceGuidance?: string;
}

export type ChecklistResponseStatus = 'yes' | 'partial' | 'no' | 'na';

export interface VendorResponse {
  questionId: string;
  answer: string;
  status?: ChecklistResponseStatus;
}

export interface VendorAssessmentResult {
  score: number;
  summary: string;
  gaps: { area: string; severity: string; recommendation: string }[];
}

export function parseVendorQuestions(value: unknown): VendorQuestion[] {
  if (!Array.isArray(value)) return [];
  return value as unknown as VendorQuestion[];
}

export function parseVendorResponses(value: unknown): VendorResponse[] {
  if (!Array.isArray(value)) return [];
  return value as unknown as VendorResponse[];
}

const FALLBACK_QUESTIONS: VendorQuestion[] = [
  {
    id: 'q1',
    category: 'Security',
    question: 'Does the vendor maintain SOC 2 Type II or ISO 27001 certification?',
    weight: 10,
  },
  {
    id: 'q2',
    category: 'Security',
    question: 'How is customer data encrypted at rest and in transit?',
    weight: 10,
  },
  {
    id: 'q3',
    category: 'Privacy',
    question: 'Does the vendor process personal data on your behalf? If so, is a DPA in place?',
    weight: 8,
  },
  {
    id: 'q4',
    category: 'Access',
    question: 'How does the vendor enforce MFA and least-privilege access for their staff?',
    weight: 8,
  },
  {
    id: 'q5',
    category: 'Incident',
    question: 'What is the vendor incident notification SLA?',
    weight: 7,
  },
  {
    id: 'q6',
    category: 'BCP',
    question: 'Does the vendor maintain tested business continuity and disaster recovery plans?',
    weight: 6,
  },
  {
    id: 'q7',
    category: 'Subprocessors',
    question: 'Are subprocessors disclosed and assessed?',
    weight: 5,
  },
  {
    id: 'q8',
    category: 'AI',
    question: 'If the vendor uses AI, how is model training data scoped and are outputs logged?',
    weight: 6,
  },
];

function extractJson<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) throw new Error('AI response did not contain JSON');
  return JSON.parse(match[0]) as T;
}

export async function generateVendorQuestions(vendor: {
  name: string;
  description: string;
  tier: string;
  dataAccess: string;
  templateId?: string;
}): Promise<VendorQuestion[]> {
  const predefined = getPredefinedVendorAssessmentQuestions({
    tier: vendor.tier,
    dataAccess: vendor.dataAccess,
    templateId: vendor.templateId,
  });
  if (predefined.length > 0) {
    return predefined;
  }

  const ai = getAiConfig();
  if (!ai.configured) {
    return FALLBACK_QUESTIONS;
  }

  const prompt = `Generate a vendor security questionnaire as JSON array for third-party risk assessment.
Vendor: ${vendor.name}
Description: ${vendor.description || 'N/A'}
Tier: ${vendor.tier}
Data access: ${vendor.dataAccess}

Return ONLY a JSON array of 8 objects with keys: id (q1-q8), category, question, weight (1-10).
Focus on SOC2/ISO27001/GDPR-relevant topics including AI/data handling if applicable.`;

  try {
    const raw = await completeChat([
      { role: 'system', content: 'You are a TPRM analyst. Output valid JSON only.' },
      { role: 'user', content: prompt },
    ]);
    const parsed = extractJson<VendorQuestion[]>(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return FALLBACK_QUESTIONS;
    return parsed.map((q, i) => ({
      id: q.id || `q${i + 1}`,
      category: q.category || 'General',
      question: q.question,
      weight: Math.min(10, Math.max(1, Number(q.weight) || 5)),
    }));
  } catch {
    return FALLBACK_QUESTIONS;
  }
}

export async function scoreVendorAssessment(input: {
  vendor: { name: string; tier: string; dataAccess: string; inherentRiskScore: number };
  questions: VendorQuestion[];
  responses: VendorResponse[];
}): Promise<VendorAssessmentResult> {
  const ai = getAiConfig();

  const responseById = Object.fromEntries(input.responses.map((r) => [r.questionId, r]));
  const qaBlock = input.questions
    .map((q) => {
      const r = responseById[q.id];
      const status = r?.status ?? 'pending';
      const notes = r?.answer?.trim() || '(no notes)';
      return `Q (${q.category}, weight ${q.weight}): ${q.question}\nStatus: ${status}\nNotes: ${notes}`;
    })
    .join('\n\n');

  if (!ai.configured) {
    const gaps: VendorAssessmentResult['gaps'] = [];
    let weightedScore = 0;
    let totalWeight = 0;

    for (const q of input.questions) {
      const r = responseById[q.id];
      const status = r?.status;
      const weight = q.weight;

      if (status === 'na') continue;

      totalWeight += weight;
      if (status === 'yes') {
        weightedScore += weight;
      } else if (status === 'partial') {
        weightedScore += weight * 0.5;
      }

      if (!status || status === 'no' || status === 'partial') {
        const controlLabel = q.controlRefs?.length ? q.controlRefs.join(', ') : q.category;
        const label = q.checklistLabel ?? q.question;
        gaps.push({
          area: `${label} (${controlLabel})`,
          severity:
            status === 'no' || !status
              ? q.weight >= 9
                ? 'high'
                : q.weight >= 7
                  ? 'medium'
                  : 'low'
              : 'medium',
          recommendation:
            status === 'partial'
              ? `Remediate partial compliance: ${q.evidenceGuidance ?? q.question}`
              : `Address gap — ${q.evidenceGuidance ?? q.question}`,
        });
      }
    }

    const ratio = totalWeight > 0 ? weightedScore / totalWeight : 0;
    const base = Math.round(100 - input.vendor.inherentRiskScore * 0.3);
    const score = Math.max(0, Math.min(100, Math.round(base * ratio)));
    const answered = input.responses.filter((r) => r.status && r.status !== 'na').length;
    const applicable = input.questions.filter((q) => responseById[q.id]?.status !== 'na').length;

    return {
      score,
      summary: `TPRM checklist score (${answered}/${applicable} controls rated). Mapped to ISO 27001 A.5.19–A.5.23 and SOC 2 CC9.x.`,
      gaps,
    };
  }

  const prompt = `Score this vendor risk assessment 0-100 (100 = low risk).
Vendor: ${input.vendor.name}, tier: ${input.vendor.tier}, data access: ${input.vendor.dataAccess}, inherent score: ${input.vendor.inherentRiskScore}

${qaBlock}

Return ONLY JSON: {"score": number, "summary": "2-3 sentences", "gaps": [{"area":"","severity":"low|medium|high","recommendation":""}]}`;

  const raw = await completeChat([
    { role: 'system', content: 'You are a vendor risk assessor. Output valid JSON only.' },
    { role: 'user', content: prompt },
  ]);

  const parsed = extractJson<VendorAssessmentResult>(raw);
  return {
    score: Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 50))),
    summary: parsed.summary || 'Assessment complete.',
    gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
  };
}
