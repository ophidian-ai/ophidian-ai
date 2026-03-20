import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { invalidateReviewConfigCache } from "@/lib/review/config";

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Allowed fields to update
  const allowed = [
    "tier",
    "notification_email",
    "brand_voice",
    "auto_respond_positive",
    "auto_respond_negative",
    "escalation_email",
    "competitor_gbp_ids",
    "yelp_url",
    "facebook_page_id",
    "gbp_account_id",
    "gbp_location_id",
    "gbp_oauth_token",
    "active",
  ];

  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) {
      updates[key] = body[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error: dbError } = await supabase!
    .from("review_configs")
    .update(updates)
    .eq("id", id)
    .select("*, clients(company_name, slug)")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Invalidate Redis cache if we have the client slug
  const clientSlug = (data as { clients?: { slug?: string } }).clients?.slug;
  if (clientSlug) {
    try {
      await invalidateReviewConfigCache(clientSlug);
    } catch (err) {
      console.error("[review/configs/[id]] Cache invalidation failed:", err);
    }
  }

  return NextResponse.json({ ...data, gbp_connected: data.gbp_oauth_token !== null });
}
