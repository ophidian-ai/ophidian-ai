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

  const { id } = await params;

  // Load campaign stats field
  const { data: campaign, error: campaignError } = await supabase!
    .from("email_campaigns")
    .select("id, name, status, stats, sent_at")
    .eq("id", id)
    .single();

  if (campaignError || !campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Aggregate live counts from recipients table
  const { data: recipients, error: recipientsError } = await supabase!
    .from("email_campaign_recipients")
    .select("status")
    .eq("campaign_id", id);

  if (recipientsError) {
    return NextResponse.json({ error: recipientsError.message }, { status: 500 });
  }

  const counts = (recipients ?? []).reduce(
    (acc, r) => {
      acc.total++;
      const s = r.status as string;
      if (s in acc) {
        (acc as Record<string, number>)[s]++;
      }
      return acc;
    },
    { total: 0, pending: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, complained: 0 }
  );

  return NextResponse.json({
    campaign_id: id,
    name: campaign.name,
    status: campaign.status,
    sent_at: campaign.sent_at,
    stats: counts,
    stored_stats: campaign.stats,
  });
}
