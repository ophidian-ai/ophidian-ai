import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runMonitoringCycle } from "@/lib/review/monitoring";
import { MAX_AI_RESPONSES_PER_CRON_RUN } from "@/lib/review/tier-defaults";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
    .select("id, client_id")
    .eq("active", true);

  if (error) {
    console.error("[cron/review-poll] Failed to fetch configs:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const activeConfigs = configs ?? [];
  const results: Array<{ configId: string; newReviews: number; error?: string }> = [];

  // Shared budget across all clients this run
  const aiResponseBudget = { remaining: MAX_AI_RESPONSES_PER_CRON_RUN };

  for (const config of activeConfigs) {
    try {
      const { newReviews } = await runMonitoringCycle(config.id, aiResponseBudget);
      results.push({ configId: config.id, newReviews });
      console.log(`[cron/review-poll] ${config.id}: ${newReviews} new reviews`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`[cron/review-poll] ${config.id} failed:`, message);
      results.push({ configId: config.id, newReviews: 0, error: message });
    }

    if (aiResponseBudget.remaining <= 0) {
      console.log("[cron/review-poll] AI response budget exhausted, stopping early");
      break;
    }

    // Respect GBP rate limit: 1s delay between clients (60 req/min)
    await sleep(1000);
  }

  const totalNew = results.reduce((sum, r) => sum + r.newReviews, 0);

  return NextResponse.json({
    processed: results.length,
    totalNewReviews: totalNew,
    aiResponsesUsed: MAX_AI_RESPONSES_PER_CRON_RUN - aiResponseBudget.remaining,
    results,
  });
}
