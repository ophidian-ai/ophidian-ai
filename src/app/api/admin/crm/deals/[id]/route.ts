import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateDealStage } from "@/lib/crm/deals";

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
  const { error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

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

  try {
    // updateDealStage fires automations automatically
    const deal = await updateDealStage(id, stage);
    return NextResponse.json({ deal });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update deal stage";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
