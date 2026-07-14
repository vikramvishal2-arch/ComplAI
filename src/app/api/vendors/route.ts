import { NextResponse } from 'next/server';
import { getVendors, createVendor } from '@/lib/db/vendor-repository';
import { refreshVendorInternetIntelligence } from '@/lib/db/vendor-intelligence';
import { formatVendorDbError } from '@/lib/db/prisma-errors';

function vendorDbErrorResponse(error: unknown) {
  const message = formatVendorDbError(error);
  if (message) {
    return NextResponse.json({ error: message }, { status: 503 });
  }
  return null;
}

export async function GET() {
  try {
    const vendors = await getVendors();
    return NextResponse.json({ vendors });
  } catch (error) {
    const response = vendorDbErrorResponse(error);
    if (response) return response;
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
      status: body.status,
      contactEmail: body.contactEmail,
      website: body.website,
      primaryDomain: body.primaryDomain,
      industry: body.industry,
      inherentRiskScore: body.inherentRiskScore,
      labels: Array.isArray(body.labels) ? body.labels : undefined,
    });

    // Correlate external intel into posture when a primary domain is present
    let intelligence: Awaited<ReturnType<typeof refreshVendorInternetIntelligence>> = null;
    if (vendor.primaryDomain?.trim()) {
      try {
        intelligence = await refreshVendorInternetIntelligence(vendor.id);
      } catch (intelError) {
        console.warn('POST /api/vendors — intelligence refresh after create failed', intelError);
      }
    }

    return NextResponse.json(
      {
        vendor: intelligence?.vendor ?? vendor,
        intelligence: intelligence
          ? {
              externalIntel: intelligence.externalIntel,
              breachIntel: intelligence.breachIntel,
              elastic: intelligence.elastic,
              refreshedAt: intelligence.refreshedAt,
            }
          : null,
      },
      { status: 201 }
    );
  } catch (error) {
    const response = vendorDbErrorResponse(error);
    if (response) return response;
    console.error('POST /api/vendors', error);
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 503 });
  }
}
