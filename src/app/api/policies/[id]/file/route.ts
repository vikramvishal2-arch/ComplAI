import { NextResponse } from 'next/server';
import { getPolicyById, updatePolicyFile } from '@/lib/db/policy-repository';
import { getDefaultOrganization } from '@/lib/db/repository';
import { savePolicyFile, deletePolicyFile } from '@/lib/policies/storage';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const policy = await getPolicyById(id);
    if (!policy) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    const org = await getDefaultOrganization();
    const { storagePath } = await savePolicyFile(org.id, policy.id, file);

    if (policy.storagePath) {
      await deletePolicyFile(policy.storagePath);
    }

    const updated = await updatePolicyFile(policy.id, {
      storagePath,
      originalFileName: file.name,
      mimeType: file.type || 'application/octet-stream',
    });

    return NextResponse.json({ policy: updated });
  } catch (error) {
    console.error('POST /api/policies/[id]/file', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
