import { Redis } from "@upstash/redis";
import { createClient } from "@/lib/supabase/server";
import type { ReviewConfig } from "@/lib/supabase/review-types";

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

function cacheKey(slug: string): string {
  return `review:config:${slug}`;
}

export async function loadReviewConfig(slug: string): Promise<ReviewConfig | null> {
  const client = getRedis();
  const key = cacheKey(slug);

  // Check cache first
  const cached = await client.get<string>(key);
  if (cached !== null) {
    const config: ReviewConfig =
      typeof cached === "string" ? JSON.parse(cached) : cached;
    return config;
  }

  // Cache miss -- query Supabase (join clients table by slug)
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("review_configs")
    .select("*, clients!inner(slug)")
    .eq("clients.slug", slug)
    .eq("active", true)
    .single();

  if (error || !data) {
    return null;
  }

  // Strip the joined clients field before caching
  const { clients: _clients, ...config } = data as ReviewConfig & { clients: unknown };

  // Cache with 300s TTL
  await client.set(key, JSON.stringify(config), { ex: 300 });

  return config as ReviewConfig;
}

export async function invalidateReviewConfigCache(slug: string): Promise<void> {
  const client = getRedis();
  await client.del(cacheKey(slug));
}
