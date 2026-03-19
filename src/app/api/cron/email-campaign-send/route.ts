import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendCampaignBatch } from "@/lib/email/sending";

export async function GET(request: NextRequest) {
  if (
    request.headers.get("authorization") !==
    "Bearer " + process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  // Find all campaigns in scheduled status where scheduled_at is in the past (or null = send now)
  const { data: campaigns, error } = await supabase
    .from("email_campaigns")
    .select("id, name")
    .eq("status", "scheduled")
    .or(`scheduled_at.is.null,scheduled_at.lte.${new Date().toISOString()}`);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!campaigns || campaigns.length === 0) {
    return NextResponse.json({ dispatched: 0, campaigns: [] });
  }

  const results = await Promise.allSettled(
    campaigns.map((c) => sendCampaignBatch(c.id))
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({
    dispatched: campaigns.length,
    succeeded,
    failed,
    campaigns: campaigns.map((c) => c.name),
  });
}
