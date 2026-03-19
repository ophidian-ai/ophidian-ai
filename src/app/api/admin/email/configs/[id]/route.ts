import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { invalidateEmailConfigCache } from "@/lib/email/config";

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
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Prevent overwriting the unsubscribe_secret or api_key_hash directly through this route
  const { unsubscribe_secret: _secret, api_key_hash: _hash, ...safeBody } = body;

  const updatePayload = {
    ...safeBody,
    updated_at: new Date().toISOString(),
  };

  const { data, error: dbError } = await supabase!
    .from("email_configs")
    .update(updatePayload)
    .eq("id", id)
    .select("*, clients!inner(slug)")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Invalidate Redis cache for this client's slug
  const slug = (data as Record<string, unknown> & { clients?: { slug?: string } }).clients?.slug;
  if (slug) {
    await invalidateEmailConfigCache(slug);
  }

  return NextResponse.json({ config: data });
}
