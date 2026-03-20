import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // Client auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get client record for this user
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Admins shouldn't use this endpoint
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

  // Load review config for this client
  const { data: config, error: configError } = await supabase
    .from("review_configs")
    .select("*")
    .eq("client_id", clientRecord.id)
    .eq("active", true)
    .single();

  if (configError || !config) {
    return NextResponse.json({ error: "Review management not configured" }, { status: 404 });
  }

  // Aggregate stats
  const { count: totalReviews } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("config_id", config.id);

  const { data: avgData } = await supabase
    .from("reviews")
    .select("rating")
    .eq("config_id", config.id);

  const ratings = (avgData ?? []).map((r) => r.rating as number);
  const avgRating =
    ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : 0;

  // New reviews this month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { count: newThisMonth } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("config_id", config.id)
    .gte("review_date", monthStart.toISOString());

  // Response rate
  const { count: responded } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("config_id", config.id)
    .eq("response_status", "posted");

  const responseRate =
    (totalReviews ?? 0) > 0
      ? Math.round(((responded ?? 0) / (totalReviews ?? 1)) * 1000) / 10
      : 0;

  // Recent 10 reviews with response status
  const { data: recentReviews } = await supabase
    .from("reviews")
    .select(
      "id, platform, author_name, rating, text, review_date, response_status, sentiment"
    )
    .eq("config_id", config.id)
    .order("review_date", { ascending: false })
    .limit(10);

  // Pending responses (draft)
  const { data: pendingResponses } = await supabase
    .from("review_responses")
    .select("*, reviews(author_name, rating, text, platform)")
    .eq("config_id", config.id)
    .eq("status", "draft")
    .order("created_at", { ascending: false });

  return NextResponse.json({
    config: {
      id: config.id,
      tier: config.tier,
      gbp_connected: config.gbp_oauth_token !== null,
    },
    stats: {
      totalReviews: totalReviews ?? 0,
      avgRating,
      newThisMonth: newThisMonth ?? 0,
      responseRate,
    },
    recentReviews: recentReviews ?? [],
    pendingResponses: pendingResponses ?? [],
  });
}
