import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createContact, createContactsBatch } from "@/lib/email/contacts";
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

function verifyApiKey(request: NextRequest, config: EmailConfig): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return tokenHash === config.api_key_hash;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const config = await loadConfigBySlug(slug);
  if (!config) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!verifyApiKey(request, config)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    // Accept single contact or batch array
    if (Array.isArray(body)) {
      const contacts = await createContactsBatch(config.client_id, body as Parameters<typeof createContactsBatch>[1]);
      return NextResponse.json({ contacts }, { status: 201 });
    } else {
      const contact = await createContact(config.client_id, body as Parameters<typeof createContact>[1]);
      return NextResponse.json({ contact }, { status: 201 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
