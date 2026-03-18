import { createClient } from "@/lib/supabase/server";
import type { ChatbotConfig } from "@/lib/supabase/chatbot-types";
import crypto from "crypto";

export function signPayload(body: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

export interface WebhookPayload {
  event: "lead.captured" | "conversation.completed";
  data: Record<string, unknown>;
  timestamp: string;
}

export const RETRY_DELAYS = [5000, 30000, 300000];

export async function deliverWebhook(
  config: ChatbotConfig,
  payload: WebhookPayload
): Promise<void> {
  if (!config.api_key_hash) {
    return;
  }

  // webhook_url field not yet in schema -- placeholder for GoHighLevel (Apr 1)
  // Full implementation will: serialize payload, sign it, attempt delivery with retry logic
  console.log("[webhooks] deliverWebhook payload:", JSON.stringify(payload));
}

export async function attemptDelivery(
  url: string,
  body: string,
  signature: string
): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

export async function logFailure(
  configId: string,
  eventType: string,
  payload: Record<string, unknown>,
  attempts: number,
  lastError: string
): Promise<void> {
  const supabase = await createClient();

  await supabase.from("chatbot_webhook_failures").insert({
    config_id: configId,
    event_type: eventType,
    payload,
    attempts,
    last_error: lastError,
  });
}
