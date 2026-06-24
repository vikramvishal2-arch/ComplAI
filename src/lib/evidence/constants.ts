import type { EvidenceContext } from '../types';

export const EVIDENCE_CONTEXT_LABELS: Record<EvidenceContext, string> = {
  compliance: 'Compliance',
  remediation: 'Remediation',
  issues: 'Issues',
};

export const MAX_EVIDENCE_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_EVIDENCE_EXTENSIONS = new Set([
  '.pdf',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.csv',
  '.txt',
  '.zip',
  '.md',
]);

export const ALLOWED_EVIDENCE_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed',
  'text/markdown',
  'application/octet-stream',
]);
