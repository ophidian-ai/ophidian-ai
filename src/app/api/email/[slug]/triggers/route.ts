import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { evaluateTriggers } from "@/lib/email/sequences";
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

  // API triggers are Pro-only
  if (config.tier !== "pro") {
    return NextResponse.json(
      { error: "API triggers require the Pro plan" },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event_type, event_data } = body as {
    event_type?: string;
    event_data?: Record<string, unknown>;
  };

  if (!event_type || typeof event_type !== "string") {
    return NextResponse.json({ error: "event_type is required" }, { status: 400 });
  }

  try {
    await evaluateTriggers(config.client_id, event_type, event_data ?? {});
    return NextResponse.json({ evaluated: true }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
