import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { notifyAdmins } from '@/lib/notifications';
import type { ScanResult } from '@/lib/scan/types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: 'Missing scan ID' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { email } = body as { email?: string };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const supabase = getAdminClient();

  const { data: scanRow, error } = await supabase
    .from('scans')
    .update({ email: email.trim().toLowerCase() })
    .eq('scan_id', id)
    .select('result')
    .single();

  if (error) {
    console.error('[capture-email] Supabase update error:', error);
    return NextResponse.json({ error: 'Failed to save email' }, { status: 500 });
  }

  // Notify admins — non-blocking, best-effort
  try {
    const result = scanRow?.result as ScanResult | null;
    const score = result?.overall_score ?? '?';
    const leak = result?.estimated_monthly_leak
      ? `$${result.estimated_monthly_leak.toLocaleString()}/mo`
      : 'unknown';
    const url = result?.url ?? 'unknown';

    await notifyAdmins({
      type: 'scan_lead',
      title: `New scan lead — ${email.trim().toLowerCase()}`,
      message: `${url} · Score: ${score}/100 · Revenue leak: ${leak}`,
      link: `/report/${id}`,
    });
  } catch (notifyErr) {
    console.error('[capture-email] Admin notify error (non-fatal):', notifyErr);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
