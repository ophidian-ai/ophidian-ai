import { Redis } from "@upstash/redis";
import { createClient } from "@/lib/supabase/server";
import type { ChatbotConfig } from "@/lib/supabase/chatbot-types";

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
  return `chatbot:config:${slug}`;
}

export async function loadConfig(slug: string): Promise<ChatbotConfig | null> {
  const client = getRedis();
  const key = cacheKey(slug);

  // Check cache first
  const cached = await client.get<string>(key);
  if (cached !== null) {
    const config: ChatbotConfig =
      typeof cached === "string" ? JSON.parse(cached) : cached;
    return config;
  }

  // Cache miss -- query Supabase
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chatbot_configs")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (error || !data) {
    return null;
  }

  const config = data as ChatbotConfig;

  // Reject expired demo configs
  if (config.is_demo && config.demo_expires_at) {
    const expires = new Date(config.demo_expires_at);
    if (expires < new Date()) {
      return null;
    }
  }

  // Cache with 300s TTL
  await client.set(key, JSON.stringify(config), { ex: 300 });

  return config;
}

export async function invalidateConfigCache(slug: string): Promise<void> {
  const client = getRedis();
  await client.del(cacheKey(slug));
}
