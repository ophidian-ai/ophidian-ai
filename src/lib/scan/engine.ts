/**
 * Scan Engine Orchestrator
 *
 * Ties together all four scan modules (speed, seo, mobile, trust), the
 * Firecrawl HTML fetcher, PageSpeed Insights, the revenue calculator, and
 * the Supabase cache layer into a single `runScan()` entry point.
 */

import crypto from 'crypto';
import type {
  ScanInput,
  ScanResult,
  ModuleName,
  ModuleResult,
  Finding,
} from './types';
import { scoreToGrade } from './types';
import { hashUrl, getCachedScan, cacheScan } from './cache';
import { analyzeSpeed } from './modules/speed';
import { analyzeSEO } from './modules/seo';
import { analyzeMobile } from './modules/mobile';
import { analyzeTrust } from './modules/trust';
import { calculateFindingRevenue, pickQuickWins } from './revenue';
import { estimateMonthlyVisitors, INDUSTRY_BENCHMARKS } from './benchmarks';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOTAL_TIMEOUT_MS = 45_000;
const MODULE_TIMEOUT_MS = 15_000;
const DEFAULT_CACHE_MAX_AGE_HOURS = 24;
const DEFAULT_CITY_POPULATION = 50_000;
const PLACEHOLDER_HTML_THRESHOLD = 500;

/** Module weights for the composite score. */
const MODULE_WEIGHTS: Record<ModuleName, number> = {
  speed: 0.3,
  seo: 0.25,
  mobile: 0.25,
  trust: 0.2,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Race a promise against a timeout. Rejects with an Error if the timeout
 * fires first.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

/**
 * Normalise a user-supplied URL:
 *   - lowercase
 *   - ensure https:// protocol if none provided
 *   - strip trailing slash
 */
function normalizeUrl(raw: string): string {
  let url = raw.trim().toLowerCase();

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  // Strip trailing slash (but not the sole "/" in "https://example.com/")
  url = url.replace(/\/+$/, '');

  return url;
}

/**
 * Build an "unavailable" ModuleResult for a module that failed or timed out.
 */
function unavailableModule(errorMessage: string): ModuleResult {
  return {
    score: null,
    grade: '-',
    status: 'unavailable',
    error: errorMessage,
    findings: [],
  };
}

// ---------------------------------------------------------------------------
// Firecrawl HTML fetch
// ---------------------------------------------------------------------------

interface FirecrawlResponse {
  success?: boolean;
  data?: {
    html?: string;
    metadata?: {
      sourceURL?: string;
    };
  };
  error?: string;
}

async function fetchHtml(
  url: string,
  signal: AbortSignal,
): Promise<{ html: string; finalUrl: string } | null> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    console.error('[scan/engine] FIRECRAWL_API_KEY is not set');
    return null;
  }

  try {
    const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, formats: ['html'] }),
      signal,
    });

    if (!res.ok) {
      console.error(`[scan/engine] Firecrawl HTTP ${res.status}`);
      return null;
    }

    const json = (await res.json()) as FirecrawlResponse;

    if (!json.success || !json.data?.html) {
      console.error('[scan/engine] Firecrawl returned no HTML:', json.error ?? 'empty');
      return null;
    }

    return {
      html: json.data.html,
      finalUrl: json.data.metadata?.sourceURL ?? url,
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.error('[scan/engine] Firecrawl fetch aborted (timeout)');
    } else {
      console.error('[scan/engine] Firecrawl fetch failed:', err);
    }
    return null;
  }
}

// ---------------------------------------------------------------------------
// PageSpeed Insights fetch
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
async function fetchPsi(url: string, signal: AbortSignal): Promise<any | null> {
  const apiKey = process.env.GOOGLE_PSI_API_KEY;
  const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  endpoint.searchParams.set('url', url);
  endpoint.searchParams.set('category', 'performance');
  endpoint.searchParams.set('strategy', 'mobile');
  if (apiKey) {
    endpoint.searchParams.set('key', apiKey);
  }

  try {
    const res = await fetch(endpoint.toString(), { signal });
    if (!res.ok) {
      console.error(`[scan/engine] PSI HTTP ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.error('[scan/engine] PSI fetch aborted (timeout)');
    } else {
      console.error('[scan/engine] PSI fetch failed:', err);
    }
    return null;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function runScan(input: ScanInput): Promise<ScanResult> {
  const t0 = Date.now();
  const log = (step: string) => console.log(`[scan/engine] ${step} (+${Date.now() - t0}ms)`);

  // 1. Total-timeout abort controller
  const controller = new AbortController();
  const totalTimer = setTimeout(() => controller.abort(), TOTAL_TIMEOUT_MS);

  try {
    // 2. Validate and normalise URL
    const url = normalizeUrl(input.url);
    log(`Normalized URL: ${url}`);

    // 3. Check cache
    const urlHash = hashUrl(url);
    const maxCacheAge = DEFAULT_CACHE_MAX_AGE_HOURS;
    const cached = await getCachedScan(urlHash, maxCacheAge);
    if (cached) { log('Cache hit -- returning cached result'); return cached; }
    log('Cache miss -- running fresh scan');

    // 4. Generate scan ID
    const scanId = crypto.randomUUID();

    // 5. Fetch HTML and PSI data in parallel
    log('Starting parallel fetch: Firecrawl + PSI');
    const [crawlSettled, psiSettled] = await Promise.allSettled([
      fetchHtml(url, controller.signal),
      fetchPsi(url, controller.signal),
    ]);

    const crawlResult = crawlSettled.status === 'fulfilled' ? crawlSettled.value : null;
    const psiData = psiSettled.status === 'fulfilled' ? psiSettled.value : null;
    log(`Firecrawl: ${crawlResult ? `OK (${crawlResult.html.length} chars)` : `FAILED (${crawlSettled.status === 'rejected' ? crawlSettled.reason : 'null'})`}`);
    log(`PSI: ${psiData ? 'OK' : `FAILED (${psiSettled.status === 'rejected' ? psiSettled.reason : 'null'})`}`);

    if (!crawlResult) {
      // Site unreachable -- return early with no module scores
      const unreachableResult: ScanResult = {
        scan_id: scanId,
        url,
        scanned_at: new Date().toISOString(),
        overall_score: null,
        overall_grade: '-',
        estimated_monthly_leak: 0,
        modules: {
          speed: unavailableModule('Site unreachable'),
          seo: unavailableModule('Site unreachable'),
          mobile: unavailableModule('Site unreachable'),
          trust: unavailableModule('Site unreachable'),
        },
        findings: [],
        top_quick_wins: [],
        industry_benchmarks: INDUSTRY_BENCHMARKS,
      };
      await cacheScan(unreachableResult, urlHash);
      return unreachableResult;
    }

    const { html, finalUrl } = crawlResult;

    // Edge case: parked / placeholder domain
    const isPlaceholder = html.length < PLACEHOLDER_HTML_THRESHOLD;

    // Use the final URL (after redirects) for module analysis.
    // PSI was already called with the original URL above; PSI follows redirects internally.
    const analysisUrl = finalUrl;

    // 6. Run all four modules concurrently
    log('Starting 4 analysis modules in parallel');
    const moduleNames: ModuleName[] = ['speed', 'seo', 'mobile', 'trust'];
    const results = await Promise.allSettled([
      withTimeout(analyzeSpeed(analysisUrl, psiData ?? undefined), MODULE_TIMEOUT_MS),
      withTimeout(analyzeSEO(analysisUrl, html), MODULE_TIMEOUT_MS),
      withTimeout(analyzeMobile(analysisUrl, html, psiData ?? undefined), MODULE_TIMEOUT_MS),
      withTimeout(analyzeTrust(analysisUrl, html), MODULE_TIMEOUT_MS),
    ]);
    log(`Modules complete: ${results.map((r, i) => `${moduleNames[i]}=${r.status}`).join(', ')}`);

    // 7. Extract module results
    const modules: Record<ModuleName, ModuleResult> = {
      speed: unavailableModule('Not run'),
      seo: unavailableModule('Not run'),
      mobile: unavailableModule('Not run'),
      trust: unavailableModule('Not run'),
    };

    for (let i = 0; i < moduleNames.length; i++) {
      const result = results[i];
      if (result.status === 'fulfilled') {
        modules[moduleNames[i]] = result.value;
      } else {
        const errMsg = result.reason instanceof Error
          ? result.reason.message
          : 'Unknown module error';
        modules[moduleNames[i]] = unavailableModule(errMsg);
      }
    }

    // 8. Collect all findings
    const allFindings: Finding[] = [];
    for (const name of moduleNames) {
      allFindings.push(...modules[name].findings);
    }

    // 9. Calculate revenue impact per finding
    const cityPopulation = input.city_population ?? DEFAULT_CITY_POPULATION;
    const industry = input.industry ?? 'default';
    const monthlyVisitors = estimateMonthlyVisitors(cityPopulation, industry);

    for (const finding of allFindings) {
      finding.revenue_impact = calculateFindingRevenue(finding, monthlyVisitors, industry);
    }

    // 10. Calculate overall score (weighted average of available modules)
    let weightedSum = 0;
    let totalWeight = 0;

    for (const name of moduleNames) {
      const mod = modules[name];
      if (mod.status === 'ok' && mod.score !== null) {
        weightedSum += mod.score * MODULE_WEIGHTS[name];
        totalWeight += MODULE_WEIGHTS[name];
      }
    }

    const overallScore = totalWeight > 0
      ? Math.round(weightedSum / totalWeight)
      : null;

    // 11. Pick top 3 quick wins
    const quickWinIds = pickQuickWins(allFindings, 3);
    const topQuickWins = quickWinIds
      .map((id) => allFindings.find((f) => f.id === id))
      .filter((f): f is Finding => f !== undefined);

    // 12. Calculate total estimated monthly leak
    const estimatedMonthlyLeak = allFindings.reduce(
      (sum, f) => sum + f.revenue_impact,
      0,
    );

    // 13. Assemble the scan result
    const scanResult: ScanResult = {
      scan_id: scanId,
      url: analysisUrl,
      scanned_at: new Date().toISOString(),
      overall_score: isPlaceholder ? Math.min(overallScore ?? 0, 25) : overallScore,
      overall_grade: isPlaceholder
        ? scoreToGrade(Math.min(overallScore ?? 0, 25))
        : scoreToGrade(overallScore),
      estimated_monthly_leak: estimatedMonthlyLeak,
      modules,
      findings: allFindings,
      top_quick_wins: topQuickWins,
      industry_benchmarks: INDUSTRY_BENCHMARKS,
    };

    // 14. Cache the result
    log('Caching result to Supabase');
    await cacheScan(scanResult, urlHash);

    // 15. Return
    log(`Scan complete. Score: ${scanResult.overall_score}, Findings: ${allFindings.length}`);
    return scanResult;
  } finally {
    clearTimeout(totalTimer);
  }
}
