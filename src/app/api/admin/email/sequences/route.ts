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
    .from("email_sequences")
    .select("*, email_configs(from_name, clients(company_name))")
    .order("created_at", { ascending: false });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ sequences: data });
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

  const { config_id, name, trigger_type, steps, ...rest } = body as {
    config_id?: string;
    name?: string;
    trigger_type?: string;
    steps?: unknown[];
    [key: string]: unknown;
  };

  if (!config_id || typeof config_id !== "string") {
    return NextResponse.json({ error: "config_id is required" }, { status: 400 });
  }
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (!trigger_type || typeof trigger_type !== "string") {
    return NextResponse.json({ error: "trigger_type is required" }, { status: 400 });
  }

  const insertPayload = {
    config_id,
    name,
    trigger_type,
    trigger_config: rest.trigger_config ?? {},
    steps: steps ?? [],
    active: false,
    ...rest,
  };

  const { data, error: dbError } = await supabase!
    .from("email_sequences")
    .insert(insertPayload)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ sequence: data }, { status: 201 });
}
