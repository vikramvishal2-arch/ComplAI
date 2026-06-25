import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { isTenDigitPhone } from '@/lib/data/country-dial-codes';
import type { ContactInquiryPayload } from '@/lib/email/contact-inquiry-types';
import { sendContactInquiryEmail } from '@/lib/email/send-contact-inquiry-email';
export type { ContactInquiryPayload } from '@/lib/email/contact-inquiry-types';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseBody(body: unknown): ContactInquiryPayload | null {
  if (!body || typeof body !== 'object') return null;
  const { name, phone, email, requirement } = body as Record<string, unknown>;
  if (
    typeof name !== 'string' ||
    typeof phone !== 'string' ||
    typeof email !== 'string' ||
    typeof requirement !== 'string'
  ) {
    return null;
  }
  return {
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim(),
    requirement: requirement.trim(),
  };
}

async function saveInquiry(payload: ContactInquiryPayload): Promise<void> {
  try {
    await prisma.contactInquiry.create({
      data: payload,
    });
  } catch (error) {
    console.error('POST /api/contact — database save failed (email will still be attempted)', error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = parseBody(await request.json());
    if (!payload) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { name, phone, email, requirement } = payload;

    if (!name || !phone || !email || !requirement) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const localDigits = phone.replace(/\D/g, '').slice(-10);
    if (!isTenDigitPhone(localDigits)) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit phone number.' }, { status: 400 });
    }

    if (name.length > 200 || phone.length > 48 || email.length > 320 || requirement.length > 5000) {
      return NextResponse.json({ error: 'One or more fields are too long' }, { status: 400 });
    }

    await sendContactInquiryEmail(payload);
    await saveInquiry(payload);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/contact', error);
    return NextResponse.json(
      {
        error:
          'We could not send your enquiry. Please try again in a moment or contact us at tech@propelreadysolutions.in.',
      },
      { status: 503 }
    );
  }
}
