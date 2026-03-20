'use client';

import { useEffect, useRef, useState } from 'react';
import type { ScanResult } from '@/lib/scan/types';

interface ScoreRevealProps {
  result: ScanResult;
  onContinue: () => void;
}

const GRADE_COLORS: Record<string, string> = {
  A: '#7A9E7E',
  B: '#7A9E7E',
  C: '#C4A265',
  D: '#f97316',
  F: '#ef4444',
  '-': '#64748b',
};

function useCountUp(target: number, durationMs = 1800): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) return;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const ratio = Math.min(elapsed / durationMs, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - ratio, 3);
      setValue(Math.round(eased * target));
      if (ratio < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, durationMs]);

  return value;
}

function formatRevenue(amount: number): string {
  if (amount >= 1000) {
    return `$${Math.round(amount / 100) * 100 >= 1000 ? (Math.round(amount / 100) * 100).toLocaleString() : amount.toLocaleString()}`;
  }
  return `$${amount.toLocaleString()}`;
}

export function ScoreReveal({ result, onContinue }: ScoreRevealProps) {
  const score = result.overall_score ?? 0;
  const grade = result.overall_grade;
  const revenueLeaked = result.estimated_monthly_leak;

  const animatedScore = useCountUp(score);
  const animatedRevenue = useCountUp(revenueLeaked, 2200);

  const gradeColor = GRADE_COLORS[grade] ?? GRADE_COLORS['-'];

  return (
    <div className="w-full text-center">
      {/* Score display */}
      <div className="mb-6">
        <div className="relative inline-flex items-center justify-center mb-4">
          {/* Outer ring */}
          <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={gradeColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - animatedScore / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.1s linear' }}
            />
          </svg>
          {/* Score number centered over ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-foreground tabular-nums leading-none">
              {animatedScore}
            </span>
            <span className="text-sm text-foreground-dim mt-1">out of 100</span>
          </div>
        </div>

        {/* Grade badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border"
          style={{
            color: gradeColor,
            borderColor: `${gradeColor}40`,
            backgroundColor: `${gradeColor}15`,
          }}
        >
          Grade: {grade}
        </div>
      </div>

      {/* Revenue leak callout */}
      <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 px-6 py-5">
        <p className="text-sm text-foreground-muted mb-1 uppercase tracking-wider font-medium">
          Estimated revenue leak
        </p>
        <p className="text-4xl font-bold text-primary leading-none">
          {formatRevenue(animatedRevenue)}
          <span className="text-lg font-normal text-foreground-muted ml-1">/month</span>
        </p>
        <p className="text-sm text-foreground-dim mt-2">
          Based on your site issues and industry benchmarks
        </p>
      </div>

      {/* CTA */}
      <p className="text-base text-foreground-muted mb-6">
        Enter your email to see the full breakdown and how to fix it.
      </p>

      <button
        onClick={onContinue}
        className="w-full py-4 px-6 rounded-xl text-base font-semibold bg-primary text-background hover:bg-primary-light active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        Get My Free Report
      </button>
    </div>
  );
}
