import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createDeal } from "@/lib/crm/deals";
import type { CrmConfig } from "@/lib/supabase/crm-types";

async function loadCrmConfigBySlug(slug: string): Promise<CrmConfig | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("crm_configs")
    .select("*, clients!inner(slug)")
    .eq("clients.slug", slug)
    .eq("active", true)
    .single();

  if (error || !data) return null;

  const { clients: _clients, ...config } = data as CrmConfig & { clients: unknown };
  return config as CrmConfig;
}

function verifyApiKey(request: NextRequest, config: CrmConfig): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return tokenHash === (config as unknown as Record<string, string>).api_key_hash;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const config = await loadCrmConfigBySlug(slug);
  if (!config) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!verifyApiKey(request, config)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (config.api_access === "none") {
    return NextResponse.json({ error: "API access not available on this tier" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const pipelineId = searchParams.get("pipeline_id");
  const stage = searchParams.get("stage");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 200);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  const supabase = await createClient();
  let query = supabase
    .from("crm_deals")
    .select("*")
    .eq("config_id", config.id)
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (pipelineId) {
    query = query.eq("pipeline_id", pipelineId);
  }
  if (stage) {
    query = query.eq("stage", stage);
  }

  const { data: deals, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deals: deals ?? [], limit, offset });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const config = await loadCrmConfigBySlug(slug);
  if (!config) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!verifyApiKey(request, config)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (config.api_access !== "full") {
    return NextResponse.json({ error: "Write access requires Pro tier" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    pipeline_id,
    contact_id,
    title,
    value,
    stage,
    source,
    expected_close_at,
    custom_field_values,
  } = body as {
    pipeline_id?: string;
    contact_id?: string;
    title?: string;
    value?: number;
    stage?: string;
    source?: string;
    expected_close_at?: string;
    custom_field_values?: Record<string, unknown>;
  };

  if (!pipeline_id || !contact_id || !title || !stage) {
    return NextResponse.json(
      { error: "pipeline_id, contact_id, title, and stage are required" },
      { status: 400 }
    );
  }

  try {
    const deal = await createDeal(config.id, {
      pipelineId: pipeline_id,
      contactId: contact_id,
      title,
      value,
      stage,
      source: source ?? "api",
      expectedCloseAt: expected_close_at,
      customFieldValues: custom_field_values,
    });

    return NextResponse.json({ deal }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create deal";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
