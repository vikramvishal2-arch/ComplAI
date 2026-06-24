import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export type ContactInquiryPayload = {
  name: string;
  phone: string;
  email: string;
  requirement: string;
};

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

    if (name.length > 200 || phone.length > 40 || email.length > 320 || requirement.length > 5000) {
      return NextResponse.json({ error: 'One or more fields are too long' }, { status: 400 });
    }

    await prisma.contactInquiry.create({
      data: { name, phone, email, requirement },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/contact', error);
    return NextResponse.json(
      { error: 'Unable to save your enquiry. Please try again later.' },
      { status: 503 }
    );
  }
}
