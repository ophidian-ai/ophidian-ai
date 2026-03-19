import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { invalidateCrmConfigCache } from "@/lib/crm/config";

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

  // Load the config to get the client slug for cache invalidation
  const { data: existing, error: fetchError } = await supabase!
    .from("crm_configs")
    .select("*, clients(slug)")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Config not found" }, { status: 404 });
  }

  // Prevent changing client_id
  const { client_id: _cid, ...updates } = body;

  const { data: updated, error: updateError } = await supabase!
    .from("crm_configs")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (updateError || !updated) {
    return NextResponse.json({ error: updateError?.message ?? "Update failed" }, { status: 500 });
  }

  // Invalidate Redis cache
  const slug = (existing.clients as { slug: string } | null)?.slug;
  if (slug) {
    try {
      await invalidateCrmConfigCache(slug);
    } catch (cacheErr) {
      console.error("[admin/crm/configs/[id]] Cache invalidation failed:", cacheErr);
    }
  }

  return NextResponse.json({ config: updated });
}
