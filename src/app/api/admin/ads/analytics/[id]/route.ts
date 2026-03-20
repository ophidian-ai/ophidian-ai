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
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  // id = ad_config id
  const { id } = await params;

  // Get all campaigns for this config
  const { data: campaigns, error: campaignError } = await supabase!
    .from("ad_campaigns")
    .select("id")
    .eq("config_id", id);

  if (campaignError) {
    return NextResponse.json({ error: campaignError.message }, { status: 500 });
  }

  if (!campaigns || campaigns.length === 0) {
    return NextResponse.json({
      totalSpend: 0,
      totalConversions: 0,
      totalClicks: 0,
      totalImpressions: 0,
      roas: 0,
      avgCpc: 0,
    });
  }

  const campaignIds = campaigns.map((c) => c.id);

  const { data: metrics, error: metricsError } = await supabase!
    .from("ad_metrics")
    .select("spend, conversions, clicks, impressions, cost_per_click")
    .in("campaign_id", campaignIds);

  if (metricsError) {
    return NextResponse.json({ error: metricsError.message }, { status: 500 });
  }

  const rows = metrics ?? [];
  const totalSpend = rows.reduce((sum, r) => sum + (r.spend ?? 0), 0);
  const totalConversions = rows.reduce((sum, r) => sum + (r.conversions ?? 0), 0);
  const totalClicks = rows.reduce((sum, r) => sum + (r.clicks ?? 0), 0);
  const totalImpressions = rows.reduce((sum, r) => sum + (r.impressions ?? 0), 0);

  // ROAS placeholder: revenue / spend. Without revenue tracking, return spend-only stats.
  const roas = totalSpend > 0 ? totalConversions / totalSpend : 0;
  const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;

  return NextResponse.json({
    totalSpend: Math.round(totalSpend * 100) / 100,
    totalConversions,
    totalClicks,
    totalImpressions,
    roas: Math.round(roas * 100) / 100,
    avgCpc: Math.round(avgCpc * 100) / 100,
  });
}
