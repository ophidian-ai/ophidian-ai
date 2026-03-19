import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { generateReportPDF } from '@/lib/scan/report-pdf';
import type { ScanResult } from '@/lib/scan/types';

export const maxDuration = 60;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: 'Missing scan ID' }, { status: 400 });
  }

  // 1. Fetch scan from Supabase
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('scans')
    .select('result')
    .eq('scan_id', id)
    .maybeSingle();

  if (error) {
    console.error('[scan/pdf] Supabase error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch scan' }, { status: 500 });
  }

  if (!data?.result) {
    return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
  }

  const result = data.result as ScanResult;

  // 2. Generate PDF
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await generateReportPDF(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[scan/pdf] PDF generation failed:', message);
    return NextResponse.json({ error: 'PDF generation failed', detail: message }, { status: 500 });
  }

  // 3. Return PDF response
  return new NextResponse(pdfBuffer.buffer as ArrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="revenue-leak-report.pdf"',
      'Content-Length': String(pdfBuffer.length),
    },
  });
}
