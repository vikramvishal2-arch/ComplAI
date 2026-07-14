import type { EvidenceBriefcaseItem, EvidenceBriefcaseSearchResult } from './briefcase-types';

const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'for',
  'of',
  'to',
  'in',
  'on',
  'at',
  'by',
  'with',
  'from',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'that',
  'this',
  'which',
  'what',
  'when',
  'where',
  'who',
  'how',
  'all',
  'any',
  'can',
  'could',
  'should',
  'would',
  'please',
  'provide',
  'show',
  'find',
  'give',
  'get',
  'me',
  'need',
  'required',
  'related',
  'about',
  'closure',
  'closing',
  'closed',
]);

const SYNONYMS: Record<string, string[]> = {
  mfa: ['multifactor', 'multi-factor', 'multi', 'factor', 'authentication', '2fa', 'iam', 'identity'],
  privileged: ['pam', 'admin', 'administrator', 'root'],
  vendor: ['third-party', 'third', 'party', 'tprm', 'supplier'],
  audit: ['auditor', 'fieldwork', 'engagement', 'soc'],
  risk: ['threat', 'vulnerability', 'register'],
  policy: ['procedure', 'standard', 'isms'],
  remediation: ['remediated', 'fixed', 'resolved', 'closed'],
  access: ['iam', 'identity', 'provisioning', 'recertification'],
  upload: ['uploaded', 'uploads', 'file', 'files', 'attachment', 'attachments', 'document', 'documents'],
  evidence: ['artifact', 'artifacts', 'proof', 'supporting'],
};

function isUploadedFile(item: EvidenceBriefcaseItem): boolean {
  return (
    item.id.startsWith('control-file-') ||
    item.tags.some((tag) => tag.toLowerCase() === 'upload')
  );
}

function sortByRecency(items: EvidenceBriefcaseItem[]): EvidenceBriefcaseItem[] {
  return [...items].sort((a, b) => {
    const aTime = a.recordedAt ? Date.parse(a.recordedAt) : 0;
    const bTime = b.recordedAt ? Date.parse(b.recordedAt) : 0;
    return bTime - aTime;
  });
}

export function extractSearchKeywords(query: string): string[] {
  const tokens = query
    .toLowerCase()
    .replace(/[^\w\s./-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));

  const expanded = new Set<string>();
  for (const token of tokens) {
    expanded.add(token);
    const syns = SYNONYMS[token];
    if (syns) syns.forEach((s) => expanded.add(s));
    for (const [key, values] of Object.entries(SYNONYMS)) {
      if (values.includes(token)) {
        expanded.add(key);
        values.forEach((s) => expanded.add(s));
      }
    }
  }

  return [...expanded];
}

function scoreItem(item: EvidenceBriefcaseItem, keywords: string[]): number {
  if (keywords.length === 0) return 0;

  const haystack = item.searchableText;
  let score = 0;

  for (const keyword of keywords) {
    if (!haystack.includes(keyword)) continue;

    if (item.controlRef?.toLowerCase().includes(keyword)) score += 8;
    if (item.title.toLowerCase().includes(keyword)) score += 5;
    if (item.tags.some((t) => t.toLowerCase().includes(keyword))) score += 4;
    if (item.summary.toLowerCase().includes(keyword)) score += 3;
    score += keyword.length > 5 ? 2 : 1;
  }

  if (keywords.some((k) => ['mfa', 'multifactor', 'authentication', 'iam'].includes(k))) {
    if (haystack.includes('mfa') || haystack.includes('multi-factor') || haystack.includes('authentication')) {
      score += 4;
    }
  }

  if (keywords.some((k) => ['upload', 'uploaded', 'file', 'files', 'attachment'].includes(k))) {
    if (isUploadedFile(item)) score += 10;
  }

  if (keywords.some((k) => ['closure', 'closed', 'remediated', 'accepted', 'complete'].includes(k))) {
    if (
      item.status &&
      ['closed', 'remediated', 'accepted', 'submitted', 'audit_ready', 'complete'].includes(
        item.status.toLowerCase()
      )
    ) {
      score += 3;
    }
  }

  return score;
}

function wantsUploadedFiles(query: string, keywords: string[]): boolean {
  const lower = query.toLowerCase();
  if (/\b(upload|uploaded|uploads|attachment|attachments)\b/.test(lower)) return true;
  return keywords.some((k) =>
    ['upload', 'uploaded', 'uploads', 'file', 'files', 'attachment', 'attachments'].includes(k)
  );
}

export function searchEvidenceBriefcase(
  items: EvidenceBriefcaseItem[],
  query: string,
  limit = 25
): EvidenceBriefcaseSearchResult {
  const trimmed = query.trim();
  const keywords = extractSearchKeywords(trimmed);
  const listUploads = wantsUploadedFiles(trimmed, keywords);

  // Empty / generic queries → show recent uploaded files first, then other recent items
  if (keywords.length === 0 || /^(list|browse|recent|all)(\s+evidence)?$/i.test(trimmed)) {
    const uploads = sortByRecency(items.filter(isUploadedFile)).slice(0, limit);
    const pool = uploads.length > 0 ? uploads : sortByRecency(items).slice(0, limit);
    return {
      query: trimmed,
      keywords: uploads.length > 0 ? ['upload'] : [],
      total: pool.length,
      items: pool,
      reply:
        uploads.length > 0
          ? `Showing ${uploads.length} uploaded evidence file${uploads.length === 1 ? '' : 's'} (most recent first).`
          : pool.length > 0
            ? `No uploaded files yet. Showing ${pool.length} other evidence records from notes, policies, and audits.`
            : 'No evidence records found yet. Upload files from a control detail page to see them here.',
    };
  }

  let ranked = items
    .map((item) => ({ item, score: scoreItem(item, keywords) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((row) => row.item);

  if (listUploads) {
    const uploads = ranked.filter(isUploadedFile);
    ranked = uploads.length > 0 ? uploads : sortByRecency(items.filter(isUploadedFile));
  }

  ranked = ranked.slice(0, limit);

  const reply =
    ranked.length > 0
      ? listUploads
        ? `Found ${ranked.length} uploaded evidence file${ranked.length === 1 ? '' : 's'} matching "${trimmed}".`
        : `Found ${ranked.length} evidence item${ranked.length === 1 ? '' : 's'} matching "${trimmed}". Top results include controls, policies, audit requests, TPRM responses, and uploaded files across your GRC program.`
      : listUploads
        ? `No uploaded evidence files matched "${trimmed}". Upload files from a control's Compliance, Remediation, or Issues tab.`
        : `No evidence matched "${trimmed}". Try "uploaded evidence", a control reference (e.g. CC6.7), or topics like MFA or vendor.`;

  return {
    query: trimmed,
    keywords,
    total: ranked.length,
    items: ranked,
    reply,
  };
}
