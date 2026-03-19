import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_PIPELINE_STAGES, CRM_TIER_DEFAULTS } from "@/lib/crm/tier-defaults";
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

export async function GET() {
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { data, error: dbError } = await supabase!
    .from("crm_configs")
    .select("*, clients(company_name, slug)")
    .order("created_at", { ascending: false });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ configs: data ?? [] });
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

  const { client_id, tier, ...rest } = body as {
    client_id?: string;
    tier?: ChatbotTier;
    [key: string]: unknown;
  };

  if (!client_id || typeof client_id !== "string") {
    return NextResponse.json({ error: "client_id is required" }, { status: 400 });
  }

  const validTiers: ChatbotTier[] = ["essentials", "growth", "pro"];
  const resolvedTier: ChatbotTier =
    tier && validTiers.includes(tier) ? tier : "essentials";

  const tierDefaults = CRM_TIER_DEFAULTS[resolvedTier];

  const insertPayload = {
    client_id,
    tier: resolvedTier,
    max_pipelines: tierDefaults.maxPipelines ?? 999,
    max_custom_fields: tierDefaults.maxCustomFields ?? 0,
    custom_fields: [],
    api_access: tierDefaults.apiAccess,
    active: true,
    ...rest,
  };

  const { data: config, error: configError } = await supabase!
    .from("crm_configs")
    .insert(insertPayload)
    .select()
    .single();

  if (configError || !config) {
    return NextResponse.json({ error: configError?.message ?? "Failed to create config" }, { status: 500 });
  }

  const crmConfig = config as CrmConfig;

  // Auto-create default pipeline
  const { data: pipeline, error: pipelineError } = await supabase!
    .from("crm_pipelines")
    .insert({
      config_id: crmConfig.id,
      name: "Sales Pipeline",
      stages: DEFAULT_PIPELINE_STAGES,
      is_default: true,
    })
    .select()
    .single();

  if (pipelineError) {
    console.error("[admin/crm/configs] Failed to create default pipeline:", pipelineError.message);
  }

  return NextResponse.json({ config: crmConfig, pipeline: pipeline ?? null }, { status: 201 });
}
