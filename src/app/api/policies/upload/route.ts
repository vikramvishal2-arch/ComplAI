import { after, NextResponse } from 'next/server';

import {

  createUploadedPolicy,

  updatePolicyFile,

  extractAndSavePolicyContent,

  runAndSavePolicyStandardsReview,

  getPolicyById,

} from '@/lib/db/policy-repository';

import { getDefaultOrganization } from '@/lib/db/repository';

import { savePolicyFileBuffer } from '@/lib/policies/storage';

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



    const mimeType = file.type || 'application/octet-stream';

    const buffer = Buffer.from(await file.arrayBuffer());



    const template = templateId ? getPolicyTemplate(templateId) : null;

    const policy = await createUploadedPolicy({

      title,

      categoryId,

      templateId,

      storagePath: '',

      originalFileName: file.name,

      mimeType,

      owner,

      isoReference: template?.isoReference ?? '',

    });



    const org = await getDefaultOrganization();

    const { storagePath } = await savePolicyFileBuffer(org.id, policy.id, buffer, file.name);



    const updated = await updatePolicyFile(policy.id, {

      storagePath,

      originalFileName: file.name,

      mimeType,

    });



    await extractAndSavePolicyContent(policy.id, {

      buffer,

      originalFileName: file.name,

      mimeType,

    });



    const refreshed = await getPolicyById(policy.id);



    after(async () => {

      try {

        await runAndSavePolicyStandardsReview(policy.id);

      } catch (error) {

        console.error('Background policy standards review failed', error);

      }

    });



    return NextResponse.json({ policy: refreshed ?? updated }, { status: 201 });

  } catch (error) {

    console.error('POST /api/policies/upload', error);

    const message = error instanceof Error ? error.message : 'Upload failed';

    return NextResponse.json({ error: message }, { status: 400 });

  }

}


