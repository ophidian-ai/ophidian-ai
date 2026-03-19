/**
 * Revenue Leak Calculations
 *
 * Translates technical findings into estimated monthly revenue impact.
 * Used by scan modules and the orchestrator to populate `revenue_impact`
 * on each Finding and the `estimated_monthly_leak` on ScanResult.
 */

import type { Finding } from './types';
import { AVG_ORDER_VALUES, SEVERITY_WEIGHTS } from './benchmarks';

// ---------------------------------------------------------------------------
// Per-finding revenue impact
// ---------------------------------------------------------------------------

/**
 * Calculate the estimated monthly revenue impact for a single finding.
 *
 * Formula: monthlyVisitors × severityWeight × avgOrderValue
 *
 * @param finding         - The finding (only `severity` is used here).
 * @param monthlyVisitors - Estimated monthly visitors from estimateMonthlyVisitors().
 * @param industry        - Industry key matching AVG_ORDER_VALUES.
 * @returns Estimated monthly revenue lost, in USD (rounded to nearest integer).
 */
export function calculateFindingRevenue(
  finding: { severity: string },
  monthlyVisitors: number,
  industry: string,
): number {
  const weight = SEVERITY_WEIGHTS[finding.severity] ?? 0;
  const orderValue = AVG_ORDER_VALUES[industry] ?? AVG_ORDER_VALUES['default'];

  return Math.round(monthlyVisitors * weight * orderValue);
}

// ---------------------------------------------------------------------------
// Total revenue leak
// ---------------------------------------------------------------------------

/**
 * Sum the revenue impact across all findings for a scan.
 *
 * @param findings        - All findings from one or more scan modules.
 * @param monthlyVisitors - Estimated monthly visitors.
 * @param industry        - Industry key matching AVG_ORDER_VALUES.
 * @returns Total estimated monthly revenue leak, in USD.
 */
export function calculateTotalLeak(
  findings: Finding[],
  monthlyVisitors: number,
  industry: string,
): number {
  return findings.reduce(
    (sum, finding) => sum + calculateFindingRevenue(finding, monthlyVisitors, industry),
    0,
  );
}

// ---------------------------------------------------------------------------
// Quick wins
// ---------------------------------------------------------------------------

/**
 * Return the IDs of the highest-impact quick-win findings.
 *
 * Quick wins are prioritised first (quick_win === true), then sorted by
 * revenue_impact descending, then limited to topN results.
 *
 * @param findings - All findings to consider.
 * @param topN     - Maximum number of IDs to return.
 * @returns Array of finding IDs, length ≤ topN.
 */
export function pickQuickWins(findings: Finding[], topN: number): string[] {
  return findings
    .filter((f) => f.quick_win === true)
    .sort((a, b) => b.revenue_impact - a.revenue_impact)
    .slice(0, topN)
    .map((f) => f.id);
}
