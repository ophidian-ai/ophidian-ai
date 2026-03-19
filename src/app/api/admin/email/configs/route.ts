import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { EMAIL_TIER_DEFAULTS } from "@/lib/email/tier-defaults";
import type { EmailConfig } from "@/lib/supabase/email-types";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "Unauthorized", status: 401 };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin")
    return { supabase: null, error: "Forbidden", status: 403 };
  return { supabase, error: null, status: 200 };
}

export async function GET() {
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { data, error: dbError } = await supabase!
    .from("email_configs")
    .select("*, clients(company_name)")
    .order("created_at", { ascending: false });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ configs: data });
}

export async function POST(request: NextRequest) {
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    client_id,
    tier,
    sending_domain,
    from_name,
    from_email,
    brand_config,
    ...rest
  } = body as {
    client_id?: string;
    tier?: EmailConfig["tier"];
    sending_domain?: string;
    from_name?: string;
    from_email?: string;
    brand_config?: EmailConfig["brand_config"];
    [key: string]: unknown;
  };

  if (!client_id || typeof client_id !== "string") {
    return NextResponse.json({ error: "client_id is required" }, { status: 400 });
  }
  if (!sending_domain || typeof sending_domain !== "string") {
    return NextResponse.json({ error: "sending_domain is required" }, { status: 400 });
  }
  if (!from_name || typeof from_name !== "string") {
    return NextResponse.json({ error: "from_name is required" }, { status: 400 });
  }
  if (!from_email || typeof from_email !== "string") {
    return NextResponse.json({ error: "from_email is required" }, { status: 400 });
  }

  const validTiers: EmailConfig["tier"][] = ["essentials", "growth", "pro"];
  const resolvedTier: EmailConfig["tier"] =
    tier && validTiers.includes(tier) ? tier : "essentials";
  const tierDefaults = EMAIL_TIER_DEFAULTS[resolvedTier];

  // Generate unsubscribe HMAC secret
  const unsubscribeSecret = crypto.randomBytes(32).toString("hex");

  const insertPayload = {
    client_id,
    tier: resolvedTier,
    sending_domain,
    from_name,
    from_email,
    brand_config: brand_config ?? {},
    monthly_send_limit: tierDefaults.monthlySendLimit,
    max_contacts: Number.isFinite(tierDefaults.maxContacts) ? tierDefaults.maxContacts : 999999999,
    max_active_sequences: Number.isFinite(tierDefaults.maxActiveSequences) ? tierDefaults.maxActiveSequences : 999999999,
    unsubscribe_secret: unsubscribeSecret,
    ...rest,
  };

  const { data, error: dbError } = await supabase!
    .from("email_configs")
    .insert(insertPayload)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ config: data }, { status: 201 });
}
