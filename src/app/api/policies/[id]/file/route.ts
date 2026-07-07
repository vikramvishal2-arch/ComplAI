import { after, NextResponse } from 'next/server';

import {

  getPolicyById,

  updatePolicyFile,

  extractAndSavePolicyContent,

  runAndSavePolicyStandardsReview,

} from '@/lib/db/policy-repository';

import { getDefaultOrganization } from '@/lib/db/repository';

import { savePolicyFileBuffer, deletePolicyFile } from '@/lib/policies/storage';



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



    const mimeType = file.type || 'application/octet-stream';

    const buffer = Buffer.from(await file.arrayBuffer());



    const org = await getDefaultOrganization();

    const { storagePath } = await savePolicyFileBuffer(org.id, policy.id, buffer, file.name);



    if (policy.storagePath) {

      await deletePolicyFile(policy.storagePath);

    }



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



    return NextResponse.json({ policy: refreshed ?? updated });

  } catch (error) {

    console.error('POST /api/policies/[id]/file', error);

    const message = error instanceof Error ? error.message : 'Upload failed';

    return NextResponse.json({ error: message }, { status: 400 });

  }

}


