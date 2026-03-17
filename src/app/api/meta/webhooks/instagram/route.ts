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
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[Instagram Webhook] Verification successful");
    return new NextResponse(challenge, { status: 200 });
  }

  console.error("[Instagram Webhook] Verification failed");
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
