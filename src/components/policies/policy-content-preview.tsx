'use client';

import { useMemo } from 'react';
import {
  buildPolicyPreviewMarkdown,
  markdownToPreviewHtml,
  stripEmbeddedApprovalMatrix,
  type PolicyPreviewInput,
} from '@/lib/policies/markdown-preview';

interface PolicyContentPreviewProps extends PolicyPreviewInput {
  className?: string;
}

export function PolicyContentPreview(props: PolicyContentPreviewProps) {
  const { className, ...input } = props;

  const html = useMemo(() => {
    const markdown = buildPolicyPreviewMarkdown({
      ...input,
      content: stripEmbeddedApprovalMatrix(input.content),
    });
    return markdownToPreviewHtml(markdown);
  }, [
    input.title,
    input.content,
    input.version,
    input.status,
    input.owner,
    input.isoReference,
    input.documentType,
    input.reviewDate,
    input.approvedAt,
  ]);

  if (!input.content.trim() && !input.title.trim()) {
    return (
      <div className="px-8 py-12 text-center text-sm text-slate-500">
        No policy content yet. Switch to Edit content to add text.
      </div>
    );
  }

  return (
    <div
      className={className ?? 'policy-word-preview px-8 py-6'}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
