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

export async function GET() {
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { data, error: dbError } = await supabase!
    .from("ad_configs")
    .select("*, clients(company_name)")
    .order("created_at", { ascending: false });

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

  const { client_id, tier, monthly_management_fee, monthly_ad_budget, ...rest } =
    body as {
      client_id?: string;
      tier?: string;
      monthly_management_fee?: number;
      monthly_ad_budget?: number;
      [key: string]: unknown;
    };

  if (!client_id || typeof client_id !== "string") {
    return NextResponse.json({ error: "client_id is required" }, { status: 400 });
  }

  const insertPayload = {
    client_id,
    tier: tier ?? "essentials",
    monthly_management_fee: monthly_management_fee ?? 0,
    monthly_ad_budget: monthly_ad_budget ?? null,
    ...rest,
  };

  const { data, error: dbError } = await supabase!
    .from("ad_configs")
    .insert(insertPayload)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
