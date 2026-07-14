import 'server-only';
import { prisma } from './prisma';

let schemaEnsured = false;

/** Clears the in-memory guard so ALTER TABLE can run again after a failed migration attempt. */
export function resetRiskSchemaCache(): void {
  schemaEnsured = false;
}

/** Adds risk assignee columns for review/approval notifications (idempotent). */
export async function ensureRiskSchema(force = false): Promise<void> {
  if (schemaEnsured && !force) return;

  await prisma.$executeRaw`
    ALTER TABLE risks
    ADD COLUMN IF NOT EXISTS reviewer TEXT NOT NULL DEFAULT ''
  `;

  await prisma.$executeRaw`
    ALTER TABLE risks
    ADD COLUMN IF NOT EXISTS approver TEXT NOT NULL DEFAULT ''
  `;

  schemaEnsured = true;
}
