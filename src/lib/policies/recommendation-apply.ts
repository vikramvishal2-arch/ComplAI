import type { PolicyReviewRecommendation } from './policy-review-types';

export interface ApplyRecommendationResult {
  content: string;
  recommendation: PolicyReviewRecommendation;
}

function contentHasSection(content: string, heading: string): boolean {
  const normalized = content.toLowerCase();
  const h = heading.toLowerCase();
  return (
    normalized.includes(`## ${h}`) ||
    normalized.includes(`# ${h}`) ||
    normalized.includes(h)
  );
}

function appendSection(content: string, suggestedText: string, sectionHeading?: string): string {
  const trimmed = content.trim();
  const block = suggestedText.trim();

  if (sectionHeading && contentHasSection(trimmed, sectionHeading)) {
    return `${trimmed}\n\n${block}`;
  }

  if (!trimmed) return block;
  return `${trimmed}\n\n${block}`;
}

export function applyRecommendationToContent(
  content: string,
  recommendation: PolicyReviewRecommendation
): ApplyRecommendationResult {
  if (recommendation.status !== 'open') {
    throw new Error('Only open recommendations can be applied');
  }

  let nextContent = content;

  if (recommendation.suggestedText) {
    nextContent = appendSection(
      content,
      recommendation.suggestedText,
      recommendation.sectionHeading
    );
  }

  const applied: PolicyReviewRecommendation = {
    ...recommendation,
    status: 'applied',
    appliedAt: new Date().toISOString(),
  };

  return { content: nextContent, recommendation: applied };
}

export function dismissRecommendation(
  recommendation: PolicyReviewRecommendation
): PolicyReviewRecommendation {
  if (recommendation.status !== 'open') {
    throw new Error('Only open recommendations can be dismissed');
  }
  return { ...recommendation, status: 'dismissed' };
}
