import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCampaign } from "@/lib/review/campaigns";

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

export async function GET(request: NextRequest) {
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(request.url);
  const config_id = searchParams.get("config_id");

  let query = supabase!
    .from("review_campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (config_id) {
    query = query.eq("config_id", config_id);
  }

  const { data, error: dbError } = await query;

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ campaigns: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { supabase: _supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { config_id, name, review_link } = body as {
    config_id?: string;
    name?: string;
    review_link?: string;
  };

  if (!config_id || typeof config_id !== "string") {
    return NextResponse.json({ error: "config_id is required" }, { status: 400 });
  }
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  try {
    const campaign = await createCampaign(config_id, { name, review_link });
    return NextResponse.json(campaign, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create campaign";
    const isTierError = message.includes("Pro tier");
    return NextResponse.json({ error: message }, { status: isTierError ? 403 : 500 });
  }
}
