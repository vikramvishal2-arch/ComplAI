import 'server-only';
import { completeChat } from '../ai/client';
import { getAiConfig } from '../ai/config';

export interface VendorQuestion {
  id: string;
  category: string;
  question: string;
  weight: number;
}

export interface VendorResponse {
  questionId: string;
  answer: string;
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
}): Promise<VendorQuestion[]> {
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

  const responseMap = Object.fromEntries(input.responses.map((r) => [r.questionId, r.answer]));
  const qaBlock = input.questions
    .map((q) => `Q (${q.category}, weight ${q.weight}): ${q.question}\nA: ${responseMap[q.id] || '(no answer)'}`)
    .join('\n\n');

  if (!ai.configured) {
    const answered = input.responses.filter((r) => r.answer.trim().length > 10).length;
    const ratio = answered / Math.max(input.questions.length, 1);
    const base = Math.round(100 - input.vendor.inherentRiskScore * 0.3);
    const score = Math.max(0, Math.min(100, Math.round(base * ratio)));
    return {
      score,
      summary: `Rule-based score (${answered}/${input.questions.length} substantive answers). Enable AI for deeper analysis.`,
      gaps:
        ratio < 0.7
          ? [{ area: 'Completeness', severity: 'medium', recommendation: 'Complete all questionnaire responses.' }]
          : [],
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
