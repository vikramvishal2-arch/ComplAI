import { Prisma } from '@prisma/client';

const STALE_VENDOR_FIELD_MARKERS = [
  'primaryDomain',
  'primary_domain',
  'industry',
  'securityRating',
  'security_rating',
  'domainScores',
  'domain_scores',
  'labels',
  'certifications',
  'ratingGrade',
  'rating_grade',
  'inherentRiskScore',
  'inherent_risk_score',
  'aiRiskSummary',
  'ai_risk_summary',
  'lastAssessedAt',
  'last_assessed_at',
  'questionnaireStatus',
  'questionnaire_status',
  'remediationItems',
  'remediation_items',
];

function isPrismaValidationError(error: unknown): error is Prisma.PrismaClientValidationError {
  return error instanceof Prisma.PrismaClientValidationError;
}

function isPrismaKnownRequestError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

export function isPrismaConnectionError(error: unknown): boolean {
  if (isPrismaKnownRequestError(error)) {
    return error.code === 'P1017' || error.code === 'P1001' || error.code === 'P1008';
  }
  const msg = String((error as Error)?.message ?? error);
  return /server has closed the connection/i.test(msg) || /connection.*(refused|reset|terminated)/i.test(msg);
}

export function isStaleVendorClientError(error: unknown): boolean {
  if (!isPrismaValidationError(error)) return false;
  const msg = String(error.message);
  return STALE_VENDOR_FIELD_MARKERS.some((field) => msg.includes(field));
}

export function isMissingSchemaError(error: unknown): boolean {
  if (isPrismaKnownRequestError(error)) {
    return error.code === 'P2021' || error.code === 'P2022';
  }
  const msg = String((error as Error)?.message ?? error);
  return (
    /column .* does not exist/i.test(msg) ||
    /relation .* does not exist/i.test(msg) ||
    /table .* does not exist/i.test(msg)
  );
}

/** User-facing message for vendor API database errors. Returns null if unhandled. */
export function formatVendorDbError(error: unknown): string | null {
  if (isPrismaConnectionError(error)) {
    return 'Database connection lost. Check that PostgreSQL is running (`npm run db:up`), then refresh.';
  }
  if (isPrismaKnownRequestError(error) && error.code === 'P2021') {
    return 'Vendor tables missing. Run `npm run db:push` in the project folder, then refresh.';
  }
  if (isMissingSchemaError(error)) {
    return 'Database schema is out of date. Run `npm run db:push` in the project folder, then refresh.';
  }
  if (isStaleVendorClientError(error)) {
    return 'Prisma Client is out of date. Stop the dev server (Ctrl+C), run `npm run db:generate`, then restart with `npm run dev`.';
  }
  if (isPrismaValidationError(error)) {
    return 'Schema mismatch detected. Run `npm run db:push`, then stop dev, run `npm run db:generate`, and restart.';
  }
  return null;
}
