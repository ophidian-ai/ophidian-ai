import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    .select("*")
    .eq("client_id", client.id)
    .single();

  if (configError || !config) {
    return NextResponse.json({ error: "SEO config not found" }, { status: 404 });
  }

  const { data: latestAudit, error: auditError } = await supabase
    .from("seo_audits")
    .select("*")
    .eq("config_id", config.id)
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (auditError && auditError.code !== "PGRST116") {
    return NextResponse.json({ error: auditError.message }, { status: 500 });
  }

  let rankings: unknown[] = [];
  let gbpDrafts: unknown[] = [];

  if (latestAudit?.date) {
    const [rankingsResult, gbpDraftsResult] = await Promise.all([
      supabase
        .from("seo_rankings")
        .select("*")
        .eq("config_id", config.id)
        .eq("date", latestAudit.date),
      supabase
        .from("seo_gbp_drafts")
        .select("*")
        .eq("config_id", config.id)
        .eq("status", "draft"),
    ]);

    if (rankingsResult.error) {
      return NextResponse.json({ error: rankingsResult.error.message }, { status: 500 });
    }
    if (gbpDraftsResult.error) {
      return NextResponse.json({ error: gbpDraftsResult.error.message }, { status: 500 });
    }

    rankings = rankingsResult.data ?? [];
    gbpDrafts = gbpDraftsResult.data ?? [];
  } else {
    const { data: gbpData, error: gbpError } = await supabase
      .from("seo_gbp_drafts")
      .select("*")
      .eq("config_id", config.id)
      .eq("status", "draft");

    if (gbpError) {
      return NextResponse.json({ error: gbpError.message }, { status: 500 });
    }
    gbpDrafts = gbpData ?? [];
  }

  return NextResponse.json({
    config,
    audit: latestAudit ?? null,
    rankings,
    gbpDrafts,
  });
}
