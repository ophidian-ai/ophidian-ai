import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CRM_TIER_DEFAULTS } from "@/lib/crm/tier-defaults";
import type { CrmConfig } from "@/lib/supabase/crm-types";
import type { ChatbotTier } from "@/lib/supabase/chatbot-types";

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
  const configId = searchParams.get("config_id");

  let query = supabase!
    .from("crm_pipelines")
    .select("*")
    .order("created_at", { ascending: true });

  if (configId) {
    query = query.eq("config_id", configId);
  }

  const { data, error: dbError } = await query;

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ pipelines: data ?? [] });
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

  const { config_id, name, stages, is_default } = body as {
    config_id?: string;
    name?: string;
    stages?: unknown[];
    is_default?: boolean;
  };

  if (!config_id || typeof config_id !== "string") {
    return NextResponse.json({ error: "config_id is required" }, { status: 400 });
  }
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  // Load config to check tier and max_pipelines
  const { data: configRow, error: configError } = await supabase!
    .from("crm_configs")
    .select("*")
    .eq("id", config_id)
    .single();

  if (configError || !configRow) {
    return NextResponse.json({ error: "Config not found" }, { status: 404 });
  }

  const config = configRow as CrmConfig;
  const tierDefaults = CRM_TIER_DEFAULTS[config.tier as ChatbotTier];

  // Only Growth/Pro can create additional pipelines
  if (tierDefaults.maxPipelines !== null && tierDefaults.maxPipelines <= 1 && config.tier === "essentials") {
    return NextResponse.json(
      { error: "Additional pipelines require Growth or Pro tier" },
      { status: 403 }
    );
  }

  // Check max_pipelines limit
  if (tierDefaults.maxPipelines !== null) {
    const { count, error: countError } = await supabase!
      .from("crm_pipelines")
      .select("id", { count: "exact", head: true })
      .eq("config_id", config_id);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    if ((count ?? 0) >= tierDefaults.maxPipelines) {
      return NextResponse.json(
        { error: `Pipeline limit of ${tierDefaults.maxPipelines} reached for this tier` },
        { status: 422 }
      );
    }
  }

  const { data: pipeline, error: insertError } = await supabase!
    .from("crm_pipelines")
    .insert({
      config_id,
      name,
      stages: stages ?? [],
      is_default: is_default ?? false,
    })
    .select()
    .single();

  if (insertError || !pipeline) {
    return NextResponse.json({ error: insertError?.message ?? "Failed to create pipeline" }, { status: 500 });
  }

  return NextResponse.json({ pipeline }, { status: 201 });
}
