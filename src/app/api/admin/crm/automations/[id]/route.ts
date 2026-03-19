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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, trigger_type, trigger_config, action_type, action_config, active } = body as {
    name?: string;
    trigger_type?: string;
    trigger_config?: Record<string, unknown>;
    action_type?: string;
    action_config?: Record<string, unknown>;
    active?: boolean;
  };

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (name !== undefined) updates.name = name;
  if (trigger_type !== undefined) updates.trigger_type = trigger_type;
  if (trigger_config !== undefined) updates.trigger_config = trigger_config;
  if (action_type !== undefined) updates.action_type = action_type;
  if (action_config !== undefined) updates.action_config = action_config;
  if (active !== undefined) updates.active = active;

  const { data: updated, error: updateError } = await supabase!
    .from("crm_automations")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (updateError || !updated) {
    return NextResponse.json({ error: updateError?.message ?? "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ automation: updated });
}
