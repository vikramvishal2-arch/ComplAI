import { NextResponse } from 'next/server';
import { getFrameworkById } from '@/lib/data/frameworks';
import { getControlById } from '@/lib/data/controls';
import { getRemediationPlaybook, isAccessControlDomain } from '@/lib/data/remediation-playbooks';
import { ACCESS_INTEGRATION_PROVIDERS } from '@/lib/data/access-integrations';
import {
  getControlCompliance,
  updateControlCompliance,
  getControlRemediation,
  updateControlRemediation,
  getControlIssues,
  getControlEvidence,
  getRisksByControlId,
  hasControlEvidenceForContext,
  createDefaultAccessConnections,
} from '@/lib/store';
import { isOpenRiskStatus } from '@/lib/risk/status';
import { AuditReadyBlockedError } from '@/lib/compliance/audit-ready';
import { EVIDENCE_REQUIRED_MESSAGES } from '@/lib/evidence/validation';
import { getPoliciesAffectingControl } from '@/lib/policies/control-sync';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const control = getControlById(id);
    if (!control) {
      return NextResponse.json({ error: 'Control not found' }, { status: 404 });
    }

    const framework = getFrameworkById(control.frameworkId);
    const isAccessControl = isAccessControlDomain(control.domain);

    let compliance: Awaited<ReturnType<typeof getControlCompliance>>;
    let remediation: Awaited<ReturnType<typeof getControlRemediation>>;
    try {
      compliance = await getControlCompliance(control.id);
    } catch (complianceError) {
      console.error('GET /api/controls/[id] compliance', complianceError);
      compliance = {
        controlId: control.id,
        status: 'not_started',
        complianceMethod: null,
        implementationApproach: '',
        owner: '',
        targetDate: null,
        evidenceNotes: '',
        naJustification: '',
        lastUpdated: new Date().toISOString(),
      };
    }
    try {
      remediation = await getControlRemediation(control.id, isAccessControl);
    } catch (remediationError) {
      console.error('GET /api/controls/[id] remediation', remediationError);
      remediation = {
        controlId: control.id,
        actions: [],
        accessConnections: isAccessControl ? createDefaultAccessConnections() : [],
        lastUpdated: new Date().toISOString(),
      };
    }

    let issues: Awaited<ReturnType<typeof getControlIssues>> = [];
    let risks: Awaited<ReturnType<typeof getRisksByControlId>> = [];
    let evidence: Awaited<ReturnType<typeof getControlEvidence>> = [];
    try {
      issues = await getControlIssues(control.id);
    } catch (issueError) {
      console.error('GET /api/controls/[id] issues', issueError);
    }
    try {
      risks = await getRisksByControlId(control.id);
    } catch (riskError) {
      console.error('GET /api/controls/[id] risks', riskError);
    }
    try {
      evidence = await getControlEvidence(control.id);
    } catch (evidenceError) {
      console.error('GET /api/controls/[id] evidence', evidenceError);
    }

    const suggestedRemediationLinks = getRemediationPlaybook(control);

    let linkedPolicies: Awaited<ReturnType<typeof getPoliciesAffectingControl>> = [];
    try {
      linkedPolicies = await getPoliciesAffectingControl(control.id);
    } catch (policyLinkError) {
      console.error('GET /api/controls/[id] linkedPolicies', policyLinkError);
    }

    return NextResponse.json({
      control,
      framework,
      compliance,
      remediation,
      issues,
      risks,
      evidence,
      linkedPolicies: linkedPolicies.map((p) => ({
        id: p.id,
        title: p.title,
        status: p.status,
        documentType: p.documentType,
        isoReference: p.isoReference,
      })),
      openIssueCount: issues.filter((i) => i.status === 'open' || i.status === 'in_progress')
        .length,
      openRiskCount: risks.filter((r) => isOpenRiskStatus(r.status)).length,
      suggestedRemediationLinks,
      accessIntegrationProviders: isAccessControl ? ACCESS_INTEGRATION_PROVIDERS : [],
      isAccessControl,
    });
  } catch (error) {
    console.error('GET /api/controls/[id]', error);
    return NextResponse.json(
      { error: 'Database unavailable. Ensure PostgreSQL is running and migrations are applied.' },
      { status: 503 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const control = getControlById(id);
    if (!control) {
      return NextResponse.json({ error: 'Control not found' }, { status: 404 });
    }

    const body = await request.json();
    const isAccessControl = isAccessControlDomain(control.domain);

    let compliance = await getControlCompliance(id);
    let remediation = await getControlRemediation(id, isAccessControl);

    if (body.remediation) {
      const hasEvidence = await hasControlEvidenceForContext(id, 'remediation');
      if (!hasEvidence) {
        return NextResponse.json(
          { error: EVIDENCE_REQUIRED_MESSAGES.remediation },
          { status: 400 }
        );
      }
      remediation = await updateControlRemediation(id, {
        actions: body.remediation.actions,
        accessConnections: body.remediation.accessConnections,
      });
    }

    const complianceFields = [
      'status',
      'complianceMethod',
      'implementationApproach',
      'owner',
      'targetDate',
      'evidenceNotes',
      'naJustification',
    ] as const;

    const hasComplianceUpdate = complianceFields.some((field) => field in body);
    if (hasComplianceUpdate) {
      const hasEvidence = await hasControlEvidenceForContext(id, 'compliance');
      if (!hasEvidence) {
        return NextResponse.json(
          { error: EVIDENCE_REQUIRED_MESSAGES.compliance },
          { status: 400 }
        );
      }
      const updates: Record<string, unknown> = {};
      for (const field of complianceFields) {
        if (field in body) updates[field] = body[field];
      }
      compliance = await updateControlCompliance(id, updates);
    }

    return NextResponse.json({ compliance, remediation });
  } catch (error) {
    if (error instanceof AuditReadyBlockedError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('PATCH /api/controls/[id]', error);
    return NextResponse.json(
      { error: 'Failed to save. Check database connection.' },
      { status: 503 }
    );
  }
}
