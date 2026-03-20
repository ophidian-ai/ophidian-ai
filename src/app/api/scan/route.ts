import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { runScan } from '@/lib/scan/engine';
import type { ScanInput } from '@/lib/scan/types';

export const maxDuration = 60;

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!redis) {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (!url || !token) {
      console.warn('[scan/api] KV_REST_API_URL or KV_REST_API_TOKEN not set -- rate limiting disabled');
      return null;
    }
    redis = new Redis({ url, token });
  }
  return redis;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const t0 = Date.now();
  console.log('[scan/api] POST received');

  try {
    // 1. Auth check -- internal callers skip rate limiting
    const authHeader = request.headers.get('Authorization');
    const scanApiKey = process.env.SCAN_API_KEY;
    const isInternal = scanApiKey
      ? authHeader === `Bearer ${scanApiKey}`
      : false;

    // 2. Rate limiting (public only)
    if (!isInternal) {
      try {
        const client = getRedis();
        if (client) {
          const ip =
            request.headers.get('x-forwarded-for') ??
            request.headers.get('x-real-ip') ??
            'unknown';

          const hourKey = `scan:${ip}:hour`;
          const dayKey = `scan:${ip}:day`;

          const hourCount = await client.incr(hourKey);
          if (hourCount === 1) {
            await client.expire(hourKey, 3600);
          }

          const dayCount = await client.incr(dayKey);
          if (dayCount === 1) {
            await client.expire(dayKey, 86400);
          }

          if (hourCount > 5 || dayCount > 20) {
            console.log(`[scan/api] Rate limited: ip=${ip}, hour=${hourCount}, day=${dayCount}`);
            return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
          }
          console.log(`[scan/api] Rate limit OK: ip=${ip}, hour=${hourCount}, day=${dayCount} (+${Date.now() - t0}ms)`);
        }
      } catch (rateLimitErr) {
        // Rate limiter failure is non-critical -- allow the request through
        console.error('[scan/api] Rate limiter error (allowing request):', rateLimitErr);
      }
    } else {
      console.log('[scan/api] Internal caller -- skipping rate limit');
    }

    // 3. Input validation
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const { url, city_population, industry } = body as {
      url?: string;
      city_population?: number;
      industry?: string;
    };

    if (!url || !/^https?:\/\//i.test(url)) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const input: ScanInput = { url, city_population, industry };

    // 4. Run scan with hard deadline (return error before Vercel kills us at 60s)
    const HARD_DEADLINE_MS = 55_000;
    console.log(`[scan/api] Starting scan for: ${url} (+${Date.now() - t0}ms)`);

    const scanPromise = runScan(input);
    const deadlinePromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Scan exceeded 55s hard deadline')), HARD_DEADLINE_MS - (Date.now() - t0)),
    );

    const result = await Promise.race([scanPromise, deadlinePromise]);
    console.log(`[scan/api] Scan completed in ${Date.now() - t0}ms, score: ${result.overall_score}`);
    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    const elapsed = Date.now() - t0;
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error(`[scan/api] FATAL after ${elapsed}ms:`, message);
    if (stack) console.error(`[scan/api] Stack:`, stack);
    return NextResponse.json(
      { error: 'Scan failed', detail: message, elapsed_ms: elapsed },
      { status: 500 },
    );
  }
}
