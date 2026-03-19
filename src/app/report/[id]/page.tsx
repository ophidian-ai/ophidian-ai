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
    .select('results_json')
    .eq('scan_id', id)
    .single();

  const result = data?.results_json as ScanResult | null;
  const score = result?.overall_score ?? null;
  const description =
    score !== null
      ? `Your website scored ${score}/100. See your full revenue leak report and quick wins.`
      : 'See your full website revenue leak report and how to fix it.';

  return {
    title: 'Website Revenue Leak Report | OphidianAI',
    description,
  };
}

export default async function ReportPage({ params }: Props) {
  const { id } = await params;
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('scans')
    .select('results_json')
    .eq('scan_id', id)
    .single();

  if (error || !data?.results_json) {
    notFound();
  }

  const scanResult = data.results_json as ScanResult;

  // Track view — non-blocking
  supabase
    .from('scans')
    .update({ viewed_at: new Date().toISOString() })
    .eq('scan_id', id)
    .then(() => {});

  return <ReportView result={scanResult} />;
}
