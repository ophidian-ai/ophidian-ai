import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getAdminClient } from '@/lib/supabase/admin';
import { buildScanReportEmail } from '@/emails/scan-report';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: 'Missing scan ID' }, { status: 400 });
  }

  // 1. Fetch scan from Supabase
  const supabase = getAdminClient();

  const { data: scan, error: fetchError } = await supabase
    .from('scans')
    .select('scan_id, email, overall_score, overall_grade, estimated_monthly_leak, top_quick_wins')
    .eq('scan_id', id)
    .single();

  if (fetchError || !scan) {
    return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
  }

  // 2. Require an email on the scan
  if (!scan.email) {
    return NextResponse.json({ error: 'No email associated with this scan' }, { status: 400 });
  }

  // 3. Build the report URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://ophidianai.com';
  const reportUrl = `${baseUrl}/scan/${scan.scan_id}`;

  // 4. Extract quick win titles (top 3)
  const quickWins: string[] = Array.isArray(scan.top_quick_wins)
    ? (scan.top_quick_wins as Array<{ title?: string }>)
        .slice(0, 3)
        .map((w) => w?.title ?? '')
        .filter(Boolean)
    : [];

  // 5. Build the HTML email
  const emailHtml = buildScanReportEmail({
    score: scan.overall_score ?? 0,
    grade: scan.overall_grade ?? '-',
    monthlyLeak: scan.estimated_monthly_leak ?? 0,
    quickWins,
    reportUrl,
  });

  // 6. Send via Resend
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'OphidianAI <noreply@ophidianai.com>',
      to: scan.email,
      subject: 'Your Website Revenue Leak Report is Ready',
      html: emailHtml,
    });
  } catch (err) {
    console.error('[scan-email] Resend send error:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
