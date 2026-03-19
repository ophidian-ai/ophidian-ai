import { NextRequest, NextResponse } from "next/server";
import { processResendEvent } from "@/lib/email/tracking";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    await processResendEvent(body);
  } catch (err) {
    console.error("[webhooks/resend] processResendEvent error:", err);
    // Still return 200 so Resend does not retry indefinitely
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
