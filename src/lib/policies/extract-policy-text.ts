import 'server-only';
import path from 'path';
import { readPolicyFile } from './storage';

const TEXT_EXTENSIONS = new Set(['.md', '.txt', '.markdown']);
const DOCX_EXTENSIONS = new Set(['.docx']);

export function canExtractPolicyText(fileName: string, mimeType?: string | null): boolean {
  const ext = path.extname(fileName).toLowerCase();
  if (TEXT_EXTENSIONS.has(ext) || DOCX_EXTENSIONS.has(ext)) return true;
  if (mimeType === 'text/plain' || mimeType === 'text/markdown') return true;
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return true;
  return false;
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  fileName: string,
  mimeType?: string | null
): Promise<string> {
  const ext = path.extname(fileName).toLowerCase();

  if (TEXT_EXTENSIONS.has(ext) || mimeType === 'text/plain' || mimeType === 'text/markdown') {
    return buffer.toString('utf-8').trim();
  }

  if (DOCX_EXTENSIONS.has(ext) || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  return '';
}

export async function extractPolicyTextFromFile(
  storagePath: string,
  originalFileName: string,
  mimeType?: string | null
): Promise<string> {
  if (!canExtractPolicyText(originalFileName, mimeType)) {
    return '';
  }
  const buffer = await readPolicyFile(storagePath);
  return extractTextFromBuffer(buffer, originalFileName, mimeType);
}

export async function extractPolicyTextFromUpload(file: File): Promise<string> {
  if (!canExtractPolicyText(file.name, file.type)) {
    return '';
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  return extractTextFromBuffer(buffer, file.name, file.type);
}

export async function extractPolicyTextFromBuffer(
  buffer: Buffer,
  fileName: string,
  mimeType?: string | null
): Promise<string> {
  if (!canExtractPolicyText(fileName, mimeType)) {
    return '';
  }
  return extractTextFromBuffer(buffer, fileName, mimeType);
}
