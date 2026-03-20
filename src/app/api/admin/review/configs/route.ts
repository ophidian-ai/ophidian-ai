import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { REVIEW_TIER_DEFAULTS } from "@/lib/review/tier-defaults";
import type { ReviewTier } from "@/lib/supabase/review-types";

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
    .from("review_configs")
    .select("*, clients(company_name, slug)")
    .order("created_at", { ascending: false });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // Add derived field: gbp_connected
  const configs = (data ?? []).map((c) => ({
    ...c,
    gbp_connected: c.gbp_oauth_token !== null,
  }));

  return NextResponse.json({ configs });
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
    notification_email,
    brand_voice,
    auto_respond_positive,
    auto_respond_negative,
    escalation_email,
    competitor_gbp_ids,
    yelp_url,
    facebook_page_id,
  } = body as {
    client_id?: string;
    tier?: ReviewTier;
    notification_email?: string;
    brand_voice?: unknown;
    auto_respond_positive?: boolean;
    auto_respond_negative?: boolean;
    escalation_email?: string;
    competitor_gbp_ids?: string[];
    yelp_url?: string;
    facebook_page_id?: string;
  };

  if (!client_id || typeof client_id !== "string") {
    return NextResponse.json({ error: "client_id is required" }, { status: 400 });
  }
  if (!notification_email || typeof notification_email !== "string") {
    return NextResponse.json({ error: "notification_email is required" }, { status: 400 });
  }

  const resolvedTier: ReviewTier =
    tier && REVIEW_TIER_DEFAULTS[tier] ? tier : "essentials";
  const tierDefaults = REVIEW_TIER_DEFAULTS[resolvedTier];

  const defaultBrandVoice = {
    tone: "professional and friendly",
    guidelines: "Keep responses concise and thank the reviewer.",
    signoff: "Thank you",
  };

  const insertPayload = {
    client_id,
    tier: resolvedTier,
    notification_email,
    brand_voice: brand_voice ?? defaultBrandVoice,
    auto_respond_positive: auto_respond_positive ?? tierDefaults.autoRespondPositive,
    auto_respond_negative: auto_respond_negative ?? tierDefaults.autoRespondNegative,
    escalation_email: escalation_email ?? null,
    competitor_gbp_ids: competitor_gbp_ids ?? [],
    yelp_url: yelp_url ?? null,
    facebook_page_id: facebook_page_id ?? null,
    active: true,
  };

  const { data, error: dbError } = await supabase!
    .from("review_configs")
    .insert(insertPayload)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
