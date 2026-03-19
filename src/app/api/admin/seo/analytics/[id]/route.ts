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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") ?? "30", 10);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const startIso = startDate.toISOString().split("T")[0];
  const endIso = endDate.toISOString().split("T")[0];

  const [auditsResult, latestAuditResult, gbpDraftsResult] = await Promise.all([
    supabase!
      .from("seo_audits")
      .select("*")
      .eq("config_id", id)
      .gte("date", startIso)
      .lte("date", endIso)
      .order("date", { ascending: true }),
    supabase!
      .from("seo_audits")
      .select("date")
      .eq("config_id", id)
      .lte("date", endIso)
      .order("date", { ascending: false })
      .limit(1)
      .single(),
    supabase!
      .from("seo_gbp_drafts")
      .select("*")
      .eq("config_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (auditsResult.error) {
    return NextResponse.json({ error: auditsResult.error.message }, { status: 500 });
  }
  if (gbpDraftsResult.error) {
    return NextResponse.json({ error: gbpDraftsResult.error.message }, { status: 500 });
  }

  let rankings: unknown[] = [];
  if (latestAuditResult.data?.date) {
    const { data: rankData, error: rankError } = await supabase!
      .from("seo_rankings")
      .select("*")
      .eq("config_id", id)
      .eq("date", latestAuditResult.data.date);

    if (rankError) {
      return NextResponse.json({ error: rankError.message }, { status: 500 });
    }
    rankings = rankData ?? [];
  }

  return NextResponse.json({
    audits: auditsResult.data ?? [],
    rankings,
    gbpDrafts: gbpDraftsResult.data ?? [],
  });
}
