import { createClient } from "@/lib/supabase/server";
import type { CrmActivity } from "@/lib/supabase/crm-types";

export async function logActivity(
  configId: string,
  contactId: string,
  type: string,
  description: string,
  linkedContent?: { type: string; id: string },
  dealId?: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("crm_activities").insert({
    config_id: configId,
    contact_id: contactId,
    deal_id: dealId ?? null,
    type,
    description,
    linked_content_type: linkedContent?.type ?? null,
    linked_content_id: linkedContent?.id ?? null,
    auto_logged: true,
    linked_content_available: true,
  });

  if (error) {
    throw new Error(`Failed to log activity: ${error.message}`);
  }
}

export async function getTimeline(
  contactId: string,
  limit = 50,
  offset = 0
): Promise<CrmActivity[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("crm_activities")
    .select("*")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to fetch timeline: ${error.message}`);
  }

  return (data ?? []) as CrmActivity[];
}

export async function markLinkedContentDeleted(
  contentType: string,
  contentId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("crm_activities")
    .update({ linked_content_available: false })
    .eq("linked_content_type", contentType)
    .eq("linked_content_id", contentId);

  if (error) {
    throw new Error(`Failed to mark linked content deleted: ${error.message}`);
  }
}
