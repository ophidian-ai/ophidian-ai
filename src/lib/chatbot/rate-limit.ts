import { Redis } from "@upstash/redis";
import { createClient } from "@/lib/supabase/server";
import type { ChatbotConfig } from "@/lib/supabase/chatbot-types";
import { SESSION_RATE_LIMIT, TIER_DEFAULTS } from "./tier-defaults";

export interface RateLimitResult {
  allowed: boolean;
  message?: string;
}

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

export async function checkSessionRateLimit(
  sessionId: string
): Promise<RateLimitResult> {
  try {
    const client = getRedis();
    const key = `rl:session:${sessionId}`;

    const count = await client.incr(key);

    if (count === 1) {
      await client.expire(key, SESSION_RATE_LIMIT.windowSeconds);
    }

    if (count > SESSION_RATE_LIMIT.maxMessages) {
      return {
        allowed: false,
        message:
          "You're sending messages too quickly. Please wait a moment before trying again.",
      };
    }
  } catch (error) {
    console.error("[rate-limit] Redis check failed, allowing request:", error);
  }

  return { allowed: true };
}

export async function checkMonthlyCap(
  config: ChatbotConfig
): Promise<RateLimitResult> {
  const cap = TIER_DEFAULTS[config.tier].monthlyConversationCap;

  if (cap === null) {
    return { allowed: true };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("increment_and_check_cap", {
    p_config_id: config.id,
    p_cap: cap,
  });

  if (error) {
    console.error("[checkMonthlyCap] RPC error:", error);
    return { allowed: true };
  }

  if (data === false) {
    const { phone, email } = config.fallback_contact;
    const contactParts: string[] = [];
    if (phone) contactParts.push(`call us at ${phone}`);
    if (email) contactParts.push(`email us at ${email}`);
    const contactInfo =
      contactParts.length > 0
        ? ` Please ${contactParts.join(" or ")} for assistance.`
        : "";

    return {
      allowed: false,
      message: `This chatbot has reached its monthly conversation limit.${contactInfo}`,
    };
  }

  return { allowed: true };
}
