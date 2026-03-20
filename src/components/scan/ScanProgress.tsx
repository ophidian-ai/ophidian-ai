'use client';

import { useEffect, useState } from 'react';

const SCAN_MODULES = [
  'Checking speed...',
  'Analyzing SEO...',
  'Testing mobile...',
  'Evaluating trust signals...',
];

const MICRO_STATS = [
  '53% of users leave a site that takes over 3 seconds to load.',
  'A 1-second delay in page load reduces conversions by 7%.',
  'Mobile accounts for over 60% of web traffic.',
  'Sites without HTTPS lose trust signals and SEO ranking.',
  'Missing meta descriptions reduce click-through rates by up to 6%.',
  'Google penalizes sites that are not mobile-friendly.',
  '88% of consumers trust online reviews as much as personal recommendations.',
  'Slow sites cost U.S. retailers $2.6 billion in lost sales annually.',
];

const STEP_DURATION_MS = 5000;
const STAT_INTERVAL_MS = 4000;

export function ScanProgress() {
  const [moduleIndex, setModuleIndex] = useState(0);
  const [statIndex, setStatIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [statVisible, setStatVisible] = useState(true);

  // Advance module label every STEP_DURATION_MS
  useEffect(() => {
    const interval = setInterval(() => {
      setModuleIndex((prev) => (prev + 1) % SCAN_MODULES.length);
    }, STEP_DURATION_MS);
    return () => clearInterval(interval);
  }, []);

  // Cycle micro-stats with a fade transition
  useEffect(() => {
    const interval = setInterval(() => {
      setStatVisible(false);
      setTimeout(() => {
        setStatIndex((prev) => (prev + 1) % MICRO_STATS.length);
        setStatVisible(true);
      }, 300);
    }, STAT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // Animate progress bar up to ~90% (the API completes the rest)
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const target = 90;
    const duration = 25000; // 25 s to reach 90%

    function tick(now: number) {
      const elapsed = now - start;
      const ratio = Math.min(elapsed / duration, 1);
      // Ease out: fast at first, slow near the end
      const eased = 1 - Math.pow(1 - ratio, 3);
      setProgress(Math.round(eased * target));
      if (ratio < 1) {
        raf = requestAnimationFrame(tick);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="w-full text-center">
      {/* Spinner */}
      <div className="flex justify-center mb-8">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-surface-border" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        </div>
      </div>

      {/* Module label */}
      <p className="text-xl font-semibold text-foreground mb-2 min-h-7">
        {SCAN_MODULES[moduleIndex]}
      </p>

      {/* Progress bar */}
      <div className="w-full bg-surface-border rounded-full h-2 mb-3 overflow-hidden">
        <div
          className="h-2 rounded-full bg-primary transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-sm text-foreground-dim mb-10">{progress}% complete — this takes 15-30 seconds</p>

      {/* Micro-stat */}
      <div
        className="mx-auto max-w-sm rounded-xl border border-surface-border bg-white/3 px-5 py-4 transition-opacity duration-300"
        style={{ opacity: statVisible ? 1 : 0 }}
      >
        <p className="text-sm text-foreground-muted leading-relaxed italic">
          &ldquo;{MICRO_STATS[statIndex]}&rdquo;
        </p>
      </div>
    </div>
  );
}
