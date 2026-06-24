import { NextResponse } from 'next/server';

export function escapeCsvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function rowsToCsv(
  rows: Record<string, string | number | null | undefined>[]
): string {
  const headers = Object.keys(rows[0] ?? {});
  const lines = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((h) => escapeCsvCell(String(row[h] ?? ''))).join(',')
    ),
  ];
  return lines.join('\n');
}

export function csvDownloadResponse(csv: string, filename: string): NextResponse {
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
