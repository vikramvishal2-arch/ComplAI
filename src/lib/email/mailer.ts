import 'server-only';

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  from?: string;
};

export type SendEmailResult = {
  ok: boolean;
  provider: 'resend' | 'smtp' | 'stub';
  error?: string;
  /** Actual recipients after EMAIL_OVERRIDE_TO (localhost testing). */
  deliveredTo: string[];
};

function normalizeRecipients(to: string | string[]): string[] {
  const list = (Array.isArray(to) ? to : [to])
    .map((v) => v.trim())
    .filter(Boolean);
  const override = process.env.EMAIL_OVERRIDE_TO?.trim();
  if (override) {
    return override.split(',').map((v) => v.trim()).filter(Boolean);
  }
  return list;
}

function defaultFrom(): string {
  return (
    process.env.SMTP_FROM?.trim() ||
    process.env.CONTACT_INQUIRY_FROM?.trim() ||
    process.env.CYCLE_REMINDER_FROM?.trim() ||
    'ComplAI GRC <noreply@propelreadysolutions.in>'
  );
}

/**
 * Shared mailer for TPRM, approvals, and reminders.
 * Priority: Resend → SMTP → console stub (dev).
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const deliveredTo = normalizeRecipients(input.to);
  if (deliveredTo.length === 0) {
    return { ok: false, provider: 'stub', error: 'No recipient email', deliveredTo: [] };
  }

  const from = input.from?.trim() || defaultFrom();
  const resendKey = process.env.RESEND_API_KEY?.trim();

  if (resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: deliveredTo,
          reply_to: input.replyTo,
          subject: input.subject,
          text: input.text,
          html: input.html ?? input.text,
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        return { ok: false, provider: 'resend', error: `Resend ${res.status}: ${body}`, deliveredTo };
      }
      return { ok: true, provider: 'resend', deliveredTo };
    } catch (err) {
      return {
        ok: false,
        provider: 'resend',
        error: err instanceof Error ? err.message : 'Resend failed',
        deliveredTo,
      };
    }
  }

  const smtpHost = process.env.SMTP_HOST?.trim();
  if (smtpHost) {
    try {
      const nodemailer = await import('nodemailer');
      const port = Number(process.env.SMTP_PORT ?? 587);
      const user = process.env.SMTP_USER?.trim();
      const pass = process.env.SMTP_PASS?.trim();
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port,
        secure: process.env.SMTP_SECURE === 'true' || port === 465,
        auth: user && pass ? { user, pass } : undefined,
        connectionTimeout: 8_000,
        greetingTimeout: 8_000,
        socketTimeout: 12_000,
      });

      await transporter.sendMail({
        from,
        to: deliveredTo.join(', '),
        replyTo: input.replyTo,
        subject: input.subject,
        text: input.text,
        html: input.html ?? input.text,
      });
      return { ok: true, provider: 'smtp', deliveredTo };
    } catch (err) {
      return {
        ok: false,
        provider: 'smtp',
        error: err instanceof Error ? err.message : 'SMTP failed',
        deliveredTo,
      };
    }
  }

  console.log(`[email:stub] → ${deliveredTo.join(', ')}`);
  console.log(`  Subject: ${input.subject}`);
  console.log(`  ${input.text.split('\n').slice(0, 8).join('\n  ')}`);
  return { ok: true, provider: 'stub', deliveredTo };
}

export function isEmailDeliveryConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() || process.env.SMTP_HOST?.trim());
}

export function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
