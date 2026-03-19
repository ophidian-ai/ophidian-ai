import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { updateDealStage } from "@/lib/crm/deals";
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;

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

  const { stage } = body as { stage?: string };

  if (!stage || typeof stage !== "string") {
    return NextResponse.json({ error: "stage is required" }, { status: 400 });
  }

  // Verify deal belongs to this config
  const supabase = await createClient();
  const { data: deal, error: dealError } = await supabase
    .from("crm_deals")
    .select("id, config_id")
    .eq("id", id)
    .eq("config_id", config.id)
    .single();

  if (dealError || !deal) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  try {
    const updated = await updateDealStage(id, stage);
    return NextResponse.json({ deal: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update deal";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
