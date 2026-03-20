import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  if (
    request.headers.get("authorization") !==
    "Bearer " + process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  // Fetch all active review configs
  const { data: configs, error } = await supabase
    .from("review_configs")
    .select("id")
    .eq("active", true);

  if (error) {
    console.error("[cron/review-analytics] Failed to fetch configs:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().slice(0, 10);

  const dayStart = `${dateStr}T00:00:00.000Z`;
  const dayEnd = `${dateStr}T23:59:59.999Z`;

  let processed = 0;
  let errors = 0;

  for (const config of configs ?? []) {
    const configId = config.id;

    try {
      // Get all platforms that have reviews for this config
      const { data: platformRows } = await supabase
        .from("reviews")
        .select("platform")
        .eq("config_id", configId)
        .gte("review_date", dayStart)
        .lte("review_date", dayEnd);

      const platforms = [
        "all",
        ...new Set((platformRows ?? []).map((r) => r.platform as string)),
      ];

      for (const platform of platforms) {
        let reviewQuery = supabase
          .from("reviews")
          .select("id, rating, sentiment, response_status", { count: "exact" })
          .eq("config_id", configId)
          .lte("review_date", dayEnd); // all time up to end of yesterday for totals

        if (platform !== "all") {
          reviewQuery = reviewQuery.eq("platform", platform);
        }

        const { data: allReviews, count: totalCount } = await reviewQuery;

        // New reviews yesterday only
        let newQuery = supabase
          .from("reviews")
          .select("id", { count: "exact", head: true })
          .eq("config_id", configId)
          .gte("review_date", dayStart)
          .lte("review_date", dayEnd);

        if (platform !== "all") {
          newQuery = newQuery.eq("platform", platform);
        }

        const { count: newCount } = await newQuery;

        // Responses posted yesterday
        let postedQuery = supabase
          .from("review_responses")
          .select("id", { count: "exact", head: true })
          .eq("config_id", configId)
          .eq("status", "posted")
          .gte("posted_at", dayStart)
          .lte("posted_at", dayEnd);

        if (platform !== "all") {
          // Join through reviews for platform filter
          const { data: platformReviews } = await supabase
            .from("reviews")
            .select("id")
            .eq("config_id", configId)
            .eq("platform", platform);

          const reviewIds = (platformReviews ?? []).map((r) => r.id as string);
          if (reviewIds.length > 0) {
            postedQuery = postedQuery.in("review_id", reviewIds);
          }
        }

        const { count: postedCount } = await postedQuery;

        // Compute avg rating
        const reviewList = allReviews ?? [];
        const ratings = reviewList.map((r) => r.rating as number).filter(Boolean);
        const avgRating =
          ratings.length > 0
            ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 100) / 100
            : 0;

        // Sentiment breakdown
        const sentimentPositive = reviewList.filter((r) => r.sentiment === "positive").length;
        const sentimentNeutral = reviewList.filter((r) => r.sentiment === "neutral").length;
        const sentimentNegative = reviewList.filter((r) => r.sentiment === "negative").length;

        const total = totalCount ?? 0;
        const responseRate =
          total > 0 ? Math.round(((postedCount ?? 0) / total) * 1000) / 10 : 0;

        // Upsert analytics row
        await supabase.from("review_analytics").upsert(
          {
            config_id: configId,
            date: dateStr,
            platform,
            total_reviews: total,
            average_rating: avgRating,
            new_reviews: newCount ?? 0,
            responses_posted: postedCount ?? 0,
            response_rate: responseRate,
            sentiment_positive: sentimentPositive,
            sentiment_neutral: sentimentNeutral,
            sentiment_negative: sentimentNegative,
          },
          { onConflict: "config_id,date,platform" }
        );
      }

      processed++;
    } catch (err) {
      console.error(`[cron/review-analytics] ${configId} failed:`, err);
      errors++;
    }
  }

  return NextResponse.json({ date: dateStr, processed, errors });
}
