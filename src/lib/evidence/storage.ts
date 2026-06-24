import { mkdir, writeFile, unlink, readFile } from 'fs/promises';
import 'server-only';
import path from 'path';
import { randomUUID } from 'crypto';
import {
  ALLOWED_EVIDENCE_EXTENSIONS,
  ALLOWED_EVIDENCE_MIME_TYPES,
  MAX_EVIDENCE_FILE_BYTES,
} from './constants';

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads', 'evidence');

function sanitizeBaseName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
}

export function getEvidenceExtension(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  return ext;
}

export function validateEvidenceFile(file: File): string | null {
  if (file.size > MAX_EVIDENCE_FILE_BYTES) {
    return `File exceeds ${MAX_EVIDENCE_FILE_BYTES / (1024 * 1024)} MB limit`;
  }
  const ext = getEvidenceExtension(file.name);
  if (!ALLOWED_EVIDENCE_EXTENSIONS.has(ext)) {
    return `File type ${ext || '(none)'} is not allowed`;
  }
  if (file.type && !ALLOWED_EVIDENCE_MIME_TYPES.has(file.type)) {
    // Allow if extension is valid even with generic mime
    if (file.type !== 'application/octet-stream') {
      return `MIME type ${file.type} is not allowed`;
    }
  }
  return null;
}

export async function saveEvidenceFile(
  orgId: string,
  controlId: string,
  file: File
): Promise<{ storagePath: string; fileName: string; relativePath: string }> {
  const validationError = validateEvidenceFile(file);
  if (validationError) throw new Error(validationError);

  const ext = getEvidenceExtension(file.name);
  const fileName = `${randomUUID()}${ext}`;
  const dir = path.join(UPLOAD_ROOT, orgId, controlId);
  await mkdir(dir, { recursive: true });

  const relativePath = path.join(orgId, controlId, fileName);
  const storagePath = path.join(UPLOAD_ROOT, relativePath);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(storagePath, buffer);

  return { storagePath, fileName, relativePath: relativePath.replace(/\\/g, '/') };
}

export async function readEvidenceFile(storagePath: string): Promise<Buffer> {
  return readFile(storagePath);
}

export async function deleteEvidenceFile(storagePath: string): Promise<void> {
  try {
    await unlink(storagePath);
  } catch {
    // File may already be removed
  }
}
