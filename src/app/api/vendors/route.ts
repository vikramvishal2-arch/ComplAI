import { NextResponse } from 'next/server';
import { getVendors, createVendor } from '@/lib/db/vendor-repository';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const vendors = await getVendors();
    return NextResponse.json({ vendors });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      return NextResponse.json(
        { error: 'Vendor tables missing. Run `npm run db:push` in the project folder, then refresh.' },
        { status: 503 }
      );
    }
    console.error('GET /api/vendors', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Vendor name is required' }, { status: 400 });
    }

    const vendor = await createVendor({
      name: body.name,
      description: body.description,
      tier: body.tier,
      dataAccess: body.dataAccess,
      contactEmail: body.contactEmail,
      website: body.website,
      inherentRiskScore: body.inherentRiskScore,
    });

    return NextResponse.json({ vendor }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      return NextResponse.json(
        { error: 'Vendor tables missing. Run `npm run db:push` in the project folder, then refresh.' },
        { status: 503 }
      );
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        { error: 'Run `npm run db:push` after schema changes.' },
        { status: 503 }
      );
    }
    console.error('POST /api/vendors', error);
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 503 });
  }
}
