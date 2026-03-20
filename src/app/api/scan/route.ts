import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { runScan } from '@/lib/scan/engine';
import type { ScanInput } from '@/lib/scan/types';

export const maxDuration = 60;

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }
  return redis;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Auth check -- internal callers skip rate limiting
  const authHeader = request.headers.get('Authorization');
  const scanApiKey = process.env.SCAN_API_KEY;
  const isInternal = scanApiKey
    ? authHeader === `Bearer ${scanApiKey}`
    : false;

  // 2. Rate limiting (public only)
  if (!isInternal) {
    const ip =
      request.headers.get('x-forwarded-for') ??
      request.headers.get('x-real-ip') ??
      'unknown';

    const client = getRedis();

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

    if (hourCount > 3 || dayCount > 10) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
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

  // 4. Run scan
  const startTime = Date.now();
  console.log(`[scan/api] Starting scan for: ${url}`);

  try {
    const result = await runScan(input);
    console.log(`[scan/api] Scan completed in ${Date.now() - startTime}ms, score: ${result.overall_score}`);
    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    const elapsed = Date.now() - startTime;
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error(`[scan/api] Scan failed after ${elapsed}ms:`, message);
    if (stack) console.error(`[scan/api] Stack:`, stack);
    return NextResponse.json(
      { error: 'Scan failed', detail: message, elapsed_ms: elapsed },
      { status: 500 },
    );
  }
}
