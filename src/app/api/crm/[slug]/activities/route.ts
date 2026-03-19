import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/crm/activities";
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
    return NextResponse.json({ error: "Activity logging requires Pro tier" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { contact_id, type, description, deal_id } = body as {
    contact_id?: string;
    type?: string;
    description?: string;
    deal_id?: string;
  };

  if (!contact_id || typeof contact_id !== "string") {
    return NextResponse.json({ error: "contact_id is required" }, { status: 400 });
  }
  if (!type || typeof type !== "string") {
    return NextResponse.json({ error: "type is required" }, { status: 400 });
  }
  if (!description || typeof description !== "string") {
    return NextResponse.json({ error: "description is required" }, { status: 400 });
  }

  try {
    await logActivity(
      config.id,
      contact_id,
      type,
      description,
      undefined,
      deal_id
    );

    return NextResponse.json({ logged: true }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to log activity";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
