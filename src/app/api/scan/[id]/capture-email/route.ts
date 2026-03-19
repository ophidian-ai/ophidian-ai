import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

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

  const { error } = await supabase
    .from('scans')
    .update({ email: email.trim().toLowerCase() })
    .eq('scan_id', id);

  if (error) {
    console.error('[capture-email] Supabase update error:', error);
    return NextResponse.json({ error: 'Failed to save email' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
