import 'server-only';
import { appBaseUrl, escapeHtml, sendEmail, type SendEmailResult } from './mailer';

export async function sendPolicyApprovalRequest(input: {
  policyTitle: string;
  policyId: string;
  stepLabel: string;
  recipientName: string;
  recipientEmail: string;
  memberId: string;
  actorName?: string;
}): Promise<SendEmailResult> {
  const link = `${appBaseUrl()}/policies/approvals/${input.policyId}?member=${input.memberId}`;
  const subject = `[Approval] Action required — ${input.policyTitle} (${input.stepLabel})`;
  const text = [
    `Hello ${input.recipientName},`,
    '',
    `You have an approval action on policy "${input.policyTitle}".`,
    `Step: ${input.stepLabel}`,
    input.actorName ? `Triggered by: ${input.actorName}` : '',
    '',
    `Review and approve/reject:`,
    link,
    '',
    `— ComplAI Policy Approvals`,
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;color:#0f172a;">
      <h2 style="margin:0 0 12px;">Policy approval required</h2>
      <p>Hello ${escapeHtml(input.recipientName)},</p>
      <p>You have an approval action on <strong>${escapeHtml(input.policyTitle)}</strong>.</p>
      <p style="color:#475569;">Step: <strong>${escapeHtml(input.stepLabel)}</strong></p>
      ${input.actorName ? `<p style="color:#475569;">Triggered by: ${escapeHtml(input.actorName)}</p>` : ''}
      <p style="margin:24px 0;">
        <a href="${escapeHtml(link)}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600;">
          Open approval inbox
        </a>
      </p>
    </div>
  `.trim();

  return sendEmail({ to: input.recipientEmail, subject, text, html });
}

export async function sendPolicyApprovalDecisionNotice(input: {
  policyTitle: string;
  policyId: string;
  stepLabel: string;
  status: string;
  recipientEmail: string;
  comments?: string;
}): Promise<SendEmailResult> {
  const link = `${appBaseUrl()}/policies/${input.policyId}`;
  const subject = `[Approval] ${input.status.toUpperCase()} — ${input.policyTitle} (${input.stepLabel})`;
  const text = [
    `Policy "${input.policyTitle}" step "${input.stepLabel}" was marked ${input.status}.`,
    input.comments ? `Comments: ${input.comments}` : '',
    `View policy: ${link}`,
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2>Approval update</h2>
      <p><strong>${escapeHtml(input.policyTitle)}</strong> — ${escapeHtml(input.stepLabel)} is now <strong>${escapeHtml(input.status)}</strong>.</p>
      ${input.comments ? `<p>Comments: ${escapeHtml(input.comments)}</p>` : ''}
      <p><a href="${escapeHtml(link)}">Open policy</a></p>
    </div>
  `.trim();

  return sendEmail({ to: input.recipientEmail, subject, text, html });
}
