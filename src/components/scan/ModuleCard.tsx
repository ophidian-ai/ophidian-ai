'use client';

import { useState } from 'react';
import type { ModuleResult } from '@/lib/scan/types';

interface ModuleCardProps {
  name: string;
  result: ModuleResult;
}

const gradeColor = (grade: string) => {
  if (grade === 'A' || grade === 'B') return 'bg-accent text-background';
  if (grade === 'C') return 'bg-primary text-background';
  if (grade === 'D') return 'bg-[var(--color-warning)] text-white';
  if (grade === 'F') return 'bg-[var(--color-error)] text-white';
  return 'bg-surface text-foreground-muted';
};

const scoreBarClass = (score: number) => {
  if (score >= 80) return 'bg-accent';
  if (score >= 70) return 'bg-primary';
  return 'bg-[var(--color-error)]';
};

const moduleDisplayNames: Record<string, string> = {
  speed: 'Page Speed',
  seo: 'SEO',
  mobile: 'Mobile',
  trust: 'Trust & Credibility',
};

const moduleIcons: Record<string, string> = {
  speed: '⚡',
  seo: '🔍',
  mobile: '📱',
  trust: '🛡',
};

export function ModuleCard({ name, result }: ModuleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const displayName = moduleDisplayNames[name] ?? name;
  const icon = moduleIcons[name] ?? '●';

  if (result.status === 'unavailable') {
    return (
      <div className="rounded-xl border border-surface-border bg-white/3 p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl">{icon}</span>
          <h3 className="text-base font-semibold text-foreground">{displayName}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface text-foreground-muted text-sm font-bold">
            -
          </span>
          <span className="text-sm text-foreground-dim">Could not check</span>
        </div>
        {result.error && (
          <p className="mt-2 text-xs text-foreground-dim">{result.error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-surface-border bg-white/3 p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <h3 className="text-base font-semibold text-foreground">{displayName}</h3>
        </div>
        <span
          className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold ${gradeColor(result.grade)}`}
        >
          {result.grade}
        </span>
      </div>

      {/* Score bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-foreground-dim">Score</span>
          <span className="text-sm font-semibold text-foreground">
            {result.score !== null ? result.score : '--'}/100
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${scoreBarClass(result.score ?? 0)}`}
            style={{ width: `${result.score ?? 0}%` }}
          />
        </div>
      </div>

      {/* Findings toggle */}
      {result.findings.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-accent hover:text-primary transition-colors"
          >
            <span
              className="inline-block transition-transform duration-200"
              style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
            >
              ▶
            </span>
            {result.findings.length} finding{result.findings.length !== 1 ? 's' : ''}
          </button>

          {expanded && (
            <ul className="mt-2 space-y-1.5">
              {result.findings.map((f) => (
                <li key={f.id} className="flex items-start gap-2 text-xs text-foreground-muted">
                  <span
                    className={`mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full ${
                      f.severity === 'critical'
                        ? 'bg-[var(--color-error)]'
                        : f.severity === 'moderate'
                          ? 'bg-primary'
                          : 'bg-foreground-dim'
                    }`}
                  />
                  <span>{f.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
