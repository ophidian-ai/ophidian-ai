import { Redis } from "@upstash/redis";
import { createClient } from "@/lib/supabase/server";
import type { CrmConfig } from "@/lib/supabase/crm-types";

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
  return `crm:config:${slug}`;
}

export async function loadCrmConfig(slug: string): Promise<CrmConfig | null> {
  const client = getRedis();
  const key = cacheKey(slug);

  // Check cache first
  const cached = await client.get<string>(key);
  if (cached !== null) {
    const config: CrmConfig =
      typeof cached === "string" ? JSON.parse(cached) : cached;
    return config;
  }

  // Cache miss -- query Supabase
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("crm_configs")
    .select("*, clients!inner(slug)")
    .eq("clients.slug", slug)
    .eq("active", true)
    .single();

  if (error || !data) {
    return null;
  }

  // Strip the joined clients field before caching
  const { clients: _clients, ...config } = data as CrmConfig & { clients: unknown };

  // Cache with 300s TTL
  await client.set(key, JSON.stringify(config), { ex: 300 });

  return config as CrmConfig;
}

export async function invalidateCrmConfigCache(slug: string): Promise<void> {
  const client = getRedis();
  await client.del(cacheKey(slug));
}
