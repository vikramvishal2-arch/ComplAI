import { NextResponse } from 'next/server';
import { getVendorDetail, updateVendor, deleteVendor, updateVendorRemediation, updateVendorFindings } from '@/lib/db/vendor-repository';
import { formatVendorDbError } from '@/lib/db/prisma-errors';
import { parseFindings, parseRemediationItems } from '@/lib/vendor/vendor-assessment-types';

function vendorDbErrorResponse(error: unknown) {
  const message = formatVendorDbError(error);
  if (message) {
    return NextResponse.json({ error: message }, { status: 503 });
  }
  return null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const detail = await getVendorDetail(id);
    if (!detail) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }
    return NextResponse.json(detail);
  } catch (error) {
    const response = vendorDbErrorResponse(error);
    if (response) return response;
    console.error('GET /api/vendors/[id]', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.remediationUpdate && body.assessmentId) {
      const items = parseRemediationItems(body.remediationItems);
      await updateVendorRemediation(body.assessmentId, items);
      if (body.findings) {
        await updateVendorFindings(body.assessmentId, parseFindings(body.findings));
      }
      const detail = await getVendorDetail(id);
      return NextResponse.json(detail);
    }

    const vendor = await updateVendor(id, body);
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }
    const detail = await getVendorDetail(id);
    return NextResponse.json(detail);
  } catch (error) {
    console.error('PATCH /api/vendors/[id]', error);
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 503 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ok = await deleteVendor(id);
    if (!ok) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/vendors/[id]', error);
    return NextResponse.json({ error: 'Failed to delete vendor' }, { status: 503 });
  }
}
