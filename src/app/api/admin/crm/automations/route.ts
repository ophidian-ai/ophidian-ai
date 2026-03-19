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
    .from("crm_automations")
    .select("*")
    .order("created_at", { ascending: false });

  if (configId) query = query.eq("config_id", configId);

  const { data, error: dbError } = await query;

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ automations: data ?? [] });
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

  const { config_id, name, trigger_type, trigger_config, action_type, action_config, active } = body as {
    config_id?: string;
    name?: string;
    trigger_type?: string;
    trigger_config?: Record<string, unknown>;
    action_type?: string;
    action_config?: Record<string, unknown>;
    active?: boolean;
  };

  if (!config_id) return NextResponse.json({ error: "config_id is required" }, { status: 400 });
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  if (!trigger_type) return NextResponse.json({ error: "trigger_type is required" }, { status: 400 });
  if (!action_type) return NextResponse.json({ error: "action_type is required" }, { status: 400 });

  // Load config to check tier -- automations are Pro only
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

  if (!tierDefaults.automationEnabled) {
    return NextResponse.json({ error: "Automations require Pro tier" }, { status: 403 });
  }

  const { data: automation, error: insertError } = await supabase!
    .from("crm_automations")
    .insert({
      config_id,
      name,
      trigger_type,
      trigger_config: trigger_config ?? {},
      action_type,
      action_config: action_config ?? {},
      active: active ?? true,
    })
    .select()
    .single();

  if (insertError || !automation) {
    return NextResponse.json({ error: insertError?.message ?? "Failed to create automation" }, { status: 500 });
  }

  return NextResponse.json({ automation }, { status: 201 });
}
