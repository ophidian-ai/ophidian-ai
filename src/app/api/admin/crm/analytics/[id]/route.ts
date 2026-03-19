import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CrmDeal } from "@/lib/supabase/crm-types";

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
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  // id is the pipeline_id
  const { data: deals, error: dealsError } = await supabase!
    .from("crm_deals")
    .select("*")
    .eq("pipeline_id", id);

  if (dealsError) {
    return NextResponse.json({ error: dealsError.message }, { status: 500 });
  }

  const allDeals = (deals ?? []) as CrmDeal[];

  // Group by stage
  const byStage: Record<string, { count: number; total_value: number; weighted_value: number }> = {};

  let totalValue = 0;
  let weightedValue = 0;
  let wonCount = 0;
  let lostCount = 0;

  for (const deal of allDeals) {
    if (!byStage[deal.stage]) {
      byStage[deal.stage] = { count: 0, total_value: 0, weighted_value: 0 };
    }

    const value = deal.value ?? 0;
    const prob = deal.probability / 100;
    const dealWeighted = value * prob;

    byStage[deal.stage].count += 1;
    byStage[deal.stage].total_value += value;
    byStage[deal.stage].weighted_value += dealWeighted;

    totalValue += value;
    weightedValue += dealWeighted;

    if (deal.won_at) wonCount += 1;
    if (deal.lost_at) lostCount += 1;
  }

  const closedCount = wonCount + lostCount;
  const winRate = closedCount > 0 ? Math.round((wonCount / closedCount) * 100) : null;

  return NextResponse.json({
    pipeline_id: id,
    deal_count: allDeals.length,
    total_value: totalValue,
    weighted_value: weightedValue,
    win_rate: winRate,
    won_count: wonCount,
    lost_count: lostCount,
    by_stage: byStage,
  });
}
