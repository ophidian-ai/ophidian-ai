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

  const { id: configId } = await params;
  const { searchParams } = new URL(request.url);
  const days = Math.min(parseInt(searchParams.get("days") ?? "30", 10), 90);

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  // Fetch analytics rows
  const { data: analyticsRows, error: analyticsError } = await supabase!
    .from("review_analytics")
    .select("*")
    .eq("config_id", configId)
    .gte("date", since)
    .order("date", { ascending: true });

  if (analyticsError) {
    return NextResponse.json({ error: analyticsError.message }, { status: 500 });
  }

  // Compute overall response rate across all platforms
  const allPlatformRows = (analyticsRows ?? []).filter(
    (r) => r.platform === "all"
  );

  const totalReviews = allPlatformRows.reduce(
    (sum, r) => sum + (r.total_reviews ?? 0),
    0
  );
  const totalResponses = allPlatformRows.reduce(
    (sum, r) => sum + (r.responses_posted ?? 0),
    0
  );
  const overallResponseRate =
    totalReviews > 0 ? (totalResponses / totalReviews) * 100 : 0;

  // Sentiment breakdown (summed)
  const sentimentSummary = {
    positive: allPlatformRows.reduce((s, r) => s + (r.sentiment_positive ?? 0), 0),
    neutral: allPlatformRows.reduce((s, r) => s + (r.sentiment_neutral ?? 0), 0),
    negative: allPlatformRows.reduce((s, r) => s + (r.sentiment_negative ?? 0), 0),
  };

  // Rating trend (last N days using "all" platform rows)
  const ratingTrend = allPlatformRows.map((r) => ({
    date: r.date,
    avg_rating: r.average_rating,
    new_reviews: r.new_reviews,
    response_rate: r.response_rate,
  }));

  return NextResponse.json({
    configId,
    days,
    totalReviews,
    totalResponses,
    overallResponseRate: Math.round(overallResponseRate * 10) / 10,
    sentimentSummary,
    ratingTrend,
    rows: analyticsRows ?? [],
  });
}
