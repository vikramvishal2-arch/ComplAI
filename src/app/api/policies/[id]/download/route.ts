import { NextResponse } from 'next/server';
import { getPolicyById } from '@/lib/db/policy-repository';
import { readPolicyFile } from '@/lib/policies/storage';
import {
  buildPolicyExportMarkdown,
  exportPolicyToDocxBuffer,
  policyDocxFileName,
} from '@/lib/policies/docx-export';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ id: string }> };
type DownloadFormat = 'docx' | 'md' | 'original';

function safeOriginalFileName(title: string, originalName?: string | null): string {
  if (originalName?.trim()) return originalName.trim();
  const base =
    title
      .trim()
      .replace(/[^\w\s.-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 80) || 'policy';
  return `${base}.pdf`;
}

function parseFormat(request: Request): DownloadFormat {
  const value = new URL(request.url).searchParams.get('format')?.toLowerCase();
  if (value === 'md' || value === 'original') return value;
  return 'docx';
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const policy = await getPolicyById(id);
    if (!policy) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    const format = parseFormat(request);
    const hasContent = policy.content.trim().length > 0;

    if (format === 'original' && policy.storagePath) {
      const buffer = await readPolicyFile(policy.storagePath);
      const fileName = safeOriginalFileName(policy.title, policy.originalFileName);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': policy.mimeType ?? 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
          'Content-Length': String(buffer.length),
        },
      });
    }

    if (format === 'md') {
      const markdown = buildPolicyExportMarkdown(policy);
      const buffer = Buffer.from(markdown, 'utf-8');
      const fileName = policyDocxFileName(policy.title).replace(/\.docx$/i, '.md');
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
          'Content-Length': String(buffer.length),
        },
      });
    }

    // Default: Word (.docx)
    if (hasContent) {
      const buffer = await exportPolicyToDocxBuffer(policy);
      const fileName = policyDocxFileName(policy.title);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
          'Content-Length': String(buffer.length),
        },
      });
    }

    if (policy.storagePath) {
      const buffer = await readPolicyFile(policy.storagePath);
      const fileName = safeOriginalFileName(policy.title, policy.originalFileName);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': policy.mimeType ?? 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
          'Content-Length': String(buffer.length),
        },
      });
    }

    const buffer = await exportPolicyToDocxBuffer(policy);
    const fileName = policyDocxFileName(policy.title);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': String(buffer.length),
      },
    });
  } catch (error) {
    console.error('GET /api/policies/[id]/download', error);
    return NextResponse.json({ error: 'Failed to download policy' }, { status: 503 });
  }
}
