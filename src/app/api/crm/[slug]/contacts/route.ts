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
  // crm_configs shares api_key_hash with email_configs pattern
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

  // Growth = read-only, Pro = full. Essentials = no API access.
  if (config.api_access === "none") {
    return NextResponse.json({ error: "API access not available on this tier" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: clientRow } = await supabase
    .from("crm_configs")
    .select("client_id")
    .eq("id", config.id)
    .single();

  if (!clientRow) {
    return NextResponse.json({ error: "Config not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 200);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  const { data: contacts, error } = await supabase
    .from("email_contacts")
    .select("*")
    .eq("client_id", clientRow.client_id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ contacts: contacts ?? [], limit, offset });
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

  const { email, name, phone, deal } = body as {
    email?: string;
    name?: string;
    phone?: string;
    deal?: {
      pipeline_id: string;
      title: string;
      value?: number;
      stage: string;
      source?: string;
      expected_close_at?: string;
    };
  };

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: clientRow } = await supabase
    .from("crm_configs")
    .select("client_id")
    .eq("id", config.id)
    .single();

  if (!clientRow) {
    return NextResponse.json({ error: "Config not found" }, { status: 404 });
  }

  // Upsert contact
  const { data: contact, error: contactError } = await supabase
    .from("email_contacts")
    .upsert(
      {
        client_id: clientRow.client_id,
        email,
        name: name ?? null,
        phone: phone ?? null,
        tags: [],
        source: "crm_api",
      },
      { onConflict: "client_id,email", ignoreDuplicates: false }
    )
    .select()
    .single();

  if (contactError || !contact) {
    return NextResponse.json({ error: contactError?.message ?? "Failed to create contact" }, { status: 500 });
  }

  let createdDeal = null;

  if (deal) {
    try {
      const { createDeal } = await import("@/lib/crm/deals");
      createdDeal = await createDeal(config.id, {
        pipelineId: deal.pipeline_id,
        contactId: contact.id,
        title: deal.title,
        value: deal.value,
        stage: deal.stage,
        source: deal.source ?? "api",
        expectedCloseAt: deal.expected_close_at,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create deal";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  await logActivity(
    config.id,
    contact.id,
    "contact_created_via_api",
    `Contact created via API: ${email}`
  );

  return NextResponse.json({ contact, deal: createdDeal }, { status: 201 });
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
