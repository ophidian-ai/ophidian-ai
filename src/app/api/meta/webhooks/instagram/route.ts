import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Instagram Webhooks Endpoint
 *
 * GET  - Webhook verification (Meta sends a challenge to confirm the URL)
 * POST - Webhook event notifications (comments, messages, etc.)
 */

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || "ophidianai_webhook_verify_2026";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  console.log("[Instagram Webhook] GET request:", {
    url: request.url,
    mode,
    token: token ? token.substring(0, 10) + "..." : null,
    challenge,
    expectedToken: VERIFY_TOKEN.substring(0, 10) + "...",
    match: token === VERIFY_TOKEN,
  });

  // Debug: temporarily return what we see
  if (!mode && !token && !challenge) {
    return NextResponse.json({
      debug: true,
      url: request.url,
      allParams: Object.fromEntries(url.searchParams.entries()),
    });
  }

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json({
    error: "Forbidden",
    debug: { mode, tokenReceived: !!token, tokenMatch: token === VERIFY_TOKEN },
  }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const body = await request.text();

  // Verify signature
  const signature = request.headers.get("x-hub-signature-256");
  const appSecret = process.env.META_APP_SECRET;

  if (appSecret && signature) {
    const expectedSignature =
      "sha256=" +
      crypto.createHmac("sha256", appSecret).update(body).digest("hex");

    if (signature !== expectedSignature) {
      console.error("[Instagram Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }
  }

  const data = JSON.parse(body);

  // TODO: Process webhook events
  // - comments: new comments on client posts
  // - messages: DMs received
  // - message_reactions: reactions to messages
  // - messaging_seen: message read receipts
  console.log("[Instagram Webhook] Event received:", JSON.stringify(data));

  // Must return 200 quickly or Meta will retry
  return NextResponse.json({ received: true });
}
