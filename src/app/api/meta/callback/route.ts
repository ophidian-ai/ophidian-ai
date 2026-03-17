import { NextRequest, NextResponse } from "next/server";

/**
 * Meta OAuth Callback
 *
 * After a client authorizes OphidianAI via Facebook Login for Business,
 * Meta redirects them here with an authorization code. We exchange that
 * code for an access token, then fetch their Pages and Instagram accounts.
 *
 * Flow:
 * 1. Client clicks "Connect Facebook" on our dashboard
 * 2. They're sent to Meta's OAuth dialog
 * 3. After granting permissions, Meta redirects here with ?code=...
 * 4. We exchange the code for tokens
 * 5. We store the tokens and redirect the client to their dashboard
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://ophidianai.com";

  // Handle denied permissions
  if (error) {
    console.error(
      `[Meta OAuth] Authorization denied: ${error} - ${errorDescription}`
    );
    return NextResponse.redirect(
      `${siteUrl}/dashboard?meta_error=${encodeURIComponent(errorDescription || "Authorization denied")}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${siteUrl}/dashboard?meta_error=${encodeURIComponent("No authorization code received")}`
    );
  }

  try {
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    const redirectUri = `${siteUrl}/api/meta/callback`;

    if (!appId || !appSecret) {
      console.error("META_APP_ID or META_APP_SECRET not configured");
      return NextResponse.redirect(
        `${siteUrl}/dashboard?meta_error=${encodeURIComponent("Server configuration error")}`
      );
    }

    // Exchange authorization code for short-lived access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?` +
        `client_id=${appId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `client_secret=${appSecret}&` +
        `code=${code}`,
      { method: "GET" }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("[Meta OAuth] Token exchange failed:", tokenData.error);
      return NextResponse.redirect(
        `${siteUrl}/dashboard?meta_error=${encodeURIComponent(tokenData.error.message || "Token exchange failed")}`
      );
    }

    const shortLivedToken = tokenData.access_token;

    // Exchange for long-lived token (60-day expiry)
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${appId}&` +
        `client_secret=${appSecret}&` +
        `fb_exchange_token=${shortLivedToken}`,
      { method: "GET" }
    );

    const longLivedData = await longLivedResponse.json();

    if (longLivedData.error) {
      console.error(
        "[Meta OAuth] Long-lived token exchange failed:",
        longLivedData.error
      );
      return NextResponse.redirect(
        `${siteUrl}/dashboard?meta_error=${encodeURIComponent("Failed to get long-lived token")}`
      );
    }

    const longLivedToken = longLivedData.access_token;

    // Fetch the user's Pages (these tokens don't expire)
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?access_token=${longLivedToken}`,
      { method: "GET" }
    );

    const pagesData = await pagesResponse.json();

    // TODO: Store tokens and page data securely
    // - Encrypt and store the long-lived user token
    // - Store each Page's access token (never expires)
    // - Fetch and store connected Instagram Professional accounts
    // - Associate with the client's account in our system
    console.log(
      `[Meta OAuth] Successfully connected. Pages: ${pagesData.data?.length || 0}`
    );

    return NextResponse.redirect(
      `${siteUrl}/dashboard?meta_connected=true&pages=${pagesData.data?.length || 0}`
    );
  } catch (error) {
    console.error("[Meta OAuth] Error:", error);
    return NextResponse.redirect(
      `${siteUrl}/dashboard?meta_error=${encodeURIComponent("An unexpected error occurred")}`
    );
  }
}
