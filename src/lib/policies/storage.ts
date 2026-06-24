import { mkdir, writeFile, unlink, readFile } from 'fs/promises';
import 'server-only';
import path from 'path';
import { randomUUID } from 'crypto';
import {
  ALLOWED_EVIDENCE_EXTENSIONS,
  ALLOWED_EVIDENCE_MIME_TYPES,
  MAX_EVIDENCE_FILE_BYTES,
} from '../evidence/constants';

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads', 'policies');

export function validatePolicyFile(file: File): string | null {
  if (file.size > MAX_EVIDENCE_FILE_BYTES) {
    return `File exceeds ${MAX_EVIDENCE_FILE_BYTES / (1024 * 1024)} MB limit`;
  }
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EVIDENCE_EXTENSIONS.has(ext)) {
    return `File type ${ext || '(none)'} is not allowed`;
  }
  if (file.type && !ALLOWED_EVIDENCE_MIME_TYPES.has(file.type) && file.type !== 'application/octet-stream') {
    return `MIME type ${file.type} is not allowed`;
  }
  return null;
}

export async function savePolicyFile(
  orgId: string,
  policyId: string,
  file: File
): Promise<{ storagePath: string; fileName: string; relativePath: string }> {
  const validationError = validatePolicyFile(file);
  if (validationError) throw new Error(validationError);

  const ext = path.extname(file.name).toLowerCase();
  const fileName = `${randomUUID()}${ext}`;
  const dir = path.join(UPLOAD_ROOT, orgId, policyId);
  await mkdir(dir, { recursive: true });

  const relativePath = path.join(orgId, policyId, fileName);
  const storagePath = path.join(UPLOAD_ROOT, relativePath);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(storagePath, buffer);

  return { storagePath, fileName, relativePath: relativePath.replace(/\\/g, '/') };
}

export async function readPolicyFile(storagePath: string): Promise<Buffer> {
  return readFile(storagePath);
}

export async function deletePolicyFile(storagePath: string): Promise<void> {
  try {
    await unlink(storagePath);
  } catch {
    // File may already be removed
  }
}
