import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Meta Deauthorize Callback
 *
 * Called when a user removes the OphidianAI app from their Facebook account.
 * We should revoke all stored tokens and clean up the user's connection.
 *
 * See: https://developers.facebook.com/docs/facebook-login/guides/advanced/reauthentication
 */

function parseSignedRequest(
  signedRequest: string,
  appSecret: string
): Record<string, unknown> | null {
  const [encodedSig, payload] = signedRequest.split(".");

  const sig = Buffer.from(
    encodedSig.replace(/-/g, "+").replace(/_/g, "/"),
    "base64"
  );

  const expectedSig = crypto
    .createHmac("sha256", appSecret)
    .update(payload)
    .digest();

  if (!crypto.timingSafeEqual(sig, expectedSig)) {
    return null;
  }

  const data = JSON.parse(
    Buffer.from(
      payload.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    ).toString("utf-8")
  );

  return data;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const signedRequest = formData.get("signed_request") as string;

    if (!signedRequest) {
      return NextResponse.json(
        { error: "Missing signed_request" },
        { status: 400 }
      );
    }

    const appSecret = process.env.META_APP_SECRET;
    if (!appSecret) {
      console.error("META_APP_SECRET not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const data = parseSignedRequest(signedRequest, appSecret);
    if (!data) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
    }

    const userId = data.user_id as string;

    // TODO: Revoke stored access tokens for this user
    // - Delete Page access tokens
    // - Delete Instagram access tokens
    // - Mark the user's Meta connection as disconnected
    // - Cancel any scheduled posts for their accounts
    console.log(`[Meta Deauthorize] User ${userId} removed the app`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Meta Deauthorize] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
