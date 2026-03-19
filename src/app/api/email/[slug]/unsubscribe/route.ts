import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { unsubscribeContact } from "@/lib/email/contacts";
import type { EmailConfig } from "@/lib/supabase/email-types";

async function loadConfigBySlug(slug: string): Promise<EmailConfig | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("email_configs")
    .select("*, clients!inner(slug)")
    .eq("clients.slug", slug)
    .eq("active", true)
    .single();

  if (error || !data) return null;

  const { clients: _clients, ...config } = data as EmailConfig & { clients: unknown };
  return config as EmailConfig;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const contactId = searchParams.get("contact");
  const token = searchParams.get("token");

  if (!contactId || !token) {
    return new NextResponse("Invalid unsubscribe link.", {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  const config = await loadConfigBySlug(slug);
  if (!config) {
    return new NextResponse("Not found.", {
      status: 404,
      headers: { "Content-Type": "text/html" },
    });
  }

  // Verify HMAC token
  const expectedToken = crypto
    .createHmac("sha256", config.unsubscribe_secret)
    .update(contactId)
    .digest("hex");

  const tokensMatch = crypto.timingSafeEqual(
    Buffer.from(token, "hex"),
    Buffer.from(expectedToken, "hex")
  );

  if (!tokensMatch) {
    return new NextResponse("Invalid unsubscribe token.", {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  try {
    await unsubscribeContact(contactId);
  } catch (err) {
    console.error("[unsubscribe] Error:", err);
    return new NextResponse("An error occurred. Please try again later.", {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }

  return new NextResponse(
    `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Unsubscribed</title></head>
<body style="font-family:sans-serif;text-align:center;padding:3rem;">
  <h1>You have been unsubscribed.</h1>
  <p>You will no longer receive emails from this sender.</p>
</body>
</html>`,
    {
      status: 200,
      headers: { "Content-Type": "text/html" },
    }
  );
}
