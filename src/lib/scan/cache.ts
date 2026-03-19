/**
 * Scan Cache
 *
 * URL hashing and Supabase-backed cache layer for scan results.
 * Uses the admin (service role) client since this runs in API routes
 * where cookie-based auth is not available.
 */

import crypto from 'crypto';
import type { ScanResult } from './types';
import { getAdminClient } from '../supabase/admin';

// ---------------------------------------------------------------------------
// URL hashing
// ---------------------------------------------------------------------------

/**
 * Produce a deterministic SHA-256 hash for a URL after normalising it:
 *   1. Lowercase
 *   2. Strip "www." prefix from hostname
 *   3. Strip trailing slash
 */
export function hashUrl(url: string): string {
  let normalized = url.toLowerCase();

  // Strip www. prefix (works whether protocol is present or not)
  normalized = normalized.replace(/\/\/www\./, '//');

  // Strip trailing slash (but not the sole "/" of a bare origin)
  normalized = normalized.replace(/\/+$/, '');

  return crypto.createHash('sha256').update(normalized).digest('hex');
}

// ---------------------------------------------------------------------------
// Cache read
// ---------------------------------------------------------------------------

/**
 * Return a cached ScanResult if one exists for the given URL hash and is
 * younger than `maxAgeHours`.
 */
export async function getCachedScan(
  urlHash: string,
  maxAgeHours: number,
): Promise<ScanResult | null> {
  const supabase = getAdminClient();

  const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('scans')
    .select('result')
    .eq('url_hash', urlHash)
    .gte('created_at', cutoff)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[scan/cache] getCachedScan error:', error.message);
    return null;
  }

  if (!data?.result) return null;

  return data.result as ScanResult;
}

// ---------------------------------------------------------------------------
// Cache write
// ---------------------------------------------------------------------------

/**
 * Store a completed ScanResult in the `scans` table.
 */
export async function cacheScan(
  scanResult: ScanResult,
  urlHash: string,
): Promise<void> {
  const supabase = getAdminClient();

  const { error } = await supabase.from('scans').insert({
    scan_id: scanResult.scan_id,
    url: scanResult.url,
    url_hash: urlHash,
    overall_score: scanResult.overall_score,
    overall_grade: scanResult.overall_grade,
    estimated_monthly_leak: scanResult.estimated_monthly_leak,
    result: scanResult,
    created_at: scanResult.scanned_at,
  });

  if (error) {
    // Cache writes are non-critical -- log and continue
    console.error('[scan/cache] cacheScan error:', error.message);
  }
}
