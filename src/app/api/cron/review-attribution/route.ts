import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { attributeReviews } from "@/lib/review/campaigns";

export async function GET(request: NextRequest) {
  if (
    request.headers.get("authorization") !==
    "Bearer " + process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  // Find campaigns sent in the last 7 days with status='sent'
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: campaigns, error } = await supabase
    .from("review_campaigns")
    .select("id, name, sent_at")
    .eq("status", "sent")
    .gte("sent_at", sevenDaysAgo);

  if (error) {
    console.error("[cron/review-attribution] Failed to fetch campaigns:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: Array<{ campaignId: string; attributed: number; error?: string }> = [];

  for (const campaign of campaigns ?? []) {
    try {
      const attributed = await attributeReviews(campaign.id);
      results.push({ campaignId: campaign.id, attributed });
      console.log(`[cron/review-attribution] ${campaign.id}: ${attributed} reviews attributed`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`[cron/review-attribution] ${campaign.id} failed:`, message);
      results.push({ campaignId: campaign.id, attributed: 0, error: message });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
