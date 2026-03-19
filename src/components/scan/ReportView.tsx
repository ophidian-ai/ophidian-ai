'use client';

import { useEffect, useRef, useState } from 'react';
import type { ScanResult, ModuleName } from '@/lib/scan/types';
import { ModuleCard } from './ModuleCard';
import { FindingRow } from './FindingRow';
import { QuickWins } from './QuickWins';
import { CTASection } from './CTASection';

interface ReportViewProps {
  result: ScanResult;
}

const gradeColor = (grade: string) => {
  if (grade === 'A' || grade === 'B') return '#22c55e';
  if (grade === 'C') return '#eab308';
  return '#ef4444';
};

const MODULE_ORDER: ModuleName[] = ['speed', 'seo', 'mobile', 'trust'];

function useCountUp(target: number, duration = 1500): number {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    startTime.current = null;

    const step = (timestamp: number) => {
      if (startTime.current === null) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        rafId.current = requestAnimationFrame(step);
      }
    };

    rafId.current = requestAnimationFrame(step);
    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [target, duration]);

  return count;
}

export function ReportView({ result }: ReportViewProps) {
  const score = result.overall_score ?? 0;
  const animatedScore = useCountUp(score);
  const color = gradeColor(result.overall_grade);

  const sortedFindings = [...result.findings].sort(
    (a, b) => b.revenue_impact - a.revenue_impact,
  );

  return (
    <div
      className="min-h-screen"
      style={{ background: '#0D1B2A', color: '#F1F5F9' }}
    >
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">

        {/* ── Header / Score Hero ─────────────────────────────────────── */}
        <div className="text-center space-y-4">
          <p className="text-sm font-medium tracking-widest uppercase text-[#0DB1B2]">
            Website Revenue Leak Report
          </p>
          <p className="text-slate-400 text-sm truncate">{result.url}</p>

          {/* Score + grade */}
          <div className="flex items-center justify-center gap-5 py-4">
            <span
              className="text-8xl font-black tabular-nums leading-none"
              style={{ color }}
            >
              {animatedScore}
            </span>
            <div className="flex flex-col items-start gap-2">
              <span
                className="inline-flex items-center justify-center w-14 h-14 rounded-full text-2xl font-black"
                style={{ background: color, color: '#fff' }}
              >
                {result.overall_grade}
              </span>
              <span className="text-xs text-slate-500">out of 100</span>
            </div>
          </div>

          {/* Revenue leak */}
          <p className="text-lg font-semibold">
            Your website is leaking an estimated{' '}
            <span className="text-2xl font-black" style={{ color: '#39FF14' }}>
              ${result.estimated_monthly_leak.toLocaleString()}
            </span>
            /month
          </p>

          <p className="text-slate-500 text-xs">
            Scanned {new Date(result.scanned_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* ── Module Breakdown ────────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-bold text-[#0DB1B2] mb-4">Module Breakdown</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MODULE_ORDER.map((mod) => (
              <ModuleCard key={mod} name={mod} result={result.modules[mod]} />
            ))}
          </div>
        </section>

        {/* ── Industry Benchmarks ─────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-bold text-[#0DB1B2] mb-4">Industry Benchmarks</h2>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-5 py-3 text-slate-400 font-medium">Metric</th>
                  <th className="text-right px-5 py-3 text-slate-400 font-medium">Industry Avg</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/[0.06]">
                  <td className="px-5 py-3 text-[#F1F5F9]">Avg Load Time</td>
                  <td className="px-5 py-3 text-right text-slate-300">
                    {result.industry_benchmarks.avg_load_time.toFixed(1)}s
                  </td>
                </tr>
                <tr className="border-b border-white/[0.06]">
                  <td className="px-5 py-3 text-[#F1F5F9]">Mobile-Friendly Sites</td>
                  <td className="px-5 py-3 text-right text-slate-300">
                    {result.industry_benchmarks.mobile_friendly_pct}%
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-3 text-[#F1F5F9]">Google Business Profile</td>
                  <td className="px-5 py-3 text-right text-slate-300">
                    {result.industry_benchmarks.gbp_presence_pct}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Revenue Impact ──────────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-bold text-[#0DB1B2] mb-1">Revenue Impact</h2>
          <p className="text-slate-500 text-sm mb-4">
            All findings sorted by estimated monthly revenue loss.
          </p>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-5">
            {sortedFindings.length === 0 ? (
              <p className="py-6 text-center text-slate-500 text-sm">No findings detected.</p>
            ) : (
              sortedFindings.map((finding) => (
                <FindingRow key={finding.id} finding={finding} />
              ))
            )}
          </div>
        </section>

        {/* ── Quick Wins ──────────────────────────────────────────────── */}
        <QuickWins findings={result.top_quick_wins} />

        {/* ── CTA ─────────────────────────────────────────────────────── */}
        <CTASection />
      </div>
    </div>
  );
}
