import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Verify the draft belongs to this user's client config
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const { data: config, error: configError } = await supabase
    .from("seo_configs")
    .select("id")
    .eq("client_id", client.id)
    .single();

  if (configError || !config) {
    return NextResponse.json({ error: "SEO config not found" }, { status: 404 });
  }

  const { data: updated, error: updateError } = await supabase
    .from("seo_gbp_drafts")
    .update({ status: "approved" })
    .eq("id", id)
    .eq("config_id", config.id)
    .eq("status", "draft")
    .gt("expires_at", new Date().toISOString())
    .select("id");

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (!updated || updated.length === 0) {
    return NextResponse.json(
      { error: "Draft has expired or was already processed." },
      { status: 410 }
    );
  }

  return NextResponse.json({ success: true });
}
