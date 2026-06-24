import { NextResponse } from 'next/server';
import { createUploadedPolicy, updatePolicyFile } from '@/lib/db/policy-repository';
import { getDefaultOrganization } from '@/lib/db/repository';
import { savePolicyFile } from '@/lib/policies/storage';
import { getPolicyTemplate } from '@/lib/data/policy-templates';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const title = String(formData.get('title') ?? '').trim();
    const categoryId = String(formData.get('categoryId') ?? '').trim();
    const templateId = formData.get('templateId') ? String(formData.get('templateId')) : null;
    const owner = String(formData.get('owner') ?? '');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }
    if (!title || !categoryId) {
      return NextResponse.json({ error: 'title and categoryId are required' }, { status: 400 });
    }

    const template = templateId ? getPolicyTemplate(templateId) : null;
    const policy = await createUploadedPolicy({
      title,
      categoryId,
      templateId,
      storagePath: '',
      originalFileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      owner,
      isoReference: template?.isoReference ?? '',
    });

    const org = await getDefaultOrganization();
    const { storagePath } = await savePolicyFile(org.id, policy.id, file);

    const updated = await updatePolicyFile(policy.id, {
      storagePath,
      originalFileName: file.name,
      mimeType: file.type || 'application/octet-stream',
    });

    return NextResponse.json({ policy: updated }, { status: 201 });
  } catch (error) {
    console.error('POST /api/policies/upload', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
