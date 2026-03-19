import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (
    request.headers.get("authorization") !==
    "Bearer " + process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  const { data: deactivated, error: deactivateError } = await supabase
    .from("chatbot_configs")
    .update({ active: false })
    .eq("is_demo", true)
    .eq("active", true)
    .lt("demo_expires_at", new Date().toISOString())
    .select("id");

  if (deactivateError) {
    return NextResponse.json(
      { error: deactivateError.message },
      { status: 500 }
    );
  }

  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const { data: expiringSoon, error: expiringError } = await supabase
    .from("chatbot_configs")
    .select("id, demo_expires_at")
    .eq("is_demo", true)
    .eq("active", true)
    .gte("demo_expires_at", new Date().toISOString())
    .lte("demo_expires_at", threeDaysFromNow.toISOString());

  if (expiringError) {
    return NextResponse.json(
      { error: expiringError.message },
      { status: 500 }
    );
  }

  // Expire stale GBP drafts
  await supabase
    .from("seo_gbp_drafts")
    .update({ status: "expired" })
    .eq("status", "draft")
    .lt("expires_at", new Date().toISOString());

  return NextResponse.json({
    deactivated: (deactivated ?? []).length,
    expiring_soon: expiringSoon ?? [],
  });
}
