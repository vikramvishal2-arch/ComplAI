import type { ContactInquiryPayload } from '@/lib/email/contact-inquiry-types';

export const CONTACT_INQUIRY_TO =
  process.env.CONTACT_INQUIRY_TO?.trim() || 'tech@propelreadysolutions.in';

const CONTACT_INQUIRY_FROM =
  process.env.CONTACT_INQUIRY_FROM?.trim() ||
  'Propel Ready Solutions Website <noreply@propelreadysolutions.in>';

function buildEmailContent(payload: ContactInquiryPayload) {
  const { name, phone, email, requirement } = payload;
  const submittedAt = new Date().toUTCString();

  const text = [
    'New contact enquiry from the Propel Ready Solutions website',
    '',
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email}`,
    '',
    'Requirement:',
    requirement,
    '',
    `Submitted at: ${submittedAt}`,
  ].join('\n');

  const html = `
    <h2>New contact enquiry</h2>
    <p>A visitor submitted the contact form on the Propel Ready Solutions website.</p>
    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Inter,Arial,sans-serif;font-size:14px;line-height:1.5;">
      <tr><td style="padding:4px 12px 4px 0;font-weight:600;">Name</td><td>${escapeHtml(name)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:600;">Phone</td><td>${escapeHtml(phone)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:600;">Email</td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
    </table>
    <h3 style="margin:20px 0 8px;font-size:14px;">Requirement</h3>
    <p style="white-space:pre-wrap;margin:0;">${escapeHtml(requirement)}</p>
    <p style="margin-top:24px;color:#64748b;font-size:12px;">Submitted at ${escapeHtml(submittedAt)}</p>
  `.trim();

  return {
    subject: `New contact enquiry from ${name}`,
    text,
    html,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendViaResend(
  payload: ContactInquiryPayload,
  content: ReturnType<typeof buildEmailContent>
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: CONTACT_INQUIRY_FROM,
      to: [CONTACT_INQUIRY_TO],
      reply_to: payload.email,
      subject: content.subject,
      text: content.text,
      html: content.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API error (${response.status}): ${body}`);
  }
}

async function sendViaSmtp(
  payload: ContactInquiryPayload,
  content: ReturnType<typeof buildEmailContent>
): Promise<void> {
  const host = process.env.SMTP_HOST?.trim();
  if (!host) return;

  const nodemailer = await import('nodemailer');
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });

  await transporter.sendMail({
    from: CONTACT_INQUIRY_FROM,
    to: CONTACT_INQUIRY_TO,
    replyTo: payload.email,
    subject: content.subject,
    text: content.text,
    html: content.html,
  });
}

/** FormSubmit relay — works without SMTP/Resend; first delivery requires inbox activation. */
async function sendViaFormSubmit(
  payload: ContactInquiryPayload,
  content: ReturnType<typeof buildEmailContent>
): Promise<void> {
  const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_INQUIRY_TO)}`;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://propelreadysolutions.in');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Referer: `${siteUrl}/`,
      Origin: siteUrl.replace(/\/$/, ''),
    },
    body: JSON.stringify({
      _subject: content.subject,
      _template: 'table',
      _captcha: 'false',
      _replyto: payload.email,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      message: payload.requirement,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`FormSubmit error (${response.status}): ${body}`);
  }

  const result = (await response.json()) as { success?: string; message?: string };
  if (result.success !== 'true') {
    const message = result.message ?? 'FormSubmit did not accept the enquiry';
    if (/activation/i.test(message)) {
      throw new Error(
        'Contact form email needs activation. Check tech@propelreadysolutions.in for the FormSubmit activation link, then submit again.'
      );
    }
    throw new Error(message);
  }
}

export function isContactEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() ||
      process.env.SMTP_HOST?.trim() ||
      process.env.CONTACT_USE_FORMSUBMIT?.trim() !== 'false'
  );
}

/** Sends a contact enquiry notification to the Propel Ready team inbox. */
export async function sendContactInquiryEmail(payload: ContactInquiryPayload): Promise<void> {
  const content = buildEmailContent(payload);
  const errors: string[] = [];

  if (process.env.RESEND_API_KEY?.trim()) {
    try {
      await sendViaResend(payload, content);
      return;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Resend failed');
    }
  }

  if (process.env.SMTP_HOST?.trim()) {
    try {
      await sendViaSmtp(payload, content);
      return;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'SMTP failed');
    }
  }

  if (process.env.CONTACT_USE_FORMSUBMIT?.trim() === 'false') {
    throw new Error(
      errors[0] ??
        'Contact email is not configured. Set RESEND_API_KEY or SMTP_HOST in the environment.'
    );
  }

  try {
    await sendViaFormSubmit(payload, content);
    return;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'FormSubmit failed';
    throw new Error(errors.length ? `${errors.join('; ')}; ${message}` : message);
  }
}
