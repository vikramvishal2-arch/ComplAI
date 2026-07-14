import 'server-only';
import { appBaseUrl, escapeHtml, sendEmail, type SendEmailResult } from './mailer';

export async function sendVendorQuestionnaireInvite(input: {
  vendorName: string;
  vendorEmail: string;
  assessmentId: string;
  vendorId: string;
  templateName?: string;
  dueDate?: string | null;
}): Promise<SendEmailResult> {
  const link = `${appBaseUrl()}/vendors/${input.vendorId}?tab=questionnaires&assessment=${input.assessmentId}`;
  const subject = `[TPRM] Security questionnaire for ${input.vendorName}`;
  const text = [
    `Hello,`,
    '',
    `You have been invited to complete a third-party risk (TPRM) security questionnaire for ${input.vendorName}.`,
    input.templateName ? `Template: ${input.templateName}` : '',
    input.dueDate ? `Due date: ${input.dueDate}` : '',
    '',
    `Open the questionnaire:`,
    link,
    '',
    `Please complete all items and submit for review.`,
    '',
    `— ComplAI TPRM`,
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;color:#0f172a;">
      <h2 style="margin:0 0 12px;">TPRM security questionnaire</h2>
      <p>You have been invited to complete a third-party risk questionnaire for <strong>${escapeHtml(input.vendorName)}</strong>.</p>
      ${input.templateName ? `<p style="color:#475569;">Template: ${escapeHtml(input.templateName)}</p>` : ''}
      ${input.dueDate ? `<p style="color:#475569;">Due date: ${escapeHtml(input.dueDate)}</p>` : ''}
      <p style="margin:24px 0;">
        <a href="${escapeHtml(link)}" style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600;">
          Open questionnaire
        </a>
      </p>
      <p style="color:#64748b;font-size:12px;">If the button does not work, copy this link:<br>${escapeHtml(link)}</p>
    </div>
  `.trim();

  return sendEmail({
    to: input.vendorEmail,
    subject,
    text,
    html,
  });
}

export async function sendVendorAssessmentCompletedNotice(input: {
  vendorName: string;
  vendorId: string;
  assessmentId: string;
  score?: number | null;
  notifyEmail: string;
}): Promise<SendEmailResult> {
  const link = `${appBaseUrl()}/vendors/${input.vendorId}?tab=findings`;
  const subject = `[TPRM] Assessment completed — ${input.vendorName}`;
  const text = [
    `Vendor assessment completed for ${input.vendorName}.`,
    input.score != null ? `Score: ${input.score}` : '',
    `Review findings: ${link}`,
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2>Vendor assessment completed</h2>
      <p><strong>${escapeHtml(input.vendorName)}</strong> questionnaire has been scored.</p>
      ${input.score != null ? `<p>Score: <strong>${input.score}</strong></p>` : ''}
      <p><a href="${escapeHtml(link)}">Review findings in ComplAI</a></p>
    </div>
  `.trim();

  return sendEmail({ to: input.notifyEmail, subject, text, html });
}
