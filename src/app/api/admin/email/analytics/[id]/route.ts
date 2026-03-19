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

  // id here is the email_config id
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") ?? "30", 10);

  const sinceDate = new Date(Date.now() - days * 86400000).toISOString();

  // Load all campaigns for this config in the window
  const { data: campaigns, error: campaignsError } = await supabase!
    .from("email_campaigns")
    .select("id, name, status, sent_at, stats")
    .eq("config_id", id)
    .gte("created_at", sinceDate)
    .order("created_at", { ascending: false });

  if (campaignsError) {
    return NextResponse.json({ error: campaignsError.message }, { status: 500 });
  }

  // Aggregate recipient stats across all campaigns in window
  const campaignIds = (campaigns ?? []).map((c) => c.id);

  let recipientStats = { total: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, complained: 0 };

  if (campaignIds.length > 0) {
    const { data: recipients, error: recipientsError } = await supabase!
      .from("email_campaign_recipients")
      .select("status")
      .in("campaign_id", campaignIds);

    if (recipientsError) {
      return NextResponse.json({ error: recipientsError.message }, { status: 500 });
    }

    recipientStats = (recipients ?? []).reduce(
      (acc, r) => {
        acc.total++;
        const s = r.status as string;
        if (s in acc) {
          (acc as Record<string, number>)[s]++;
        }
        return acc;
      },
      { total: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, complained: 0 }
    );
  }

  // Sequence enrollment stats for this config
  const { data: sequences, error: sequencesError } = await supabase!
    .from("email_sequences")
    .select("id")
    .eq("config_id", id);

  if (sequencesError) {
    return NextResponse.json({ error: sequencesError.message }, { status: 500 });
  }

  const sequenceIds = (sequences ?? []).map((s) => s.id);
  let enrollmentStats = { total: 0, active: 0, completed: 0, unsubscribed: 0 };

  if (sequenceIds.length > 0) {
    const { data: enrollments, error: enrollError } = await supabase!
      .from("email_sequence_enrollments")
      .select("status")
      .in("sequence_id", sequenceIds)
      .gte("created_at", sinceDate);

    if (enrollError) {
      return NextResponse.json({ error: enrollError.message }, { status: 500 });
    }

    enrollmentStats = (enrollments ?? []).reduce(
      (acc, e) => {
        acc.total++;
        const s = e.status as string;
        if (s in acc) {
          (acc as Record<string, number>)[s]++;
        }
        return acc;
      },
      { total: 0, active: 0, completed: 0, unsubscribed: 0 }
    );
  }

  // Contact count
  const { count: contactCount } = await supabase!
    .from("email_contacts")
    .select("id", { count: "exact", head: true })
    .eq("client_id", id); // Note: caller may pass client_id; adjust if needed

  return NextResponse.json({
    config_id: id,
    period_days: days,
    campaigns: {
      count: (campaigns ?? []).length,
      list: campaigns ?? [],
    },
    recipients: recipientStats,
    sequences: {
      count: sequenceIds.length,
      enrollments: enrollmentStats,
    },
    contacts: {
      total: contactCount ?? 0,
    },
  });
}
