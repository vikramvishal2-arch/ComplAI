import { NextResponse } from 'next/server';
import {
  buildRiskRegisterImportTemplateCsv,
  importRiskRegisterFromCsv,
} from '@/lib/risk/import-register';
import { csvDownloadResponse } from '@/lib/csv';

export async function GET() {
  const csv = buildRiskRegisterImportTemplateCsv();
  return csvDownloadResponse(csv, 'risk-register-import-template.csv');
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') ?? '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');

      if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: 'CSV file is required' }, { status: 400 });
      }

      if (!file.name.toLowerCase().endsWith('.csv')) {
        return NextResponse.json({ error: 'Only .csv files are supported' }, { status: 400 });
      }

      const text = await file.text();
      const result = await importRiskRegisterFromCsv(text);
      return NextResponse.json(result);
    }

    const body = await request.json().catch(() => null);
    if (body && typeof body.csv === 'string') {
      const result = await importRiskRegisterFromCsv(body.csv);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: 'Upload a CSV file (multipart) or provide { csv: string } in JSON body' },
      { status: 400 }
    );
  } catch (error) {
    console.error('POST /api/risks/import', error);
    return NextResponse.json({ error: 'Failed to import risk register' }, { status: 503 });
  }
}
