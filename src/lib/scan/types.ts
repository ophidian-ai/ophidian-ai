/**
 * Scan Types
 *
 * Foundation types for the SEO / site-health scan system.
 * Every scan module, API route, report page, and PDF generator imports from here.
 */

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/** The four scan modules that can be run against a prospect's site. */
export type ModuleName = 'speed' | 'seo' | 'mobile' | 'trust';

/** Finding severity levels, ordered from most to least impactful. */
export type Severity = 'critical' | 'moderate' | 'minor';

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

/** Parameters required to kick off a scan. */
export interface ScanInput {
  /** Fully-qualified URL of the site to scan (e.g. "https://example.com"). */
  url: string;
  /** Approximate population of the city the business operates in. Used for revenue-impact math. */
  city_population?: number;
  /** Industry vertical (e.g. "restaurant", "hvac", "dental"). Used for benchmark comparison. */
  industry?: string;
}

// ---------------------------------------------------------------------------
// Findings
// ---------------------------------------------------------------------------

/**
 * A single actionable issue discovered during a scan.
 * Each finding maps to exactly one module and carries its own revenue-impact estimate.
 */
export interface Finding {
  /** Stable, human-readable identifier for deduplication and analytics (e.g. "speed_lcp_slow"). */
  id: string;
  /** Which scan module produced this finding. */
  module: ModuleName;
  /** How severely this issue affects the site's performance or trustworthiness. */
  severity: Severity;
  /** Short, plain-language title shown in reports (e.g. "Slow page load"). */
  title: string;
  /** One- or two-sentence explanation of the problem and why it matters. */
  description: string;
  /**
   * Estimated monthly revenue lost because of this issue, in USD.
   * Calculated from city_population, industry conversion rates, and severity weights.
   */
  revenue_impact: number;
  /** Industry-average or best-practice reference (e.g. "Top sites load in < 2.5 s"). */
  benchmark: string;
  /** True when this finding can be addressed quickly with low effort and high ROI. */
  quick_win: boolean;
}

// ---------------------------------------------------------------------------
// Module results
// ---------------------------------------------------------------------------

/**
 * Aggregated result for a single scan module (speed, seo, mobile, or trust).
 */
export interface ModuleResult {
  /**
   * Numeric score 0–100, or null when the module could not run
   * (e.g. the site was unreachable or the third-party API was unavailable).
   */
  score: number | null;
  /** Letter grade derived from score via scoreToGrade(). */
  grade: string;
  /** Whether the module ran successfully or was skipped/errored. */
  status: 'ok' | 'unavailable';
  /** Human-readable error message when status === 'unavailable', otherwise null. */
  error: string | null;
  /** All findings produced by this module, sorted by revenue_impact descending. */
  findings: Finding[];
}

// ---------------------------------------------------------------------------
// Industry benchmarks
// ---------------------------------------------------------------------------

/** Industry-level averages used for contextual comparison in reports. */
export interface IndustryBenchmarks {
  /** Median page load time for this industry in seconds. */
  avg_load_time: number;
  /** Percentage of sites in this industry that pass mobile-friendly checks (0–100). */
  mobile_friendly_pct: number;
  /** Percentage of sites in this industry that have a Google Business Profile (0–100). */
  gbp_presence_pct: number;
}

// ---------------------------------------------------------------------------
// Top-level scan result
// ---------------------------------------------------------------------------

/**
 * Complete result object produced after all four modules have run.
 * This is the canonical data shape stored, returned from the API, and consumed by the report.
 */
export interface ScanResult {
  /** UUID assigned at scan creation time. */
  scan_id: string;
  /** The URL that was scanned. */
  url: string;
  /** ISO 8601 timestamp of when the scan completed. */
  scanned_at: string;
  /**
   * Weighted composite score across all modules (0–100), or null if no module
   * returned a valid score.
   */
  overall_score: number | null;
  /** Letter grade for the overall score via scoreToGrade(). */
  overall_grade: string;
  /**
   * Total estimated monthly revenue being lost across all findings, in USD.
   * Sum of revenue_impact for every Finding in every module.
   */
  estimated_monthly_leak: number;
  /** Per-module results keyed by ModuleName. */
  modules: Record<ModuleName, ModuleResult>;
  /** All findings from all modules, flattened into a single list. */
  findings: Finding[];
  /**
   * Subset of findings where quick_win === true, sorted by revenue_impact descending.
   * Capped at the top 3 for the executive summary section of the report.
   */
  top_quick_wins: Finding[];
  /** Benchmark figures for the scanned site's industry. */
  industry_benchmarks: IndustryBenchmarks;
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/**
 * Convert a numeric score (0–100) to a letter grade.
 * Returns '-' when the score is null (module unavailable).
 *
 * @param score - Numeric score 0–100, or null.
 * @returns Letter grade: 'A' | 'B' | 'C' | 'D' | 'F' | '-'
 */
export function scoreToGrade(score: number | null): string {
  if (score === null) return '-';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}
