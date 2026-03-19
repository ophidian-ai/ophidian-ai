import { createClient } from "@/lib/supabase/server";
import type { CrmDeal, CrmPipeline } from "@/lib/supabase/crm-types";
import { CRM_TIER_DEFAULTS } from "./tier-defaults";
import { logActivity } from "./activities";
import { evaluateAutomations } from "./automations";

interface PipelineStage {
  name: string;
  probability: number;
  color?: string;
}

async function getPipelineWithStages(
  pipelineId: string
): Promise<CrmPipeline & { stages: PipelineStage[] }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("crm_pipelines")
    .select("*")
    .eq("id", pipelineId)
    .single();

  if (error || !data) {
    throw new Error(`Pipeline not found: ${error?.message}`);
  }

  return data as CrmPipeline & { stages: PipelineStage[] };
}

function findStage(
  stages: PipelineStage[],
  stageName: string
): PipelineStage | undefined {
  return stages.find((s) => s.name === stageName);
}

export async function createDeal(
  configId: string,
  data: {
    pipelineId: string;
    contactId: string;
    title: string;
    value?: number;
    stage: string;
    source: string;
    expectedCloseAt?: string;
    customFieldValues?: Record<string, unknown>;
  }
): Promise<CrmDeal> {
  const supabase = await createClient();

  // Load config to check tier limits
  const { data: config, error: configError } = await supabase
    .from("crm_configs")
    .select("*")
    .eq("id", configId)
    .single();

  if (configError || !config) {
    throw new Error(`CRM config not found: ${configError?.message}`);
  }

  const tierDefaults = CRM_TIER_DEFAULTS[config.tier as keyof typeof CRM_TIER_DEFAULTS];

  // Check max deals limit
  if (tierDefaults.maxDeals !== null) {
    const { count, error: countError } = await supabase
      .from("crm_deals")
      .select("id", { count: "exact", head: true })
      .eq("config_id", configId);

    if (countError) {
      throw new Error(`Failed to count deals: ${countError.message}`);
    }

    if ((count ?? 0) >= tierDefaults.maxDeals) {
      throw new Error("Deal limit reached for this account tier");
    }
  }

  // Validate stage against pipeline stages
  const pipeline = await getPipelineWithStages(data.pipelineId);
  const stage = findStage(pipeline.stages, data.stage);

  if (!stage) {
    throw new Error(
      `Stage "${data.stage}" does not exist in pipeline "${pipeline.name}"`
    );
  }

  const { data: deal, error: insertError } = await supabase
    .from("crm_deals")
    .insert({
      config_id: configId,
      pipeline_id: data.pipelineId,
      contact_id: data.contactId,
      title: data.title,
      value: data.value ?? null,
      stage: data.stage,
      probability: stage.probability,
      source: data.source,
      expected_close_at: data.expectedCloseAt ?? null,
      custom_field_values: data.customFieldValues ?? null,
    })
    .select()
    .single();

  if (insertError || !deal) {
    throw new Error(`Failed to create deal: ${insertError?.message}`);
  }

  const created = deal as CrmDeal;

  await logActivity(
    configId,
    data.contactId,
    "deal_created",
    `Deal created: ${data.title}`,
    { type: "deal", id: created.id },
    created.id
  );

  return created;
}

export async function updateDealStage(
  dealId: string,
  newStage: string
): Promise<CrmDeal> {
  const supabase = await createClient();

  // Load deal
  const { data: dealData, error: dealError } = await supabase
    .from("crm_deals")
    .select("*")
    .eq("id", dealId)
    .single();

  if (dealError || !dealData) {
    throw new Error(`Deal not found: ${dealError?.message}`);
  }

  const deal = dealData as CrmDeal;

  // Load pipeline
  const pipeline = await getPipelineWithStages(deal.pipeline_id);
  const stage = findStage(pipeline.stages, newStage);

  if (!stage) {
    throw new Error(
      `Stage "${newStage}" does not exist in pipeline "${pipeline.name}"`
    );
  }

  const now = new Date().toISOString();
  const updates: Partial<CrmDeal> = {
    stage: newStage,
    probability: stage.probability,
    won_at: null,
    lost_at: null,
  };

  if (stage.probability === 100) {
    updates.won_at = now;
  } else if (stage.probability === 0) {
    updates.lost_at = now;
  }

  const { data: updated, error: updateError } = await supabase
    .from("crm_deals")
    .update(updates)
    .eq("id", dealId)
    .select()
    .single();

  if (updateError || !updated) {
    throw new Error(`Failed to update deal stage: ${updateError?.message}`);
  }

  const updatedDeal = updated as CrmDeal;

  await logActivity(
    deal.config_id,
    deal.contact_id,
    "deal_stage_change",
    `Deal stage changed to: ${newStage}`,
    { type: "deal", id: dealId },
    dealId
  );

  // Fire automations
  await evaluateAutomations(deal.config_id, "deal_stage_change", {
    dealId,
    stage: newStage,
    probability: stage.probability,
  });

  if (stage.probability === 100) {
    await evaluateAutomations(deal.config_id, "deal_won", { dealId });
  } else if (stage.probability === 0) {
    await evaluateAutomations(deal.config_id, "deal_lost", { dealId });
  }

  return updatedDeal;
}

export async function getDealsForPipeline(
  pipelineId: string
): Promise<CrmDeal[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("crm_deals")
    .select("*")
    .eq("pipeline_id", pipelineId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch deals: ${error.message}`);
  }

  return (data ?? []) as CrmDeal[];
}
