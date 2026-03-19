'use client';

import { useState } from 'react';
import type { ModuleResult } from '@/lib/scan/types';

interface ModuleCardProps {
  name: string;
  result: ModuleResult;
}

const gradeColor = (grade: string) => {
  if (grade === 'A' || grade === 'B') return 'bg-green-500 text-white';
  if (grade === 'C') return 'bg-yellow-500 text-black';
  if (grade === 'D' || grade === 'F') return 'bg-red-500 text-white';
  return 'bg-slate-600 text-slate-300';
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
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl">{icon}</span>
          <h3 className="text-base font-semibold text-[#F1F5F9]">{displayName}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 text-slate-400 text-sm font-bold">
            -
          </span>
          <span className="text-sm text-slate-500">Could not check</span>
        </div>
        {result.error && (
          <p className="mt-2 text-xs text-slate-600">{result.error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <h3 className="text-base font-semibold text-[#F1F5F9]">{displayName}</h3>
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
          <span className="text-xs text-slate-500">Score</span>
          <span className="text-sm font-semibold text-[#F1F5F9]">
            {result.score !== null ? result.score : '--'}/100
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${result.score ?? 0}%`,
              background:
                (result.score ?? 0) >= 80
                  ? '#22c55e'
                  : (result.score ?? 0) >= 70
                    ? '#eab308'
                    : '#ef4444',
            }}
          />
        </div>
      </div>

      {/* Findings toggle */}
      {result.findings.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-[#0DB1B2] hover:text-[#0DB1B2]/80 transition-colors"
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
                <li key={f.id} className="flex items-start gap-2 text-xs text-slate-400">
                  <span
                    className={`mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full ${
                      f.severity === 'critical'
                        ? 'bg-red-500'
                        : f.severity === 'moderate'
                          ? 'bg-yellow-500'
                          : 'bg-slate-500'
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
