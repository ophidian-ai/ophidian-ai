import { createClient } from "@/lib/supabase/server";
import type { CrmConfig } from "@/lib/supabase/crm-types";
import { CRM_TIER_DEFAULTS } from "./tier-defaults";
import { logActivity } from "./activities";
import { createDeal } from "./deals";

async function getCrmConfigForClient(
  clientId: string
): Promise<CrmConfig | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("crm_configs")
    .select("*")
    .eq("client_id", clientId)
    .eq("active", true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as CrmConfig;
}

async function getOrCreateDefaultPipeline(configId: string): Promise<string> {
  const supabase = await createClient();

  // Try to find default pipeline
  const { data: existing } = await supabase
    .from("crm_pipelines")
    .select("id")
    .eq("config_id", configId)
    .eq("is_default", true)
    .single();

  if (existing) {
    return existing.id;
  }

  // Create default pipeline
  const { DEFAULT_PIPELINE_STAGES } = await import("./tier-defaults");

  const { data: created, error } = await supabase
    .from("crm_pipelines")
    .insert({
      config_id: configId,
      name: "Sales Pipeline",
      stages: DEFAULT_PIPELINE_STAGES,
      is_default: true,
    })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error(`Failed to create default pipeline: ${error?.message}`);
  }

  return created.id;
}

async function upsertEmailContact(
  clientId: string,
  data: { email: string; name?: string; phone?: string }
): Promise<string> {
  const supabase = await createClient();

  const { data: contact, error } = await supabase
    .from("email_contacts")
    .upsert(
      {
        client_id: clientId,
        email: data.email,
        name: data.name ?? null,
        phone: data.phone ?? null,
        tags: [],
        source: "crm_event_bus",
      },
      { onConflict: "client_id,email", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (error || !contact) {
    throw new Error(`Failed to upsert contact: ${error?.message}`);
  }

  return contact.id;
}

export async function onChatbotLeadCaptured(
  clientId: string,
  lead: { name?: string; email: string; phone?: string; conversationId?: string }
): Promise<void> {
  try {
    const config = await getCrmConfigForClient(clientId);
    if (!config) {
      return;
    }

    // Upsert contact
    const contactId = await upsertEmailContact(clientId, {
      email: lead.email,
      name: lead.name,
      phone: lead.phone,
    });

    // Get or create default pipeline
    const pipelineId = await getOrCreateDefaultPipeline(config.id);

    // Create deal
    const dealTitle = lead.name || lead.email;
    await createDeal(config.id, {
      pipelineId,
      contactId,
      title: dealTitle,
      stage: "Lead",
      source: "chatbot",
    });

    // Log chatbot conversation activity
    if (lead.conversationId) {
      await logActivity(
        config.id,
        contactId,
        "chatbot_conversation",
        `Lead captured via chatbot conversation`,
        { type: "chatbot_conversation", id: lead.conversationId }
      );
    }
  } catch (err) {
    console.error("[crm/event-bus] onChatbotLeadCaptured error:", err);
  }
}

export async function onEmailEvent(
  clientId: string,
  contactId: string,
  eventType: string,
  campaignId?: string
): Promise<void> {
  try {
    const config = await getCrmConfigForClient(clientId);
    if (!config) {
      return;
    }

    // Check tier allows auto-logging (Growth/Pro)
    const tierDefaults = CRM_TIER_DEFAULTS[config.tier as keyof typeof CRM_TIER_DEFAULTS];
    if (tierDefaults.apiAccess === "none") {
      return;
    }

    await logActivity(
      config.id,
      contactId,
      `email_${eventType}`,
      `Email event: ${eventType}`,
      campaignId ? { type: "email_campaign", id: campaignId } : undefined
    );
  } catch (err) {
    console.error("[crm/event-bus] onEmailEvent error:", err);
  }
}

export async function onSeoAuditCompleted(
  clientId: string,
  contactId: string,
  auditId: string
): Promise<void> {
  try {
    const config = await getCrmConfigForClient(clientId);
    if (!config) {
      return;
    }

    await logActivity(
      config.id,
      contactId,
      "seo_audit",
      `SEO audit completed`,
      { type: "seo_audit", id: auditId }
    );
  } catch (err) {
    console.error("[crm/event-bus] onSeoAuditCompleted error:", err);
  }
}

export async function onContentPublished(
  clientId: string,
  blogPostId: string
): Promise<void> {
  try {
    const config = await getCrmConfigForClient(clientId);
    if (!config) {
      return;
    }

    // Log against a synthetic system contact -- no individual contact for blog events
    // We log at config level with a placeholder contact; contact_id is required by schema
    // so we use the config_id as a correlation key and skip if no real contact exists
    const supabase = await createClient();
    const { data: anyContact } = await supabase
      .from("email_contacts")
      .select("id")
      .eq("client_id", clientId)
      .limit(1)
      .single();

    if (!anyContact) {
      return;
    }

    await logActivity(
      config.id,
      anyContact.id,
      "blog_published",
      `Blog post published`,
      { type: "blog_post", id: blogPostId }
    );
  } catch (err) {
    console.error("[crm/event-bus] onContentPublished error:", err);
  }
}

export async function onContactFormSubmitted(
  clientId: string,
  formData: { name?: string; email: string; phone?: string; source?: string }
): Promise<void> {
  try {
    const config = await getCrmConfigForClient(clientId);
    if (!config) {
      return;
    }

    const contactId = await upsertEmailContact(clientId, {
      email: formData.email,
      name: formData.name,
      phone: formData.phone,
    });

    const pipelineId = await getOrCreateDefaultPipeline(config.id);

    const dealTitle = formData.name || formData.email;
    await createDeal(config.id, {
      pipelineId,
      contactId,
      title: dealTitle,
      stage: "Lead",
      source: formData.source ?? "contact_form",
    });

    await logActivity(
      config.id,
      contactId,
      "contact_form_submitted",
      `Contact form submitted`
    );
  } catch (err) {
    console.error("[crm/event-bus] onContactFormSubmitted error:", err);
  }
}
