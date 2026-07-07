export type ImportResponseStatus = 'yes' | 'partial' | 'no' | 'na';

export interface ImportColumnMap {
  questionCol: string | null;
  answerCol: string | null;
  statusCol: string | null;
  idCol: string | null;
}

export interface ParsedImportRow {
  rowIndex: number;
  questionText: string;
  answerText: string;
  statusText: string;
  idText: string;
  raw: Record<string, string>;
}

export interface ImportMatchResult {
  rowIndex: number;
  questionId: string | null;
  questionText: string;
  uploadedQuestion: string;
  answer: string;
  status: ImportResponseStatus | '';
  matchConfidence: 'id' | 'exact' | 'fuzzy' | 'none';
}

export interface QuestionnaireImportPreview {
  headers: string[];
  columnMap: ImportColumnMap;
  rows: ParsedImportRow[];
  matches: ImportMatchResult[];
  matchedCount: number;
  unmatchedCount: number;
}

export interface ImportableQuestion {
  id: string;
  question: string;
  checklistLabel?: string;
}

const QUESTION_HEADER_PATTERNS = [
  /^question$/i,
  /^questions$/i,
  /^control$/i,
  /^requirement$/i,
  /^item$/i,
  /^query$/i,
  /^prompt$/i,
  /^checklist$/i,
  /^description$/i,
  /question/i,
  /control/i,
  /requirement/i,
];

const ANSWER_HEADER_PATTERNS = [
  /^answer$/i,
  /^answers$/i,
  /^response$/i,
  /^responses$/i,
  /^reply$/i,
  /^value$/i,
  /^vendor\s*response$/i,
  /^comment$/i,
  /^comments$/i,
  /^notes$/i,
  /answer/i,
  /response/i,
];

const STATUS_HEADER_PATTERNS = [
  /^status$/i,
  /^compliance$/i,
  /^rating$/i,
  /^result$/i,
  /^score$/i,
  /status/i,
  /compliance/i,
];

const ID_HEADER_PATTERNS = [
  /^id$/i,
  /^control\s*id$/i,
  /^question\s*id$/i,
  /^ref$/i,
  /^reference$/i,
];

function normalizeHeader(header: string): string {
  return header.trim().replace(/^\uFEFF/, '');
}

function pickColumn(headers: string[], patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const hit = headers.find((h) => pattern.test(normalizeHeader(h)));
    if (hit) return hit;
  }
  return null;
}

export function detectQuestionnaireColumns(headers: string[]): ImportColumnMap {
  const normalized = headers.map(normalizeHeader);
  return {
    questionCol: pickColumn(normalized, QUESTION_HEADER_PATTERNS),
    answerCol: pickColumn(normalized, ANSWER_HEADER_PATTERNS),
    statusCol: pickColumn(normalized, STATUS_HEADER_PATTERNS),
    idCol: pickColumn(normalized, ID_HEADER_PATTERNS),
  };
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseCsvContent(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] ?? '';
    });
    rows.push(row);
  }

  return { headers, rows };
}

function rowsFromJsonArray(items: unknown[]): { headers: string[]; rows: Record<string, string>[] } {
  const rows = items
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) =>
      Object.fromEntries(
        Object.entries(item).map(([key, value]) => [normalizeHeader(key), String(value ?? '').trim()])
      )
    );

  const headerSet = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) headerSet.add(key);
  }

  return { headers: [...headerSet], rows };
}

export function parseJsonQuestionnaire(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const parsed = JSON.parse(text) as unknown;

  if (Array.isArray(parsed)) {
    return rowsFromJsonArray(parsed);
  }

  if (typeof parsed === 'object' && parsed !== null) {
    const obj = parsed as Record<string, unknown>;
    const nested =
      obj.questions ?? obj.responses ?? obj.items ?? obj.rows ?? obj.data;
    if (Array.isArray(nested)) {
      return rowsFromJsonArray(nested);
    }
  }

  throw new Error('JSON must be an array of objects or contain a questions/responses/items array');
}

export function parseQuestionnaireFile(
  content: string,
  filename: string
): { headers: string[]; rows: Record<string, string>[] } {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';

  if (ext === 'json') {
    return parseJsonQuestionnaire(content);
  }

  if (ext === 'csv' || ext === 'txt') {
    return parseCsvContent(content);
  }

  if (content.trimStart().startsWith('[') || content.trimStart().startsWith('{')) {
    return parseJsonQuestionnaire(content);
  }

  return parseCsvContent(content);
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenSet(text: string): Set<string> {
  return new Set(
    normalizeText(text)
      .split(' ')
      .filter((t) => t.length > 2)
  );
}

function fuzzyScore(a: string, b: string): number {
  const na = normalizeText(a);
  const nb = normalizeText(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.85;

  const tokensA = tokenSet(a);
  const tokensB = tokenSet(b);
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let overlap = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) overlap++;
  }
  return overlap / Math.max(tokensA.size, tokensB.size);
}

export function normalizeResponseStatus(text: string): ImportResponseStatus | '' {
  const value = text.trim().toLowerCase();
  if (!value) return '';

  if (['yes', 'y', 'true', 'compliant', 'pass', 'passed', 'complete', 'met', 'full'].includes(value)) {
    return 'yes';
  }
  if (['partial', 'partly', 'in progress', 'in-progress', 'some', 'mostly'].includes(value)) {
    return 'partial';
  }
  if (['no', 'n', 'false', 'gap', 'fail', 'failed', 'non-compliant', 'non compliant', 'missing'].includes(value)) {
    return 'no';
  }
  if (['na', 'n/a', 'not applicable', 'none', 'not-applicable'].includes(value)) {
    return 'na';
  }
  return '';
}

function inferStatusFromAnswer(answer: string): ImportResponseStatus | '' {
  const fromAnswer = normalizeResponseStatus(answer);
  if (fromAnswer) return fromAnswer;

  const lower = answer.toLowerCase();
  if (/\b(yes|confirmed|in place|implemented|available)\b/.test(lower)) return 'yes';
  if (/\b(partial|in progress|under review|planned)\b/.test(lower)) return 'partial';
  if (/\b(no|not |missing|none|unable|does not)\b/.test(lower)) return 'no';
  return '';
}

function findQuestionMatch(
  row: ParsedImportRow,
  questions: ImportableQuestion[]
): { questionId: string | null; confidence: ImportMatchResult['matchConfidence'] } {
  if (row.idText) {
    const byId = questions.find((q) => q.id === row.idText);
    if (byId) return { questionId: byId.id, confidence: 'id' };
  }

  const uploadText = row.questionText.trim();
  if (!uploadText) return { questionId: null, confidence: 'none' };

  const normalizedUpload = normalizeText(uploadText);
  for (const q of questions) {
    const candidates = [q.question, q.checklistLabel].filter(Boolean) as string[];
    for (const candidate of candidates) {
      if (normalizeText(candidate) === normalizedUpload) {
        return { questionId: q.id, confidence: 'exact' };
      }
    }
  }

  let bestId: string | null = null;
  let bestScore = 0;
  for (const q of questions) {
    const candidates = [q.question, q.checklistLabel].filter(Boolean) as string[];
    for (const candidate of candidates) {
      const score = fuzzyScore(uploadText, candidate);
      if (score > bestScore) {
        bestScore = score;
        bestId = q.id;
      }
    }
  }

  if (bestId && bestScore >= 0.45) {
    return { questionId: bestId, confidence: 'fuzzy' };
  }

  return { questionId: null, confidence: 'none' };
}

export function buildImportRows(
  rawRows: Record<string, string>[],
  columnMap: ImportColumnMap
): ParsedImportRow[] {
  return rawRows.map((raw, rowIndex) => ({
    rowIndex,
    questionText: columnMap.questionCol ? (raw[columnMap.questionCol] ?? '') : '',
    answerText: columnMap.answerCol ? (raw[columnMap.answerCol] ?? '') : '',
    statusText: columnMap.statusCol ? (raw[columnMap.statusCol] ?? '') : '',
    idText: columnMap.idCol ? (raw[columnMap.idCol] ?? '') : '',
    raw,
  }));
}

export function matchImportedRowsToQuestions(
  rows: ParsedImportRow[],
  questions: ImportableQuestion[]
): ImportMatchResult[] {
  return rows.map((row) => {
    const { questionId, confidence } = findQuestionMatch(row, questions);
    const matchedQuestion = questionId ? questions.find((q) => q.id === questionId) : null;
    const status =
      normalizeResponseStatus(row.statusText) ||
      inferStatusFromAnswer(row.answerText) ||
      (row.answerText.trim() ? 'partial' : '');

    return {
      rowIndex: row.rowIndex,
      questionId,
      questionText: matchedQuestion?.checklistLabel ?? matchedQuestion?.question ?? '',
      uploadedQuestion: row.questionText || row.idText || '(empty row)',
      answer: row.answerText,
      status,
      matchConfidence: confidence,
    };
  });
}

export function buildQuestionnaireImportPreview(
  content: string,
  filename: string,
  questions: ImportableQuestion[]
): QuestionnaireImportPreview {
  const { headers, rows: rawRows } = parseQuestionnaireFile(content, filename);
  const columnMap = detectQuestionnaireColumns(headers);
  const rows = buildImportRows(rawRows, columnMap);
  const matches = matchImportedRowsToQuestions(rows, questions);

  return {
    headers,
    columnMap,
    rows,
    matches,
    matchedCount: matches.filter((m) => m.questionId).length,
    unmatchedCount: matches.filter((m) => !m.questionId).length,
  };
}

export function matchesToResponses(
  matches: ImportMatchResult[]
): Array<{ questionId: string; answer: string; status: ImportResponseStatus }> {
  const byQuestion = new Map<string, ImportMatchResult>();

  for (const match of matches) {
    if (!match.questionId) continue;
    const existing = byQuestion.get(match.questionId);
    if (!existing || match.answer.length > (existing.answer?.length ?? 0)) {
      byQuestion.set(match.questionId, match);
    }
  }

  return [...byQuestion.entries()].map(([questionId, match]) => ({
    questionId,
    answer: match.answer,
    status: (match.status || 'partial') as ImportResponseStatus,
  }));
}
