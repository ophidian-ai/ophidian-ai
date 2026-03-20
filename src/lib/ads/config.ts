import { Redis } from "@upstash/redis";
import { createClient } from "@/lib/supabase/server";
import type { AdConfig } from "@/lib/supabase/ad-types";

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
  return `ads:config:${slug}`;
}

export async function loadAdConfig(slug: string): Promise<AdConfig | null> {
  const client = getRedis();
  const key = cacheKey(slug);

  const cached = await client.get<string>(key);
  if (cached !== null) {
    const config: AdConfig =
      typeof cached === "string" ? JSON.parse(cached) : cached;
    return config;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ad_configs")
    .select("*, clients!inner(slug)")
    .eq("clients.slug", slug)
    .eq("active", true)
    .single();

  if (error || !data) {
    return null;
  }

  const config = data as AdConfig;

  await client.set(key, JSON.stringify(config), { ex: 300 });

  return config;
}

export async function invalidateAdConfigCache(slug: string): Promise<void> {
  const client = getRedis();
  await client.del(cacheKey(slug));
}
