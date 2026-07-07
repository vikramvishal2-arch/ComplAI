import 'server-only';
import { prisma } from './prisma';

let schemaEnsured = false;

/** Clears the in-memory guard so ALTER TABLE can run again after a failed migration attempt. */
export function resetVendorSchemaCache(): void {
  schemaEnsured = false;
}

/** Adds vendor columns introduced after initial TPRM rollout (idempotent). */
export async function ensureVendorSchema(force = false): Promise<void> {
  if (schemaEnsured && !force) return;

  await prisma.$executeRaw`
    ALTER TABLE vendors
    ADD COLUMN IF NOT EXISTS certifications JSONB NOT NULL DEFAULT '[]'::jsonb
  `;

  schemaEnsured = true;
}
