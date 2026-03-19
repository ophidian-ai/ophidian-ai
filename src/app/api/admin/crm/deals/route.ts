import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createDeal } from "@/lib/crm/deals";

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
  const pipelineId = searchParams.get("pipeline_id");
  const stage = searchParams.get("stage");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "100", 10), 500);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  let query = supabase!
    .from("crm_deals")
    .select("*")
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (configId) query = query.eq("config_id", configId);
  if (pipelineId) query = query.eq("pipeline_id", pipelineId);
  if (stage) query = query.eq("stage", stage);

  const { data, error: dbError } = await query;

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ deals: data ?? [], limit, offset });
}

export async function POST(request: NextRequest) {
  const { error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    config_id,
    pipeline_id,
    contact_id,
    title,
    value,
    stage,
    source,
    expected_close_at,
    custom_field_values,
  } = body as {
    config_id?: string;
    pipeline_id?: string;
    contact_id?: string;
    title?: string;
    value?: number;
    stage?: string;
    source?: string;
    expected_close_at?: string;
    custom_field_values?: Record<string, unknown>;
  };

  if (!config_id || !pipeline_id || !contact_id || !title || !stage) {
    return NextResponse.json(
      { error: "config_id, pipeline_id, contact_id, title, and stage are required" },
      { status: 400 }
    );
  }

  try {
    const deal = await createDeal(config_id, {
      pipelineId: pipeline_id,
      contactId: contact_id,
      title,
      value,
      stage,
      source: source ?? "admin",
      expectedCloseAt: expected_close_at,
      customFieldValues: custom_field_values,
    });

    return NextResponse.json({ deal }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create deal";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
