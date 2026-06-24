import { NextResponse } from 'next/server';
import { getVendorById, updateVendor, deleteVendor } from '@/lib/db/vendor-repository';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const vendor = await getVendorById(id);
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }
    return NextResponse.json({ vendor });
  } catch (error) {
    console.error('GET /api/vendors/[id]', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const vendor = await updateVendor(id, body);
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }
    return NextResponse.json({ vendor });
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
