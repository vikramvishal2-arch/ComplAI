import { NextResponse } from 'next/server';
import { auditWorkflowErrorMessage } from '@/lib/db/audit-repository';
import {
  getRiskAssessmentDomain,
  launchRiskAssessmentDomains,
  listRiskAssessmentDomains,
  updateRiskAssessmentDomain,
} from '@/lib/db/risk-assessment-repository';
import { getDefaultOrganization } from '@/lib/db/repository';
import type { DomainRiskItem, StageProgress } from '@/lib/data/risk-assessment-domains';

export async function GET(request: Request) {
  try {
    const org = await getDefaultOrganization();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const domain = await getRiskAssessmentDomain(org.id, id);
      if (!domain) {
        return NextResponse.json({ error: 'Risk domain not found' }, { status: 404 });
      }
      return NextResponse.json({ domain });
    }

    const domains = await listRiskAssessmentDomains(org.id);
    return NextResponse.json({ domains });
  } catch (error) {
    console.error('GET /api/audits/risk-assessment', error);
    return NextResponse.json(
      { error: auditWorkflowErrorMessage(error) || 'Failed to load risk assessment domains' },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const org = await getDefaultOrganization();
    const body = (await request.json()) as { launch?: boolean };

    if (body.launch === true) {
      const result = await launchRiskAssessmentDomains(org.id);
      return NextResponse.json(result, { status: 201 });
    }

    return NextResponse.json({ error: 'Use launch: true to seed risk domains' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/audits/risk-assessment', error);
    return NextResponse.json(
      { error: auditWorkflowErrorMessage(error) || 'Failed to launch risk assessment domains' },
      { status: 503 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const org = await getDefaultOrganization();
    const body = (await request.json()) as {
      id?: string;
      owner?: string;
      identification?: Partial<StageProgress>;
      analysis?: Partial<StageProgress>;
      evaluation?: Partial<StageProgress>;
      riskItems?: DomainRiskItem[];
      addRiskItem?: Omit<DomainRiskItem, 'id'> & { id?: string };
      updateRiskItem?: Partial<DomainRiskItem> & { id: string };
      removeRiskItemId?: string;
    };

    const id = String(body.id ?? '').trim();
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const updated = await updateRiskAssessmentDomain(org.id, id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Risk domain not found' }, { status: 404 });
    }

    return NextResponse.json({ domain: updated });
  } catch (error) {
    console.error('PATCH /api/audits/risk-assessment', error);
    return NextResponse.json(
      { error: auditWorkflowErrorMessage(error) || 'Failed to update risk domain' },
      { status: 503 }
    );
  }
}
