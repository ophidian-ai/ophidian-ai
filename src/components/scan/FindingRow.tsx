import type { Finding } from '@/lib/scan/types';

interface FindingRowProps {
  finding: Finding;
}

const severityConfig = {
  critical: {
    label: 'Critical',
    classes: 'bg-red-500/20 text-red-400 border border-red-500/30',
  },
  moderate: {
    label: 'Moderate',
    classes: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  },
  minor: {
    label: 'Minor',
    classes: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
  },
};

export function FindingRow({ finding }: FindingRowProps) {
  const config = severityConfig[finding.severity];

  return (
    <div className="flex items-start gap-4 py-4 border-b border-white/[0.06] last:border-b-0">
      {/* Severity badge */}
      <span
        className={`shrink-0 mt-0.5 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.classes}`}
      >
        {config.label}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#F1F5F9] leading-snug">{finding.title}</p>
        <p className="mt-0.5 text-sm text-slate-400 leading-relaxed">{finding.description}</p>
        {finding.benchmark && (
          <p className="mt-1 text-xs text-slate-500">Benchmark: {finding.benchmark}</p>
        )}
      </div>

      {/* Revenue impact */}
      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-[#39FF14] whitespace-nowrap">
          ${finding.revenue_impact.toLocaleString()}/mo
        </p>
        <p className="text-xs text-slate-500">estimated leak</p>
      </div>
    </div>
  );
}
