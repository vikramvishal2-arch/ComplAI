import { NextResponse } from 'next/server';
import { auditWorkflowErrorMessage } from '@/lib/db/audit-repository';
import { getRiskAssessmentDashboard } from '@/lib/db/risk-assessment-repository';
import { getDefaultOrganization } from '@/lib/db/repository';

export async function GET() {
  try {
    const org = await getDefaultOrganization();
    const dashboard = await getRiskAssessmentDashboard(org.id);
    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('GET /api/audits/risk-assessment/dashboard', error);
    return NextResponse.json(
      { error: auditWorkflowErrorMessage(error) || 'Failed to load risk assessment dashboard' },
      { status: 503 }
    );
  }
}
