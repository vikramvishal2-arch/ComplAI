import 'server-only';
import { prisma } from './prisma';

let schemaEnsured = false;

/** Clears the in-memory guard so ALTER TABLE can run again after a failed migration attempt. */
export function resetRiskSchemaCache(): void {
  schemaEnsured = false;
}

/**
 * Idempotent DDL so deploys keep working even if `prisma db push` used a stale tools image.
 * Covers risk assignee columns + control issue/risk mapping columns the Prisma client expects.
 */
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

  await prisma.$executeRaw`
    ALTER TABLE control_issues
    ADD COLUMN IF NOT EXISTS risk_id TEXT
  `;

  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS control_issues_organization_id_risk_id_idx
    ON control_issues (organization_id, risk_id)
  `;

  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS risk_controls (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE,
      risk_id TEXT NOT NULL REFERENCES risks(id) ON UPDATE CASCADE ON DELETE CASCADE,
      control_id TEXT NOT NULL,
      effectiveness TEXT NOT NULL DEFAULT 'not_assessed',
      assessment_notes TEXT NOT NULL DEFAULT '',
      linked_issue_id TEXT,
      last_assessed_at TIMESTAMP(3),
      created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Heal tables created by an earlier healer that used a wrong "notes" column name.
  await prisma.$executeRaw`
    ALTER TABLE risk_controls
    ADD COLUMN IF NOT EXISTS assessment_notes TEXT NOT NULL DEFAULT ''
  `;

  await prisma.$executeRaw`
    CREATE UNIQUE INDEX IF NOT EXISTS risk_controls_risk_id_control_id_key
    ON risk_controls (risk_id, control_id)
  `;

  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS risk_controls_organization_id_risk_id_idx
    ON risk_controls (organization_id, risk_id)
  `;

  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS risk_controls_organization_id_control_id_idx
    ON risk_controls (organization_id, control_id)
  `;

  await prisma.$executeRaw`
    ALTER TABLE control_evidence
    ADD COLUMN IF NOT EXISTS validation_verdict TEXT
  `;

  await prisma.$executeRaw`
    ALTER TABLE control_evidence
    ADD COLUMN IF NOT EXISTS validation_summary TEXT NOT NULL DEFAULT ''
  `;

  await prisma.$executeRaw`
    ALTER TABLE control_evidence
    ADD COLUMN IF NOT EXISTS validation_checked_at TIMESTAMP(3)
  `;

  await prisma.$executeRaw`
    ALTER TABLE vendors
    ADD COLUMN IF NOT EXISTS breach_intel JSONB NOT NULL DEFAULT '{}'::jsonb
  `;

  await prisma.$executeRaw`
    ALTER TABLE vendors
    ADD COLUMN IF NOT EXISTS external_intel JSONB NOT NULL DEFAULT '{}'::jsonb
  `;

  schemaEnsured = true;
}
