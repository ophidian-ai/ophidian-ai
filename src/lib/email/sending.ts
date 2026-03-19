import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import type { EmailConfig, EmailContact } from "@/lib/supabase/email-types";
import { SEND_RATE_PER_SECOND } from "./tier-defaults";

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY!);
  }
  return resend;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function sendEmail(
  config: EmailConfig,
  contact: EmailContact,
  subject: string,
  html: string
): Promise<string | null> {
  const client = getResend();

  try {
    const { data, error } = await client.emails.send({
      from: `${config.from_name} <${config.from_email}>`,
      to: contact.email,
      subject,
      html,
    });

    if (error || !data) {
      console.error("[sendEmail] Resend error:", error);
      return null;
    }

    return data.id;
  } catch (err) {
    console.error("[sendEmail] Unexpected error:", err);
    return null;
  }
}

export async function sendCampaignBatch(campaignId: string): Promise<void> {
  const supabase = await createClient();

  // Load campaign + config
  const { data: campaign, error: campaignError } = await supabase
    .from("email_campaigns")
    .select("*, email_configs(*)")
    .eq("id", campaignId)
    .single();

  if (campaignError || !campaign) {
    throw new Error(`Campaign not found: ${campaignError?.message}`);
  }

  const emailConfig = campaign.email_configs as EmailConfig;

  // Count pending recipients
  const { count: recipientCount, error: countError } = await supabase
    .from("email_campaign_recipients")
    .select("id", { count: "exact", head: true })
    .eq("campaign_id", campaignId)
    .eq("status", "pending");

  if (countError) {
    throw new Error(`Failed to count recipients: ${countError.message}`);
  }

  const batchSize = recipientCount ?? 0;

  if (batchSize === 0) {
    return;
  }

  // Check send limit via RPC
  const { data: allowed, error: rpcError } = await supabase.rpc(
    "increment_and_check_send_limit",
    {
      p_config_id: emailConfig.id,
      p_count: batchSize,
    }
  );

  if (rpcError) {
    console.error("[sendCampaignBatch] RPC error:", rpcError);
  }

  if (allowed === false) {
    await supabase
      .from("email_campaigns")
      .update({ status: "cancelled" })
      .eq("id", campaignId);
    return;
  }

  // Load pending recipients
  const { data: recipients, error: recipientsError } = await supabase
    .from("email_campaign_recipients")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("status", "pending");

  if (recipientsError || !recipients) {
    throw new Error(`Failed to load recipients: ${recipientsError?.message}`);
  }

  // Import renderTemplate here to avoid circular dependency
  const { renderTemplate } = await import("./templates");

  // Load template for campaign
  const { data: template, error: templateError } = await supabase
    .from("email_templates")
    .select("*")
    .eq("id", campaign.template_id)
    .single();

  if (templateError || !template) {
    throw new Error(`Template not found: ${templateError?.message}`);
  }

  // Rate-paced send loop
  let sentInCurrentSecond = 0;
  let secondStart = Date.now();

  for (const recipient of recipients) {
    // Rate limiting: pause when we hit SEND_RATE_PER_SECOND
    if (sentInCurrentSecond >= SEND_RATE_PER_SECOND) {
      const elapsed = Date.now() - secondStart;
      if (elapsed < 1000) {
        await sleep(1000 - elapsed);
      }
      sentInCurrentSecond = 0;
      secondStart = Date.now();
    }

    // Load contact
    const { data: contact, error: contactError } = await supabase
      .from("email_contacts")
      .select("*")
      .eq("id", recipient.contact_id)
      .single();

    if (contactError || !contact) {
      console.error(`[sendCampaignBatch] Contact not found for recipient ${recipient.id}`);
      continue;
    }

    // Render template
    const rendered = renderTemplate(template, contact as EmailContact, emailConfig);

    // Send email
    const messageId = await sendEmail(
      emailConfig,
      contact as EmailContact,
      rendered.subject,
      rendered.html
    );

    // Update recipient record
    await supabase
      .from("email_campaign_recipients")
      .update({
        resend_message_id: messageId,
        status: messageId ? "sent" : "pending",
        sent_at: messageId ? new Date().toISOString() : null,
      })
      .eq("id", recipient.id);

    sentInCurrentSecond++;
  }

  // Mark campaign as sent
  await supabase
    .from("email_campaigns")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", campaignId);
}
