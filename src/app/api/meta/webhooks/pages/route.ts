import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Facebook Pages Webhooks Endpoint
 *
 * GET  - Webhook verification
 * POST - Page event notifications (comments, messages, feed updates, etc.)
 */

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || "ophidianai_webhook_verify_2026";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const body = await request.text();

  const signature = request.headers.get("x-hub-signature-256");
  const appSecret = process.env.META_APP_SECRET;

  if (appSecret && signature) {
    const expectedSignature =
      "sha256=" +
      crypto.createHmac("sha256", appSecret).update(body).digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }
  }

  const data = JSON.parse(body);

  // TODO: Process Page webhook events
  // - feed: new posts, comments, reactions on Page
  // - messages: Messenger conversations
  // - messaging_postbacks: button clicks in Messenger
  // - ratings: Page reviews/ratings
  console.log("[Pages Webhook] Event received:", JSON.stringify(data));

  return NextResponse.json({ received: true });
}
