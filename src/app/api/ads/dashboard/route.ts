import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    return NextResponse.json({ error: "Use admin endpoints" }, { status: 403 });
  }

  const { data: clientRecord } = await supabase
    .from("clients")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!clientRecord) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const { data: config, error: configError } = await supabase
    .from("ad_configs")
    .select("*")
    .eq("client_id", clientRecord.id)
    .eq("active", true)
    .single();

  if (configError || !config) {
    return NextResponse.json({ error: "Ad management not configured" }, { status: 404 });
  }

  const { data: campaigns } = await supabase
    .from("ad_campaigns")
    .select("id, platform, name, status, daily_budget, start_date, end_date")
    .eq("config_id", config.id)
    .order("created_at", { ascending: false });

  const campaignIds = (campaigns ?? []).map((c) => c.id);

  let totalSpend = 0;
  let totalConversions = 0;
  let totalClicks = 0;
  let totalImpressions = 0;

  if (campaignIds.length > 0) {
    const { data: metrics } = await supabase
      .from("ad_metrics")
      .select("spend, conversions, clicks, impressions")
      .in("campaign_id", campaignIds);

    for (const m of metrics ?? []) {
      totalSpend += m.spend ?? 0;
      totalConversions += m.conversions ?? 0;
      totalClicks += m.clicks ?? 0;
      totalImpressions += m.impressions ?? 0;
    }
  }

  return NextResponse.json({
    config: {
      id: config.id,
      tier: config.tier,
      google_ads_connected: config.google_ads_connected,
      meta_connected: config.meta_connected,
      monthly_ad_budget: config.monthly_ad_budget,
    },
    stats: {
      totalSpend: Math.round(totalSpend * 100) / 100,
      totalConversions,
      totalClicks,
      totalImpressions,
      avgCpc: totalClicks > 0 ? Math.round((totalSpend / totalClicks) * 100) / 100 : 0,
    },
    campaigns: campaigns ?? [],
  });
}
