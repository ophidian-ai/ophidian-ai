import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAdminClient } from '@/lib/supabase/admin';
import type { ScanResult } from '@/lib/scan/types';
import { ReportView } from '@/components/scan/ReportView';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = getAdminClient();

  const { data } = await supabase
    .from('scans')
    .select('result')
    .eq('scan_id', id)
    .single();

  const result = data?.result as ScanResult | null;
  const score = result?.overall_score ?? null;

  let domain = '';
  try {
    if (result?.url) domain = new URL(result.url).hostname.replace(/^www\./, '');
  } catch { /* ignore invalid URL */ }

  const title = domain
    ? `Website Report: ${domain} — ${result?.overall_grade ?? '?'} (${score ?? '?'}/100)`
    : 'Website Revenue Leak Report | OphidianAI';

  const description =
    score !== null && result
      ? `${domain || 'This site'} scored ${score}/100 and is leaking ~$${result.estimated_monthly_leak.toLocaleString()}/mo. See the full speed, SEO, mobile, and trust breakdown.`
      : 'See your full website revenue leak report and how to fix it.';

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function ReportPage({ params }: Props) {
  const { id } = await params;
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('scans')
    .select('result')
    .eq('scan_id', id)
    .single();

  if (error || !data?.result) {
    notFound();
  }

  const scanResult = data.result as ScanResult;

  // Track view — non-blocking
  supabase
    .from('scans')
    .update({ viewed_at: new Date().toISOString() })
    .eq('scan_id', id)
    .then(() => {});

  return <ReportView result={scanResult} />;
}
