import 'server-only';
import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/db/prisma';
import { getDefaultOrganization } from '@/lib/db/repository';
import { ensureVendorSchema } from '@/lib/db/ensure-vendor-schema';
import { refreshVendorInternetIntelligence } from '@/lib/db/vendor-intelligence';
import {
  listPublicVendorProfiles,
  publicProfileToSeedData,
} from '@/lib/vendor/public-vendor-profiles';

export { publicProfileToSeedData };

async function findVendorByDomainRaw(organizationId: string, domain: string): Promise<string | null> {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM vendors
    WHERE organization_id = ${organizationId} AND primary_domain = ${domain}
    LIMIT 1
  `;
  return rows[0]?.id ?? null;
}

async function deleteAllVendorsRaw(organizationId: string): Promise<void> {
  await prisma.$executeRaw`
    DELETE FROM vendor_assessments WHERE organization_id = ${organizationId}
  `;
  await prisma.$executeRaw`
    DELETE FROM vendors WHERE organization_id = ${organizationId}
  `;
}

/** Raw SQL insert — works when Prisma Client is stale on Windows dev. */
async function insertDemoVendorRaw(
  organizationId: string,
  seed: ReturnType<typeof publicProfileToSeedData>
): Promise<string> {
  const vendorId = randomUUID();
  const labelsJson = JSON.stringify(seed.labels);
  const domainScoresJson = JSON.stringify(seed.domainScores);
  const certificationsJson = JSON.stringify(seed.certifications ?? []);

  await prisma.$executeRaw`
    INSERT INTO vendors (
      id,
      organization_id,
      name,
      description,
      tier,
      data_access,
      status,
      contact_email,
      website,
      primary_domain,
      industry,
      inherent_risk_score,
      ai_risk_score,
      ai_risk_summary,
      security_rating,
      rating_grade,
      domain_scores,
      labels,
      certifications,
      last_assessed_at,
      created_at,
      updated_at
    ) VALUES (
      ${vendorId},
      ${organizationId},
      ${seed.name},
      ${seed.description},
      ${seed.tier},
      ${seed.dataAccess},
      ${seed.status},
      ${seed.contactEmail},
      ${seed.website},
      ${seed.primaryDomain},
      ${seed.industry},
      ${seed.inherentRiskScore},
      ${seed.securityRating},
      ${seed.assessment.aiSummary},
      ${seed.securityRating},
      ${seed.ratingGrade},
      ${domainScoresJson}::jsonb,
      ${labelsJson}::jsonb,
      ${certificationsJson}::jsonb,
      ${seed.lastAssessedAt},
      NOW(),
      NOW()
    )
  `;

  const assessmentId = randomUUID();
  const assessmentDomainJson = JSON.stringify(seed.assessment.domainScores);
  const findingsJson = JSON.stringify(seed.assessment.findings);
  const remediationJson = JSON.stringify(seed.assessment.remediationItems);

  await prisma.$executeRaw`
    INSERT INTO vendor_assessments (
      id,
      organization_id,
      vendor_id,
      status,
      template_id,
      template_name,
      questionnaire_status,
      questions,
      responses,
      ai_score,
      ai_summary,
      domain_scores,
      gaps,
      findings,
      remediation_items,
      completed_at,
      created_at,
      updated_at
    ) VALUES (
      ${assessmentId},
      ${organizationId},
      ${vendorId},
      ${seed.assessment.status},
      ${seed.assessment.templateId},
      ${seed.assessment.templateName},
      ${seed.assessment.questionnaireStatus},
      '[]'::jsonb,
      '[]'::jsonb,
      ${seed.assessment.aiScore},
      ${seed.assessment.aiSummary},
      ${assessmentDomainJson}::jsonb,
      '[]'::jsonb,
      ${findingsJson}::jsonb,
      ${remediationJson}::jsonb,
      ${seed.assessment.completedAt},
      NOW(),
      NOW()
    )
  `;

  return vendorId;
}

export async function seedPublicVendorPortfolio(options?: { replaceExisting?: boolean }) {
  const org = await getDefaultOrganization();
  await ensureVendorSchema();
  const profiles = listPublicVendorProfiles();

  if (options?.replaceExisting) {
    await deleteAllVendorsRaw(org.id);
  }

  const created: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];

  for (const profile of profiles) {
    try {
      const existingId = await findVendorByDomainRaw(org.id, profile.domain);
      if (existingId) {
        skipped.push(profile.name);
        continue;
      }

      const seed = publicProfileToSeedData(profile);
      const vendorId = await insertDemoVendorRaw(org.id, seed);
      await refreshVendorInternetIntelligence(vendorId).catch((err) => {
        console.warn(`Post-seed intelligence refresh failed for ${profile.name}:`, err);
      });
      created.push(profile.name);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`Failed to seed vendor ${profile.name}:`, error);
      errors.push(`${profile.name}: ${msg}`);
    }
  }

  return {
    created,
    skipped,
    errors,
    total: profiles.length,
  };
}
