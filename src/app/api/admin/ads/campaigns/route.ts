import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  const url = new URL(request.url);
  const configId = url.searchParams.get("config_id");

  let query = supabase!
    .from("ad_campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (configId) {
    query = query.eq("config_id", configId);
  }

  const { data, error: dbError } = await query;

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data);
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

  const { config_id, platform, platform_campaign_id, name, ...rest } = body as {
    config_id?: string;
    platform?: string;
    platform_campaign_id?: string;
    name?: string;
    [key: string]: unknown;
  };

  if (!config_id || !platform || !platform_campaign_id || !name) {
    return NextResponse.json(
      { error: "config_id, platform, platform_campaign_id, and name are required" },
      { status: 400 }
    );
  }

  const { data, error: dbError } = await supabase!
    .from("ad_campaigns")
    .insert({ config_id, platform, platform_campaign_id, name, ...rest })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
