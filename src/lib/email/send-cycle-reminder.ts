import type { ProgramCycle } from '@/lib/types';
import { PROGRAM_TYPE_LABELS } from '@/lib/types';

interface ReminderEmailPayload {
  cycle: ProgramCycle;
  triggerLabel: string;
  recipientEmail: string;
}

function buildReminderContent(payload: ReminderEmailPayload) {
  const { cycle, triggerLabel } = payload;
  const programLabel = PROGRAM_TYPE_LABELS[cycle.programType] ?? cycle.programType;

  const subject = `[GRC] ${triggerLabel}: ${cycle.title}`;

  const text = [
    `Annual Cycle Reminder: ${triggerLabel}`,
    '',
    `Program: ${programLabel}`,
    `Cycle: ${cycle.title}`,
    `Due date: ${cycle.dueDate}`,
    `Owner: ${cycle.owner || 'Unassigned'}`,
    `Status: ${cycle.status}`,
    '',
    cycle.description || '',
    '',
    'Please take action to ensure this program cycle is completed on time.',
    '',
    `— ${process.env.NEXT_PUBLIC_SITE_NAME ?? 'ComplAI GRC Platform'}`,
  ].join('\n');

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#1e293b;">Annual Cycle Reminder</h2>
      <p style="background:#fef3c7;border:1px solid #fde68a;padding:12px 16px;border-radius:8px;color:#92400e;font-weight:600;">
        ${escapeHtml(triggerLabel)}
      </p>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;line-height:1.6;margin:16px 0;">
        <tr><td style="padding:4px 16px 4px 0;font-weight:600;color:#64748b;">Program</td><td style="color:#1e293b;">${escapeHtml(programLabel)}</td></tr>
        <tr><td style="padding:4px 16px 4px 0;font-weight:600;color:#64748b;">Cycle</td><td style="color:#1e293b;">${escapeHtml(cycle.title)}</td></tr>
        <tr><td style="padding:4px 16px 4px 0;font-weight:600;color:#64748b;">Due date</td><td style="color:#1e293b;">${escapeHtml(cycle.dueDate)}</td></tr>
        <tr><td style="padding:4px 16px 4px 0;font-weight:600;color:#64748b;">Owner</td><td style="color:#1e293b;">${escapeHtml(cycle.owner || 'Unassigned')}</td></tr>
        <tr><td style="padding:4px 16px 4px 0;font-weight:600;color:#64748b;">Status</td><td style="color:#1e293b;text-transform:capitalize;">${escapeHtml(cycle.status)}</td></tr>
      </table>
      ${cycle.description ? `<p style="color:#475569;">${escapeHtml(cycle.description)}</p>` : ''}
      <p style="color:#475569;">Please take action to ensure this program cycle is completed on time.</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
      <p style="color:#94a3b8;font-size:12px;">${escapeHtml(process.env.NEXT_PUBLIC_SITE_NAME ?? 'ComplAI GRC Platform')}</p>
    </div>
  `.trim();

  return { subject, text, html };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Send a cycle reminder email. Uses Resend if configured, falls back to SMTP,
 * or logs to console as a stub when neither is available.
 */
export async function sendCycleReminderEmail(payload: ReminderEmailPayload): Promise<boolean> {
  const content = buildReminderContent(payload);

  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    try {
      const from = process.env.CYCLE_REMINDER_FROM?.trim()
        || process.env.CONTACT_INQUIRY_FROM?.trim()
        || 'GRC Platform <noreply@propelreadysolutions.in>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [payload.recipientEmail],
          subject: content.subject,
          text: content.text,
          html: content.html,
        }),
      });
      if (!res.ok) {
        console.error(`[cycle-reminder] Resend error: ${res.status}`, await res.text());
        return false;
      }
      return true;
    } catch (err) {
      console.error('[cycle-reminder] Resend failed:', err);
      return false;
    }
  }

  const smtpHost = process.env.SMTP_HOST?.trim();
  if (smtpHost) {
    try {
      const nodemailer = await import('nodemailer');
      const port = Number(process.env.SMTP_PORT ?? 587);
      const user = process.env.SMTP_USER?.trim();
      const pass = process.env.SMTP_PASS?.trim();
      const from = process.env.CYCLE_REMINDER_FROM?.trim()
        || process.env.CONTACT_INQUIRY_FROM?.trim()
        || 'GRC Platform <noreply@propelreadysolutions.in>';

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port,
        secure: process.env.SMTP_SECURE === 'true' || port === 465,
        auth: user && pass ? { user, pass } : undefined,
      });

      await transporter.sendMail({
        from,
        to: payload.recipientEmail,
        subject: content.subject,
        text: content.text,
        html: content.html,
      });
      return true;
    } catch (err) {
      console.error('[cycle-reminder] SMTP failed:', err);
      return false;
    }
  }

  console.log(`[cycle-reminder] STUB email → ${payload.recipientEmail}`);
  console.log(`  Subject: ${content.subject}`);
  console.log(`  ${content.text.split('\n').slice(0, 6).join('\n  ')}`);
  return true;
}
