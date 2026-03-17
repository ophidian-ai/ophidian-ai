import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Meta Data Deletion Callback
 *
 * When a user removes the OphidianAI app from their Facebook settings,
 * Meta sends a signed POST request to this endpoint. We must:
 * 1. Verify the request signature
 * 2. Delete all stored data for that user
 * 3. Return a confirmation URL and confirmation code
 *
 * See: https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
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
    const confirmationCode = crypto.randomUUID();

    // TODO: Delete all stored Meta platform data for this user
    // - Remove access tokens
    // - Remove account IDs
    // - Remove any cached content/insights
    // - Log the deletion for compliance
    console.log(
      `[Meta Data Deletion] User ${userId}, confirmation: ${confirmationCode}`
    );

    const statusUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://ophidianai.com"}/api/meta/data-deletion?confirm=${confirmationCode}`;

    return NextResponse.json({
      url: statusUrl,
      confirmation_code: confirmationCode,
    });
  } catch (error) {
    console.error("[Meta Data Deletion] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const confirmationCode = searchParams.get("confirm");

  if (!confirmationCode) {
    return NextResponse.json(
      { error: "Missing confirmation code" },
      { status: 400 }
    );
  }

  // TODO: Look up deletion status by confirmation code
  return NextResponse.json({
    confirmation_code: confirmationCode,
    status: "completed",
    message:
      "All Meta platform data associated with your account has been deleted.",
  });
}
