import { injectContentsIfMissing, isContentsHeading } from '@/lib/policies/document-contents';
import {
  POLICY_FONT_SIZES,
} from '@/lib/policies/policy-styles';

export interface PolicyPreviewInput {
  title: string;
  content: string;
  version: string;
  status: string;
  owner: string;
  isoReference: string;
  documentType: string;
  reviewDate?: Date | string | null;
  approvedAt?: Date | string | null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatInlineHtml(text: string): string {
  let html = escapeHtml(text);
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  return html;
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  return /^\|?[\s:-]+\|[\s|:-]+\|?$/.test(line.trim());
}

function isTableRow(line: string): boolean {
  return line.trim().startsWith('|') && line.trim().endsWith('|');
}

function isBulletLine(line: string): boolean {
  return /^[-*]\s+/.test(line.trim());
}

function bulletText(line: string): string {
  return line.trim().replace(/^[-*]\s+/, '');
}

function isHeadingLine(line: string): { level: number; text: string } | null {
  const match = line.match(/^(#{1,3})\s+(.+)$/);
  if (!match) return null;
  return { level: match[1].length, text: match[2].trim() };
}

function headingTag(level: number): 'h1' | 'h2' | 'h3' {
  if (level === 1) return 'h1';
  if (level === 2) return 'h2';
  return 'h3';
}

function stripHeadingNumber(text: string): string {
  return text.replace(/^\d+(\.\d+)*\s*/, '');
}

function renderTable(rows: string[][], className?: string): string {
  const [header, ...body] = rows;
  if (!header?.length) return '';

  const tableClass = className ? ` class="${className}"` : '';
  const thead = `<thead><tr>${header
    .map((cell) => `<th>${formatInlineHtml(cell)}</th>`)
    .join('')}</tr></thead>`;

  const tbodyRows = body
    .filter((row) => row.some((cell) => cell.trim()))
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${formatInlineHtml(cell)}</td>`).join('')}</tr>`
    )
    .join('');

  return `<table${tableClass}>${thead}<tbody>${tbodyRows}</tbody></table>`;
}

/** Convert policy markdown to HTML with Word-matching structure. */
export function markdownToPreviewHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const parts: string[] = [];
  let i = 0;
  let seenTitle = false;
  let inContentsSection = false;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    if (trimmed === '---') {
      parts.push('<hr />');
      i++;
      continue;
    }

    const heading = isHeadingLine(line);
    if (heading) {
      const tag = headingTag(heading.level);
      const text = stripHeadingNumber(heading.text);
      const isFirstTitle = heading.level === 1 && !seenTitle;
      if (isFirstTitle) seenTitle = true;
      if (heading.level === 2) {
        inContentsSection = isContentsHeading(heading.text);
      }
      const className = isFirstTitle ? ' class="policy-title"' : '';
      parts.push(`<${tag}${className}>${formatInlineHtml(text)}</${tag}>`);
      i++;
      continue;
    }

    if (isTableRow(line)) {
      const tableRows: string[][] = [];
      while (i < lines.length && isTableRow(lines[i])) {
        if (!isTableSeparator(lines[i])) {
          tableRows.push(parseTableRow(lines[i]));
        }
        i++;
      }
      if (tableRows.length > 0) {
        parts.push(
          renderTable(
            tableRows,
            inContentsSection ? 'policy-contents-table' : undefined
          )
        );
      }
      continue;
    }

    if (isBulletLine(line)) {
      const items: string[] = [];
      while (i < lines.length && isBulletLine(lines[i])) {
        items.push(bulletText(lines[i]));
        i++;
      }
      parts.push(
        `<ul>${items.map((item) => `<li>${formatInlineHtml(item)}</li>`).join('')}</ul>`
      );
      continue;
    }

    const paragraphLines: string[] = [trimmed];
    i++;
    while (i < lines.length) {
      const next = lines[i].trim();
      if (
        !next ||
        isHeadingLine(lines[i]) ||
        isTableRow(lines[i]) ||
        isBulletLine(lines[i]) ||
        next === '---'
      ) {
        break;
      }
      paragraphLines.push(next);
      i++;
    }
    parts.push(`<p>${formatInlineHtml(paragraphLines.join(' '))}</p>`);
  }

  return parts.join('\n');
}

function stripLeadingTitle(content: string, title: string): string {
  const lines = content.split('\n');
  const first = lines[0]?.trim() ?? '';
  if (
    first.startsWith('# ') &&
    first.slice(2).trim().toLowerCase() === title.trim().toLowerCase()
  ) {
    let idx = 1;
    while (idx < lines.length && !lines[idx].trim()) idx++;
    return lines.slice(idx).join('\n');
  }
  return content;
}

/** Remove download-only approval matrix if embedded in stored content. */
export function stripEmbeddedApprovalMatrix(content: string): string {
  const marker = '## Document approval matrix';
  const idx = content.indexOf(marker);
  if (idx === -1) return content;

  let trimmed = content.slice(0, idx).replace(/\s+$/, '');
  if (trimmed.endsWith('---')) {
    trimmed = trimmed.slice(0, -3).replace(/\s+$/, '');
  }
  return trimmed;
}

function formatDate(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const str = String(value).trim();
  if (!str) return null;
  return str.length >= 10 ? str.slice(0, 10) : str;
}

/** Build preview markdown matching Word export, excluding the approval matrix section. */
export function buildPolicyPreviewMarkdown(input: PolicyPreviewInput): string {
  const body = injectContentsIfMissing(
    stripLeadingTitle(
      stripEmbeddedApprovalMatrix(input.content.trim()),
      input.title
    )
  );

  const reviewDate = formatDate(input.reviewDate);
  const approvedAt = formatDate(input.approvedAt);

  const lines = [
    `# ${input.title}`,
    '',
    `| Field | Value |`,
    `|-------|-------|`,
    `| Version | ${input.version} |`,
    `| Status | ${input.status} |`,
    `| Owner | ${input.owner || '—'} |`,
    `| ISO reference | ${input.isoReference || '—'} |`,
    `| Document type | ${input.documentType} |`,
    reviewDate ? `| Review date | ${reviewDate} |` : null,
    approvedAt ? `| Approved | ${approvedAt} |` : null,
    '',
    '---',
    '',
    body || '_No policy body content._',
  ];

  return lines.filter((line) => line !== null).join('\n');
}

export { POLICY_FONT_SIZES };
