import 'server-only';

import { completeChat } from '@/lib/ai/client';
import { getAiConfig } from '@/lib/ai/config';
import { buildControlContext } from '@/lib/ai/context';
import { EVIDENCE_VALIDATION_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { getControlById } from '@/lib/data/controls';
import { DOMAIN_LABELS, type Control, type EvidenceContext } from '@/lib/types';
import { extractTextFromBuffer, canExtractPolicyText } from '@/lib/policies/extract-policy-text';
import { readEvidenceFile } from '@/lib/evidence/storage';
import { getControlEvidenceById } from '@/lib/store';
import { buildControlComplianceGuidance } from '@/lib/controls/compliance-recommendations';

export type EvidenceVerdict = 'strong' | 'acceptable' | 'weak' | 'mismatched';
export type EvidenceAction = 'keep' | 'replace' | 'supplement';

export type EvidenceRecommendedUpload = {
  title: string;
  why: string;
  examples: string;
};

export type EvidenceValidationResult = {
  verdict: EvidenceVerdict;
  score: number;
  summary: string;
  reasons: string[];
  gaps: string[];
  recommendedUploads: EvidenceRecommendedUpload[];
  action: EvidenceAction;
  source: 'ai' | 'rules';
  contentInspected: boolean;
};

type ValidateInput = {
  controlId: string;
  context: EvidenceContext;
  originalName: string;
  mimeType: string;
  description?: string;
  extractedText?: string;
  contentInspected?: boolean;
};

function clampScore(value: number): number {
  if (Number.isNaN(value)) return 40;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function parseJsonPayload(raw: string): Partial<EvidenceValidationResult> | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? raw.trim();
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as Partial<EvidenceValidationResult>;
  } catch {
    return null;
  }
}

function normalizeResult(
  partial: Partial<EvidenceValidationResult>,
  source: 'ai' | 'rules',
  contentInspected: boolean
): EvidenceValidationResult {
  const verdict =
    partial.verdict === 'strong' ||
    partial.verdict === 'acceptable' ||
    partial.verdict === 'weak' ||
    partial.verdict === 'mismatched'
      ? partial.verdict
      : 'weak';

  const action =
    partial.action === 'keep' || partial.action === 'replace' || partial.action === 'supplement'
      ? partial.action
      : verdict === 'strong' || verdict === 'acceptable'
        ? 'keep'
        : verdict === 'mismatched'
          ? 'replace'
          : 'supplement';

  return {
    verdict,
    score: clampScore(typeof partial.score === 'number' ? partial.score : 50),
    summary: partial.summary?.trim() || 'Evidence review completed.',
    reasons: Array.isArray(partial.reasons) ? partial.reasons.map(String).filter(Boolean) : [],
    gaps: Array.isArray(partial.gaps) ? partial.gaps.map(String).filter(Boolean) : [],
    recommendedUploads: Array.isArray(partial.recommendedUploads)
      ? partial.recommendedUploads
          .map((item) => ({
            title: String((item as EvidenceRecommendedUpload).title ?? '').trim(),
            why: String((item as EvidenceRecommendedUpload).why ?? '').trim(),
            examples: String((item as EvidenceRecommendedUpload).examples ?? '').trim(),
          }))
          .filter((item) => item.title)
      : [],
    action,
    source,
    contentInspected,
  };
}

function keywordHits(haystack: string, needles: string[]): number {
  const lower = haystack.toLowerCase();
  return needles.filter((n) => n && lower.includes(n.toLowerCase())).length;
}

function ruleBasedValidation(control: Control, input: ValidateInput): EvidenceValidationResult {
  const guidance = buildControlComplianceGuidance(control);
  const blob = [
    input.originalName,
    input.mimeType,
    input.description ?? '',
    input.extractedText?.slice(0, 2000) ?? '',
    control.title,
    control.reference,
    control.domain,
  ].join(' ');

  const domainWords = DOMAIN_LABELS[control.domain].toLowerCase().split(/\s+/);
  const titleWords = control.title
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3)
    .slice(0, 8);

  const hits = keywordHits(blob, [...domainWords, ...titleWords, control.reference.toLowerCase()]);
  const hasDescription = Boolean(input.description?.trim());
  const contentInspected = Boolean(input.contentInspected && input.extractedText?.trim());

  let score = 35 + hits * 8;
  if (hasDescription) score += 10;
  if (contentInspected) score += 15;
  if (input.mimeType.includes('pdf') || input.originalName.toLowerCase().endsWith('.pdf')) score += 5;
  if (input.originalName.toLowerCase().includes('screenshot') && control.domain === 'governance') {
    score -= 10;
  }

  score = clampScore(score);

  let verdict: EvidenceVerdict = 'weak';
  if (score >= 75) verdict = 'strong';
  else if (score >= 55) verdict = 'acceptable';
  else if (hits === 0 && score < 45) verdict = 'mismatched';

  const recommendedUploads = guidance.evidence.slice(0, 4).map((title) => ({
    title,
    why: `Supports ${control.reference} (${DOMAIN_LABELS[control.domain]}) for ${input.context} evidence.`,
    examples: 'PDF export, signed report, ticket screenshot with date, or policy excerpt',
  }));

  return normalizeResult(
    {
      verdict,
      score,
      summary:
        verdict === 'strong'
          ? 'This file looks aligned with the control based on name, description, and domain signals.'
          : verdict === 'acceptable'
            ? 'This file may be usable, but stronger operating evidence is recommended.'
            : verdict === 'mismatched'
              ? 'This file does not appear to match the control. Upload a more relevant artifact.'
              : 'This file is weak as standalone evidence. Supplement with stronger artifacts.',
      reasons: [
        hits > 0
          ? `Filename/description matches ${hits} control/domain keyword(s).`
          : 'Little keyword overlap with the control title or domain.',
        hasDescription
          ? 'Upload description is present.'
          : 'No description provided — auditors prefer labeled evidence.',
        contentInspected
          ? 'Readable text content was inspected.'
          : 'File content could not be fully inspected (binary/image/PDF without text extraction).',
      ],
      gaps:
        verdict === 'strong'
          ? []
          : [
              'Add dated operating evidence for the current audit period',
              'Include owner/approver identity where applicable',
              ...guidance.evidence.slice(0, 2),
            ],
      recommendedUploads,
      action: verdict === 'mismatched' ? 'replace' : verdict === 'strong' ? 'keep' : 'supplement',
    },
    'rules',
    contentInspected
  );
}

async function aiValidation(control: Control, input: ValidateInput): Promise<EvidenceValidationResult> {
  const controlContext = await buildControlContext(input.controlId);
  const contentInspected = Boolean(input.contentInspected && input.extractedText?.trim());
  const textSnippet = (input.extractedText ?? '').slice(0, 6000);

  const userPrompt = [
    controlContext,
    '',
    `Evidence context tab: ${input.context}`,
    `Filename: ${input.originalName}`,
    `MIME type: ${input.mimeType}`,
    `Uploader description: ${input.description?.trim() || '(none)'}`,
    contentInspected
      ? `Extracted file text (truncated):\n${textSnippet}`
      : 'Extracted file text: (not available — judge from metadata only)',
    '',
    'Evaluate whether this evidence is correct/sufficient for this control and recommend better uploads if needed.',
  ].join('\n');

  const raw = await completeChat([
    { role: 'system', content: EVIDENCE_VALIDATION_SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ]);

  const parsed = parseJsonPayload(raw);
  if (!parsed) {
    return ruleBasedValidation(control, input);
  }
  return normalizeResult(parsed, 'ai', contentInspected);
}

export async function validateEvidenceArtifact(
  input: ValidateInput
): Promise<EvidenceValidationResult> {
  const control = getControlById(input.controlId);
  if (!control) {
    throw new Error('Control not found');
  }

  const ai = getAiConfig();
  if (ai.configured) {
    try {
      return await aiValidation(control, input);
    } catch (error) {
      console.warn('AI evidence validation failed; using rules fallback', error);
    }
  }

  return ruleBasedValidation(control, input);
}

export async function validateStoredControlEvidence(
  controlId: string,
  evidenceId: string
): Promise<EvidenceValidationResult> {
  const evidence = await getControlEvidenceById(evidenceId);
  if (!evidence || evidence.controlId !== controlId) {
    throw new Error('Evidence not found');
  }

  let extractedText = '';
  let contentInspected = false;
  try {
    if (canExtractPolicyText(evidence.originalName, evidence.mimeType)) {
      const buffer = await readEvidenceFile(evidence.storagePath);
      extractedText = await extractTextFromBuffer(buffer, evidence.originalName, evidence.mimeType);
      contentInspected = extractedText.trim().length > 0;
    }
  } catch (error) {
    console.warn('Evidence text extraction failed', error);
  }

  return validateEvidenceArtifact({
    controlId,
    context: evidence.context as EvidenceContext,
    originalName: evidence.originalName,
    mimeType: evidence.mimeType,
    description: evidence.description,
    extractedText,
    contentInspected,
  });
}

/** Lightweight TPRM answer/evidence guidance check (text, not file). */
export async function validateTprmEvidenceAnswer(input: {
  question: string;
  answer: string;
  evidenceGuidance?: string;
  controlRefs?: string[];
}): Promise<EvidenceValidationResult> {
  const guidance = input.evidenceGuidance?.trim() || 'Provide supporting evidence for this questionnaire item.';
  const answer = input.answer.trim();
  const blob = `${answer} ${guidance} ${(input.controlRefs ?? []).join(' ')}`.toLowerCase();

  const hasAnswer = answer.length >= 20;
  const mentionsEvidence =
    /attach|upload|policy|report|screenshot|certificate|soc|iso|ticket|log|export/i.test(answer);
  const guidanceWords = guidance
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 4)
    .slice(0, 10);
  const hits = keywordHits(blob, guidanceWords);

  let score = (hasAnswer ? 40 : 15) + hits * 6 + (mentionsEvidence ? 15 : 0);
  score = clampScore(score);

  const verdict: EvidenceVerdict =
    score >= 75 ? 'strong' : score >= 55 ? 'acceptable' : hits === 0 ? 'mismatched' : 'weak';

  const recommendedUploads: EvidenceRecommendedUpload[] = [
    {
      title: guidance,
      why: 'Matches the questionnaire evidence guidance for this item.',
      examples: 'PDF, signed attestation, ticket export, or configuration screenshot',
    },
  ];

  if (input.controlRefs?.length) {
    recommendedUploads.push({
      title: `Artifacts mapped to ${input.controlRefs.join(', ')}`,
      why: 'Supports linked framework controls referenced by this question.',
      examples: 'Control operating evidence from the same period',
    });
  }

  const base = normalizeResult(
    {
      verdict,
      score,
      summary:
        verdict === 'strong'
          ? 'Answer and evidence intent look aligned with the questionnaire guidance.'
          : 'Answer may be incomplete for audit use — upload or cite stronger supporting evidence.',
      reasons: [
        hasAnswer ? 'Answer has substantive text.' : 'Answer is too short for audit use.',
        mentionsEvidence
          ? 'Answer references evidence artifacts.'
          : 'Answer does not clearly reference supporting evidence.',
        hits > 0
          ? `Answer overlaps ${hits} guidance keyword(s).`
          : 'Little overlap with the expected evidence guidance.',
      ],
      gaps: verdict === 'strong' ? [] : [guidance, 'Include date, owner, and system/scope covered'],
      recommendedUploads,
      action: verdict === 'mismatched' ? 'replace' : verdict === 'strong' ? 'keep' : 'supplement',
    },
    'rules',
    false
  );

  const ai = getAiConfig();
  if (!ai.configured) return base;

  try {
    const raw = await completeChat([
      { role: 'system', content: EVIDENCE_VALIDATION_SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          `TPRM questionnaire item: ${input.question}`,
          `Expected evidence guidance: ${guidance}`,
          `Linked controls: ${(input.controlRefs ?? []).join(', ') || 'none'}`,
          `Vendor answer: ${answer || '(empty)'}`,
          'Evaluate whether the answer/evidence approach is correct and recommend what to upload.',
        ].join('\n'),
      },
    ]);
    const parsed = parseJsonPayload(raw);
    if (parsed) return normalizeResult(parsed, 'ai', false);
  } catch (error) {
    console.warn('AI TPRM evidence validation failed; using rules', error);
  }

  return base;
}
