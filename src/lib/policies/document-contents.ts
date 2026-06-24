export interface TocEntry {
  level: 2 | 3;
  number: string;
  title: string;
}

const CONTENTS_HEADING_PATTERN = /^(?:table of )?contents$/i;

const EXCLUDED_HEADING_PATTERN =
  /^(?:document identification|document approval matrix)$/i;

function parseMarkdownHeading(
  line: string
): { level: number; text: string } | null {
  const match = line.match(/^(#{1,3})\s+(.+)$/);
  if (!match) return null;
  return { level: match[1].length, text: match[2].trim() };
}

function stripLeadingSectionNumber(text: string): string {
  return text.replace(/^\d+(?:\.\d+)*\s*[.:]?\s*/, '').trim();
}

export function isContentsHeading(text: string): boolean {
  return CONTENTS_HEADING_PATTERN.test(stripLeadingSectionNumber(text));
}

function isExcludedTocHeading(text: string): boolean {
  const normalized = stripLeadingSectionNumber(text);
  if (isContentsHeading(normalized)) return true;
  return EXCLUDED_HEADING_PATTERN.test(normalized);
}

export function parseSectionNumberAndTitle(text: string): {
  number: string;
  title: string;
} {
  const stepMatch = text.match(/^Step\s+(\d+):\s*(.+)$/i);
  if (stepMatch) {
    return { number: stepMatch[1], title: stepMatch[2].trim() };
  }

  const numberedMatch = text.match(/^(\d+(?:\.\d+)*)\s*[.:]?\s*(.+)$/);
  if (numberedMatch) {
    return { number: numberedMatch[1], title: numberedMatch[2].trim() };
  }

  return { number: '', title: text };
}

/** Extract H2/H3 headings suitable for a table of contents. */
export function extractTocEntries(markdown: string): TocEntry[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const entries: TocEntry[] = [];

  for (const line of lines) {
    const heading = parseMarkdownHeading(line);
    if (!heading || heading.level < 2 || heading.level > 3) continue;
    if (isExcludedTocHeading(heading.text)) continue;

    const { number, title } = parseSectionNumberAndTitle(heading.text);
    entries.push({
      level: heading.level as 2 | 3,
      number,
      title: title || heading.text,
    });
  }

  return entries;
}

export function hasContentsSection(markdown: string): boolean {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  for (const line of lines) {
    const heading = parseMarkdownHeading(line);
    if (heading?.level === 2 && isContentsHeading(heading.text)) {
      return true;
    }
  }
  return false;
}

export function buildContentsSectionMarkdown(
  entries: TocEntry[],
  options: { includePageColumn?: boolean } = {}
): string {
  const includePageColumn = options.includePageColumn ?? true;
  const lines = ['## Contents', ''];

  if (entries.length === 0) {
    lines.push('_No sections listed._', '');
    return lines.join('\n');
  }

  if (includePageColumn) {
    lines.push('| Section | Title | Page |', '|---------|-------|------|');
    for (const entry of entries) {
      const sectionCell = entry.number || (entry.level === 3 ? '•' : '—');
      lines.push(`| ${sectionCell} | ${entry.title} | — |`);
    }
  } else {
    lines.push('| Section | Title |', '|---------|-------|');
    for (const entry of entries) {
      const sectionCell = entry.number || (entry.level === 3 ? '•' : '—');
      lines.push(`| ${sectionCell} | ${entry.title} |`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

function findContentsInsertionLineIndex(lines: string[]): number {
  for (let i = 0; i < lines.length; i++) {
    const heading = parseMarkdownHeading(lines[i]);
    if (
      heading?.level === 2 &&
      /^document identification$/i.test(stripLeadingSectionNumber(heading.text))
    ) {
      let j = i + 1;
      while (j < lines.length) {
        const nextHeading = parseMarkdownHeading(lines[j]);
        if (nextHeading?.level === 2) return j;
        j++;
      }
      return lines.length;
    }
  }

  let start = 0;
  while (start < lines.length && !lines[start].trim()) start++;
  return start;
}

/** Insert a Contents section after document identification when missing. */
export function injectContentsIfMissing(markdown: string): string {
  const normalized = markdown.replace(/\r\n/g, '\n').trim();
  if (!normalized || hasContentsSection(normalized)) {
    return markdown;
  }

  const entries = extractTocEntries(normalized);
  if (entries.length === 0) return markdown;

  const contents = buildContentsSectionMarkdown(entries).trimEnd();
  const lines = normalized.split('\n');
  const insertAt = findContentsInsertionLineIndex(lines);

  const updated = [...lines.slice(0, insertAt), '', contents, '', ...lines.slice(insertAt)];
  return updated.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
