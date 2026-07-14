import 'server-only';
import { getOrganizationMembers } from '@/lib/db/member-repository';
import type { Risk, RiskStatus } from '@/lib/types';
import { appBaseUrl, escapeHtml, sendEmail, type SendEmailResult } from './mailer';

export type RiskEmailKind = 'assigned' | 'review' | 'approval';

function riskLink(riskId: string): string {
  return `${appBaseUrl()}/risk-register/risks/${riskId}`;
}

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Resolve an assignee string to an email.
 * Accepts an explicit email, member id, or member name — never invents addresses.
 */
export async function resolveRiskAssigneeEmail(
  assignee: string | null | undefined,
  members?: Awaited<ReturnType<typeof getOrganizationMembers>>
): Promise<string | null> {
  const raw = assignee?.trim();
  if (!raw) return null;

  if (looksLikeEmail(raw)) return raw;

  const list = members ?? (await getOrganizationMembers(true));
  const lower = raw.toLowerCase();
  const hit =
    list.find((m) => m.id === raw) ||
    list.find((m) => m.email.toLowerCase() === lower) ||
    list.find((m) => m.name.toLowerCase() === lower);

  return hit?.email ?? null;
}

/** First active org member with any of the given approval roles. */
export async function resolveEmailByApprovalRoles(
  roles: string[],
  members?: Awaited<ReturnType<typeof getOrganizationMembers>>
): Promise<string | null> {
  if (roles.length === 0) return null;
  const list = members ?? (await getOrganizationMembers(true));
  const roleSet = new Set(roles.map((r) => r.toLowerCase()));
  const hit = list.find((m) =>
    m.approvalRoles.some((r) => roleSet.has(r.toLowerCase()))
  );
  return hit?.email ?? null;
}

async function resolveOwnerEmail(
  risk: Pick<Risk, 'owner'>,
  members?: Awaited<ReturnType<typeof getOrganizationMembers>>
): Promise<string | null> {
  return resolveRiskAssigneeEmail(risk.owner, members);
}

async function resolveReviewerEmail(
  risk: Pick<Risk, 'reviewer'>,
  members?: Awaited<ReturnType<typeof getOrganizationMembers>>
): Promise<string | null> {
  return (
    (await resolveRiskAssigneeEmail(risk.reviewer, members)) ||
    (await resolveEmailByApprovalRoles(['reviewer'], members))
  );
}

async function resolveApproverEmail(
  risk: Pick<Risk, 'approver'>,
  members?: Awaited<ReturnType<typeof getOrganizationMembers>>
): Promise<string | null> {
  return (
    (await resolveRiskAssigneeEmail(risk.approver, members)) ||
    (await resolveEmailByApprovalRoles(['isms-owner', 'executive'], members))
  );
}

async function sendRiskNotice(input: {
  kind: RiskEmailKind;
  risk: Pick<Risk, 'id' | 'title' | 'status' | 'owner' | 'category'>;
  to: string;
  recipientLabel: string;
}): Promise<SendEmailResult> {
  const link = riskLink(input.risk.id);
  const { kind, risk, to, recipientLabel } = input;

  const copy: Record<
    RiskEmailKind,
    { subject: string; headline: string; body: string; cta: string }
  > = {
    assigned: {
      subject: `[Risk] Assigned to you — ${risk.title}`,
      headline: 'Risk assigned',
      body: `You have been assigned as the owner of risk "${risk.title}".`,
      cta: 'Open risk',
    },
    review: {
      subject: `[Risk] Review required — ${risk.title}`,
      headline: 'Risk submitted for review',
      body: `Risk "${risk.title}" has been submitted for your review.`,
      cta: 'Review risk',
    },
    approval: {
      subject: `[Risk] Approval required — ${risk.title}`,
      headline: 'Risk pending approval',
      body: `Risk "${risk.title}" is pending your approval.`,
      cta: 'Review & approve',
    },
  };

  const msg = copy[kind];
  const text = [
    `Hello ${recipientLabel},`,
    '',
    msg.body,
    risk.owner ? `Owner: ${risk.owner}` : '',
    risk.category ? `Category: ${risk.category}` : '',
    `Status: ${risk.status}`,
    '',
    `${msg.cta}:`,
    link,
    '',
    `— ComplAI Risk Register`,
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;color:#0f172a;">
      <h2 style="margin:0 0 12px;">${escapeHtml(msg.headline)}</h2>
      <p>Hello ${escapeHtml(recipientLabel)},</p>
      <p>${escapeHtml(msg.body)}</p>
      ${risk.owner ? `<p style="color:#475569;">Owner: <strong>${escapeHtml(risk.owner)}</strong></p>` : ''}
      ${risk.category ? `<p style="color:#475569;">Category: ${escapeHtml(risk.category)}</p>` : ''}
      <p style="color:#475569;">Status: <strong>${escapeHtml(risk.status)}</strong></p>
      <p style="margin:24px 0;">
        <a href="${escapeHtml(link)}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600;">
          ${escapeHtml(msg.cta)}
        </a>
      </p>
      <p style="color:#64748b;font-size:12px;">If the button does not work, copy this link:<br>${escapeHtml(link)}</p>
    </div>
  `.trim();

  return sendEmail({ to, subject: msg.subject, text, html });
}

async function notifyOrSkip(
  kind: RiskEmailKind,
  risk: Risk,
  email: string | null,
  label: string
): Promise<SendEmailResult | null> {
  if (!email) {
    console.warn(
      `[risk-email] No email resolved for ${kind} on risk ${risk.id} (${label}); skipping`
    );
    return null;
  }
  try {
    const result = await sendRiskNotice({
      kind,
      risk,
      to: email,
      recipientLabel: label,
    });
    if (!result.ok) {
      console.warn(`[risk-email] ${kind} send failed for ${email}: ${result.error}`);
    }
    return result;
  } catch (err) {
    console.warn(
      `[risk-email] ${kind} send threw for risk ${risk.id}:`,
      err instanceof Error ? err.message : err
    );
    return {
      ok: false,
      provider: 'stub',
      error: err instanceof Error ? err.message : 'Send failed',
      deliveredTo: [],
    };
  }
}

/** After create: always notify the risk owner when resolvable. */
export async function notifyRiskCreated(risk: Risk): Promise<(SendEmailResult | null)[]> {
  const members = await getOrganizationMembers(true);
  const email = await resolveOwnerEmail(risk, members);
  const results: (SendEmailResult | null)[] = [
    await notifyOrSkip('assigned', risk, email, risk.owner?.trim() || 'Risk owner'),
  ];

  // If created already in a workflow status, also notify that role.
  if (risk.status === 'assessing' || risk.status === 'in_review') {
    results.push(await notifyRiskSubmittedForReview(risk, members));
  } else if (risk.status === 'pending_approval') {
    results.push(await notifyRiskPendingApproval(risk, members));
  }

  return results;
}

export async function notifyRiskSubmittedForReview(
  risk: Risk,
  members?: Awaited<ReturnType<typeof getOrganizationMembers>>
): Promise<SendEmailResult | null> {
  const email = await resolveReviewerEmail(risk, members);
  return notifyOrSkip(
    'review',
    risk,
    email,
    risk.reviewer?.trim() || 'Reviewer'
  );
}

export async function notifyRiskPendingApproval(
  risk: Risk,
  members?: Awaited<ReturnType<typeof getOrganizationMembers>>
): Promise<SendEmailResult | null> {
  const email = await resolveApproverEmail(risk, members);
  return notifyOrSkip(
    'approval',
    risk,
    email,
    risk.approver?.trim() || 'Approver'
  );
}

const REVIEW_STATUSES: RiskStatus[] = ['assessing', 'in_review'];
const APPROVAL_STATUSES: RiskStatus[] = ['pending_approval'];

/** Fire emails when status transitions into review or approval. */
export async function notifyRiskStatusTransition(input: {
  previousStatus: RiskStatus;
  risk: Risk;
}): Promise<(SendEmailResult | null)[]> {
  const { previousStatus, risk } = input;
  const results: (SendEmailResult | null)[] = [];
  const needsReview =
    REVIEW_STATUSES.includes(risk.status) && !REVIEW_STATUSES.includes(previousStatus);
  const needsApproval =
    APPROVAL_STATUSES.includes(risk.status) && !APPROVAL_STATUSES.includes(previousStatus);

  if (!needsReview && !needsApproval) return results;

  const members = await getOrganizationMembers(true);

  if (needsReview) {
    results.push(await notifyRiskSubmittedForReview(risk, members));
  }

  if (needsApproval) {
    results.push(await notifyRiskPendingApproval(risk, members));
  }

  return results;
}
