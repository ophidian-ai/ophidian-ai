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
    classes: 'bg-primary/20 text-primary border border-primary/30',
  },
  minor: {
    label: 'Minor',
    classes: 'bg-foreground-muted/20 text-foreground-muted border border-foreground-muted/30',
  },
};

export function FindingRow({ finding }: FindingRowProps) {
  const config = severityConfig[finding.severity];

  return (
    <div className="flex items-start gap-4 py-4 border-b border-surface-border last:border-b-0">
      {/* Severity badge */}
      <span
        className={`shrink-0 mt-0.5 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.classes}`}
      >
        {config.label}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground leading-snug">{finding.title}</p>
        <p className="mt-0.5 text-sm text-foreground-muted leading-relaxed">{finding.description}</p>
        {finding.benchmark && (
          <p className="mt-1 text-xs text-foreground-dim">Benchmark: {finding.benchmark}</p>
        )}
      </div>

      {/* Revenue impact */}
      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-primary whitespace-nowrap">
          ${finding.revenue_impact.toLocaleString()}/mo
        </p>
        <p className="text-xs text-foreground-dim">estimated leak</p>
      </div>
    </div>
  );
}
