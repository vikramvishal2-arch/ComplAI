import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
  convertInchesToTwip,
} from 'docx';
import type { getPolicyById } from '@/lib/db/policy-repository';
import {
  formatApprovalMatrixMarkdown,
  parseApprovalMatrix,
} from '@/lib/policies/approval-matrix';
import { injectContentsIfMissing, isContentsHeading } from '@/lib/policies/document-contents';
import { stripEmbeddedApprovalMatrix } from '@/lib/policies/markdown-preview';
import {
  POLICY_BODY_SIZE_HALF_PT,
  POLICY_FONT,
  POLICY_FONT_FALLBACK,
  POLICY_HEADING_SIZES_HALF_PT,
} from '@/lib/policies/policy-styles';

export type PolicyRecord = NonNullable<Awaited<ReturnType<typeof getPolicyById>>>;

const FONT = POLICY_FONT;
const FONT_FALLBACK = POLICY_FONT_FALLBACK;
const BODY_SIZE = POLICY_BODY_SIZE_HALF_PT;

const HEADING_SIZES = POLICY_HEADING_SIZES_HALF_PT;

const PAGE_MARGINS = {
  top: convertInchesToTwip(1),
  right: convertInchesToTwip(1),
  bottom: convertInchesToTwip(1),
  left: convertInchesToTwip(1.25),
};

function run(text: string, opts: { bold?: boolean; italic?: boolean; size?: number } = {}): TextRun {
  return new TextRun({
    text,
    font: { ascii: FONT, hAnsi: FONT, cs: FONT, eastAsia: FONT_FALLBACK },
    size: opts.size ?? BODY_SIZE,
    bold: opts.bold,
    italics: opts.italic,
  });
}

function parseInlineRuns(text: string, size = BODY_SIZE): TextRun[] {
  const runs: TextRun[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      runs.push(run(boldMatch[1], { bold: true, size }));
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    const italicMatch = remaining.match(/^\*(.+?)\*/);
    if (italicMatch) {
      runs.push(run(italicMatch[1], { italic: true, size }));
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    const nextSpecial = remaining.search(/\*\*/);
    if (nextSpecial === -1) {
      if (remaining) runs.push(run(remaining, { size }));
      break;
    }

    if (nextSpecial > 0) {
      runs.push(run(remaining.slice(0, nextSpecial), { size }));
      remaining = remaining.slice(nextSpecial);
      continue;
    }

    runs.push(run(remaining[0], { size }));
    remaining = remaining.slice(1);
  }

  return runs.length > 0 ? runs : [run('', { size })];
}

function paragraphFromText(
  text: string,
  opts: {
    heading?: (typeof HeadingLevel)[keyof typeof HeadingLevel];
    size?: number;
    spacingAfter?: number;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
  } = {}
): Paragraph {
  const size = opts.size ?? BODY_SIZE;
  return new Paragraph({
    heading: opts.heading,
    alignment: opts.alignment,
    spacing: { after: opts.spacingAfter ?? 120, line: 276 },
    children: parseInlineRuns(text.trim(), size),
  });
}

function headingParagraph(level: number, text: string, isFirstTitle = false): Paragraph {
  const size = HEADING_SIZES[level] ?? BODY_SIZE;
  const headingLevel =
    level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3;

  return new Paragraph({
    heading: headingLevel,
    alignment: isFirstTitle ? AlignmentType.CENTER : undefined,
    spacing: { before: isFirstTitle ? 0 : level <= 2 ? 240 : 180, after: 120, line: 276 },
    children: [run(text.replace(/^\d+(\.\d+)*\s*/, ''), { bold: true, size })],
  });
}

function tableCell(
  text: string,
  isHeader: boolean,
  opts: { alignRight?: boolean } = {}
): TableCell {
  return new TableCell({
    shading: isHeader ? { fill: 'D9E2F3', type: ShadingType.CLEAR, color: 'auto' } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [
      new Paragraph({
        alignment: opts.alignRight ? AlignmentType.RIGHT : undefined,
        spacing: { after: 40, before: 40, line: 240 },
        children: parseInlineRuns(text.trim()),
      }),
    ],
  });
}

function markdownTableToDocx(rows: string[][], options: { contentsTable?: boolean } = {}): Table {
  const [header, ...body] = rows;
  const tableRows: TableRow[] = [];
  const pageColumnIndex =
    options.contentsTable && header ? header.findIndex((cell) => /^page$/i.test(cell.trim())) : -1;

  if (header?.length) {
    tableRows.push(
      new TableRow({
        tableHeader: true,
        children: header.map((cell, index) =>
          tableCell(cell, !options.contentsTable, {
            alignRight: index === pageColumnIndex,
          })
        ),
      })
    );
  }

  for (const row of body) {
    if (!row.some((cell) => cell.trim())) continue;
    tableRows.push(
      new TableRow({
        children: row.map((cell, index) =>
          tableCell(cell, false, {
            alignRight: index === pageColumnIndex,
          })
        ),
      })
    );
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'AAAAAA' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'AAAAAA' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'AAAAAA' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'AAAAAA' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    },
    rows: tableRows,
  });
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

export function markdownToDocxElements(markdown: string): (Paragraph | Table)[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const elements: (Paragraph | Table)[] = [];
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
      elements.push(new Paragraph({ spacing: { after: 120 } }));
      i++;
      continue;
    }

    const heading = isHeadingLine(line);
    if (heading) {
      const isFirstTitle = heading.level === 1 && !seenTitle;
      if (isFirstTitle) seenTitle = true;
      if (heading.level === 2) {
        inContentsSection = isContentsHeading(heading.text);
      }
      elements.push(headingParagraph(heading.level, heading.text, isFirstTitle));
      if (isFirstTitle) {
        elements.push(new Paragraph({ spacing: { after: 240 } }));
      }
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
        elements.push(markdownTableToDocx(tableRows, { contentsTable: inContentsSection }));
        elements.push(new Paragraph({ spacing: { after: 120 } }));
      }
      continue;
    }

    if (isBulletLine(line)) {
      const items: string[] = [];
      while (i < lines.length && isBulletLine(lines[i])) {
        items.push(bulletText(lines[i]));
        i++;
      }
      for (const item of items) {
        elements.push(
          new Paragraph({
            spacing: { after: 60, line: 276 },
            indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.15) },
            children: [run('• ', { size: BODY_SIZE }), ...parseInlineRuns(item)],
          })
        );
      }
      elements.push(new Paragraph({ spacing: { after: 80 } }));
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
    elements.push(paragraphFromText(paragraphLines.join(' ')));
  }

  return elements;
}

function stripLeadingTitle(content: string, title: string): string {
  const lines = content.split('\n');
  const first = lines[0]?.trim() ?? '';
  if (
    first.startsWith('# ') &&
    first.slice(2).trim().toLowerCase() === title.trim().toLowerCase()
  ) {
    let i = 1;
    while (i < lines.length && !lines[i].trim()) i++;
    return lines.slice(i).join('\n');
  }
  return content;
}

export function buildPolicyExportMarkdown(policy: PolicyRecord): string {
  const matrix = parseApprovalMatrix(policy.approvalMatrix);
  const body = injectContentsIfMissing(
    stripLeadingTitle(
      stripEmbeddedApprovalMatrix(policy.content.trim()),
      policy.title
    )
  );

  const lines = [
    `# ${policy.title}`,
    '',
    `| Field | Value |`,
    `|-------|-------|`,
    `| Version | ${policy.version} |`,
    `| Status | ${policy.status} |`,
    `| Owner | ${policy.owner || '—'} |`,
    `| ISO reference | ${policy.isoReference || '—'} |`,
    `| Document type | ${policy.documentType} |`,
    policy.reviewDate
      ? `| Review date | ${policy.reviewDate.toISOString().slice(0, 10)} |`
      : null,
    policy.approvedAt
      ? `| Approved | ${policy.approvedAt.toISOString().slice(0, 10)} |`
      : null,
    '',
    '---',
    '',
    body || '_No policy body content._',
    '',
    '---',
    '',
    formatApprovalMatrixMarkdown(matrix, policy.title),
  ];
  return lines.filter((line) => line !== null).join('\n');
}

export async function markdownToDocxBuffer(markdown: string): Promise<Buffer> {
  const children = markdownToDocxElements(markdown);

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT,
            size: BODY_SIZE,
          },
          paragraph: {
            spacing: { line: 276, after: 120 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: { margin: PAGE_MARGINS },
        },
        children,
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

export async function exportPolicyToDocxBuffer(policy: PolicyRecord): Promise<Buffer> {
  const markdown = buildPolicyExportMarkdown(policy);
  return markdownToDocxBuffer(markdown);
}

export function policyDocxFileName(title: string): string {
  const base =
    title
      .trim()
      .replace(/[^\w\s.-]/g, '')
      .replace(/\s+/g, ' ')
      .slice(0, 80) || 'policy';
  return `${base}.docx`;
}
