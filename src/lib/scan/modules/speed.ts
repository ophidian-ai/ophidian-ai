/**
 * Speed Module
 *
 * Analyzes a site's Core Web Vitals and overall performance score using the
 * Google PageSpeed Insights API. Returns a ModuleResult with findings for
 * each metric that falls below acceptable thresholds.
 */

import { ModuleResult, Finding, scoreToGrade } from '../types';

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface PsiData {
  lighthouseResult?: {
    categories?: {
      performance?: {
        score?: number | null;
      };
    };
    audits?: {
      'largest-contentful-paint'?: { numericValue?: number };
      'cumulative-layout-shift'?: { numericValue?: number };
      'first-contentful-paint'?: { numericValue?: number };
      'total-blocking-time'?: { numericValue?: number };
      'speed-index'?: { numericValue?: number };
    };
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PSI_TIMEOUT_MS = 15_000;

// Thresholds that trigger findings
const THRESHOLDS = {
  PERFORMANCE_SCORE_CRITICAL: 50,  // < 50 = critical
  LCP_CRITICAL_MS: 4_000,          // > 4 s = critical
  CLS_MODERATE: 0.25,              // > 0.25 = moderate
  FCP_MODERATE_MS: 3_000,          // > 3 s = moderate
  TBT_MODERATE_MS: 600,            // > 600 ms = moderate
  SPEED_INDEX_MODERATE_MS: 5_000,  // > 5 s = moderate
} as const;

// ---------------------------------------------------------------------------
// PSI fetch
// ---------------------------------------------------------------------------

async function fetchPsi(url: string): Promise<PsiData> {
  const apiKey = process.env.GOOGLE_PSI_API_KEY;
  const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  endpoint.searchParams.set('url', url);
  endpoint.searchParams.set('category', 'performance');
  endpoint.searchParams.set('strategy', 'mobile');
  if (apiKey) {
    endpoint.searchParams.set('key', apiKey);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PSI_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint.toString(), { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`PSI API responded with HTTP ${response.status}`);
    }
    return (await response.json()) as PsiData;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Finding generators
// ---------------------------------------------------------------------------

function findingForPerformanceScore(score: number): Finding | null {
  if (score >= THRESHOLDS.PERFORMANCE_SCORE_CRITICAL) return null;

  return {
    id: 'speed-low-performance-score',
    module: 'speed',
    severity: 'critical',
    title: 'Slow Page Speed',
    description:
      `This site scores ${score}/100 on Google's performance test. Slow sites frustrate ` +
      'visitors and cause them to leave before making a purchase or inquiry -- directly ' +
      'costing the business leads.',
    revenue_impact: 0,
    benchmark: `Industry benchmark: 50+. Your score: ${score}.`,
    quick_win: false,
  };
}

function findingForLcp(lcpMs: number): Finding | null {
  if (lcpMs <= THRESHOLDS.LCP_CRITICAL_MS) return null;

  const lcpSec = (lcpMs / 1000).toFixed(1);
  return {
    id: 'speed-slow-lcp',
    module: 'speed',
    severity: 'critical',
    title: 'Slow Content Load',
    description:
      `The main content takes ${lcpSec}s to appear on screen. Google considers anything ` +
      'over 2.5s poor; visitors on mobile data often abandon pages before content loads, ' +
      'meaning real customers are bouncing before they ever see what the business offers.',
    revenue_impact: 0,
    benchmark: `Industry average: 2.5s, yours: ${lcpSec}s`,
    quick_win: true,
  };
}

function findingForCls(cls: number): Finding | null {
  if (cls <= THRESHOLDS.CLS_MODERATE) return null;

  const clsFormatted = cls.toFixed(3);
  return {
    id: 'speed-high-cls',
    module: 'speed',
    severity: 'moderate',
    title: 'Layout Shifts',
    description:
      `Elements on the page jump around while it loads (CLS score: ${clsFormatted}). ` +
      'This makes the site feel broken and can cause visitors to accidentally tap the ' +
      'wrong button, eroding trust and increasing bounce rate.',
    revenue_impact: 0,
    benchmark: `Good: < 0.1. Poor: > 0.25. Yours: ${clsFormatted}.`,
    quick_win: false,
  };
}

function findingForFcp(fcpMs: number): Finding | null {
  if (fcpMs <= THRESHOLDS.FCP_MODERATE_MS) return null;

  const fcpSec = (fcpMs / 1000).toFixed(1);
  return {
    id: 'speed-slow-fcp',
    module: 'speed',
    severity: 'moderate',
    title: 'Slow First Paint',
    description:
      `The browser takes ${fcpSec}s before it shows anything on screen. Visitors see a ` +
      'blank white page for several seconds, which commonly triggers an immediate back-button ' +
      'press -- lost traffic that never becomes a lead.',
    revenue_impact: 0,
    benchmark: `Good: < 1.8s. Poor: > 3.0s. Yours: ${fcpSec}s.`,
    quick_win: false,
  };
}

function findingForTbt(tbtMs: number): Finding | null {
  if (tbtMs <= THRESHOLDS.TBT_MODERATE_MS) return null;

  const tbtSec = (tbtMs / 1000).toFixed(2);
  return {
    id: 'speed-high-tbt',
    module: 'speed',
    severity: 'moderate',
    title: 'Blocked Interactivity',
    description:
      `The browser is blocked for ${tbtSec}s while JavaScript finishes loading. During ` +
      'this window, taps and clicks do nothing -- making the site feel frozen and causing ' +
      'visitors to give up before they can contact the business.',
    revenue_impact: 0,
    benchmark: `Good: < 200ms. Poor: > 600ms. Yours: ${tbtMs.toFixed(0)}ms.`,
    quick_win: false,
  };
}

function findingForSpeedIndex(siMs: number): Finding | null {
  if (siMs <= THRESHOLDS.SPEED_INDEX_MODERATE_MS) return null;

  const siSec = (siMs / 1000).toFixed(1);
  return {
    id: 'speed-slow-speed-index',
    module: 'speed',
    severity: 'moderate',
    title: 'Slow Visual Completion',
    description:
      `It takes ${siSec}s for the full page to be visually complete. Visitors are staring ` +
      'at a partially loaded page for an extended time, which signals an unprofessional site ' +
      'and reduces the chance they stay to explore the business.',
    revenue_impact: 0,
    benchmark: `Good: < 3.4s. Poor: > 5.8s. Yours: ${siSec}s.`,
    quick_win: false,
  };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function analyzeSpeed(url: string, psiData?: PsiData): Promise<ModuleResult> {
  try {
    const data = psiData ?? (await fetchPsi(url));

    const audits = data.lighthouseResult?.audits ?? {};
    const rawScore = data.lighthouseResult?.categories?.performance?.score;

    // PSI returns scores as 0-1; multiply to get 0-100
    const performanceScore =
      rawScore != null ? Math.round(rawScore * 100) : null;

    const lcpMs = audits['largest-contentful-paint']?.numericValue ?? null;
    const cls = audits['cumulative-layout-shift']?.numericValue ?? null;
    const fcpMs = audits['first-contentful-paint']?.numericValue ?? null;
    const tbtMs = audits['total-blocking-time']?.numericValue ?? null;
    const siMs = audits['speed-index']?.numericValue ?? null;

    const findings: Finding[] = [];

    if (performanceScore !== null) {
      const f = findingForPerformanceScore(performanceScore);
      if (f) findings.push(f);
    }
    if (lcpMs !== null) {
      const f = findingForLcp(lcpMs);
      if (f) findings.push(f);
    }
    if (cls !== null) {
      const f = findingForCls(cls);
      if (f) findings.push(f);
    }
    if (fcpMs !== null) {
      const f = findingForFcp(fcpMs);
      if (f) findings.push(f);
    }
    if (tbtMs !== null) {
      const f = findingForTbt(tbtMs);
      if (f) findings.push(f);
    }
    if (siMs !== null) {
      const f = findingForSpeedIndex(siMs);
      if (f) findings.push(f);
    }

    return {
      score: performanceScore,
      grade: scoreToGrade(performanceScore),
      status: 'ok',
      error: null,
      findings,
    };
  } catch (err: unknown) {
    const isAbort =
      err instanceof Error && err.name === 'AbortError';

    const message = isAbort
      ? 'Timeout'
      : err instanceof Error
        ? err.message
        : 'Unknown error';

    return {
      score: null,
      grade: '-',
      status: 'unavailable',
      error: message,
      findings: [],
    };
  }
}
