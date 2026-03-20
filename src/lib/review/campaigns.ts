import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import type { ReviewConfig, ReviewCampaign } from "@/lib/supabase/review-types";
import type { EmailContact } from "@/lib/supabase/email-types";
import { CAMPAIGN_MAX_CONTACTS } from "@/lib/review/tier-defaults";
import { getGbpLocation } from "@/lib/review/gbp-client";

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY!);
  }
  return resend;
}

/**
 * Create a review request campaign record (Pro tier only).
 */
export async function createCampaign(
  configId: string,
  data: { name: string; review_link?: string }
): Promise<ReviewCampaign> {
  const supabase = await createClient();

  // Load config to enforce Pro tier
  const { data: config, error: configError } = await supabase
    .from("review_configs")
    .select("*")
    .eq("id", configId)
    .single();

  if (configError || !config) {
    throw new Error("Review config not found");
  }

  if (config.tier !== "pro") {
    throw new Error("Review request campaigns require the Pro tier");
  }

  // Resolve review link
  const reviewLink = data.review_link ?? (await getReviewLink(config as ReviewConfig));

  const { data: campaign, error } = await supabase
    .from("review_campaigns")
    .insert({
      config_id: configId,
      name: data.name,
      review_link: reviewLink,
      contacts_targeted: 0,
      emails_sent: 0,
      emails_opened: 0,
      link_clicked: 0,
      reviews_attributed: 0,
      status: "draft",
      scheduled_at: null,
      sent_at: null,
    })
    .select()
    .single();

  if (error || !campaign) {
    throw new Error(`Failed to create campaign: ${error?.message}`);
  }

  return campaign as ReviewCampaign;
}

/**
 * Get the Google review link for a config.
 * Uses GBP API if connected, otherwise falls back to a stored value.
 */
export async function getReviewLink(config: ReviewConfig): Promise<string> {
  // Try GBP API first
  if (config.gbp_account_id && config.gbp_location_id && config.gbp_oauth_token) {
    try {
      const location = await getGbpLocation(config);
      if (location?.metadata?.newReviewUrl) {
        return location.metadata.newReviewUrl;
      }
    } catch (err) {
      console.error("[getReviewLink] GBP lookup failed:", err);
    }
  }

  // Fall back to a manually constructed Google review search URL
  // This is a common public pattern -- users can also override via campaign form
  return `https://search.google.com/local/writereview?placeid=${config.gbp_location_id ?? ""}`;
}

/**
 * Build branded HTML email for a review request.
 */
export function buildEmailHtml(
  config: ReviewConfig,
  campaign: ReviewCampaign,
  contact: EmailContact
): string {
  const firstName = contact.name?.split(" ")[0] ?? "there";
  const reviewLink = campaign.review_link;
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://ophidianai.com"}/api/email/unsubscribe?id=${contact.id}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${campaign.name}</title>
</head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;">
          <tr>
            <td style="padding:32px 40px 24px;text-align:center;background:#0a0a0f;">
              <img src="https://ophidianai.com/images/logo_icon.png" alt="Logo" width="40" height="40" style="display:block;margin:0 auto 12px;" />
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px;font-size:16px;color:#111111;">Hi ${firstName},</p>
              <p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.6;">
                Thank you for your recent visit. We hope you had a great experience!
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#444444;line-height:1.6;">
                If you have a moment, we'd love to hear your feedback. Leaving a quick review helps others discover us and means a lot to our team.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                <tr>
                  <td style="background:#39ff14;border-radius:6px;">
                    <a href="${reviewLink}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#0a0a0f;text-decoration:none;">
                      Leave a Review
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:13px;color:#888888;line-height:1.5;">
                Thank you for your support.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #eeeeee;text-align:center;">
              <p style="margin:0;font-size:11px;color:#aaaaaa;">
                You're receiving this because you're a valued customer.
                <a href="${unsubscribeUrl}" style="color:#888888;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Send a review request campaign to eligible contacts.
 * Pro tier only. Filters email_contacts by client_id, subscribed=true.
 */
export async function sendCampaign(campaignId: string): Promise<ReviewCampaign> {
  const supabase = await createClient();

  // Load campaign + config
  const { data: campaign, error: campaignError } = await supabase
    .from("review_campaigns")
    .select("*, review_configs(*)")
    .eq("id", campaignId)
    .single();

  if (campaignError || !campaign) {
    throw new Error(`Campaign not found: ${campaignError?.message}`);
  }

  const config = campaign.review_configs as ReviewConfig;

  if (config.tier !== "pro") {
    throw new Error("Review request campaigns require the Pro tier");
  }

  if (campaign.status !== "draft") {
    throw new Error(`Campaign is not in draft status (current: ${campaign.status})`);
  }

  // Get eligible contacts from email_contacts
  const { data: contacts, error: contactsError } = await supabase
    .from("email_contacts")
    .select("*")
    .eq("client_id", config.client_id)
    .eq("subscribed", true)
    .overlaps("tags", ["customer"])
    .limit(CAMPAIGN_MAX_CONTACTS);

  if (contactsError) {
    throw new Error(`Failed to load contacts: ${contactsError.message}`);
  }

  const eligibleContacts = (contacts ?? []) as EmailContact[];
  const client = getResend();

  // Update contacts_targeted
  await supabase
    .from("review_campaigns")
    .update({ contacts_targeted: eligibleContacts.length, status: "sent" })
    .eq("id", campaignId);

  let emailsSent = 0;

  for (const contact of eligibleContacts) {
    const html = buildEmailHtml(config, campaign as ReviewCampaign, contact);
    const firstName = contact.name?.split(" ")[0] ?? "there";

    try {
      const { data, error } = await client.emails.send({
        from: "OphidianAI Reviews <reviews@ophidianai.com>",
        to: contact.email,
        subject: `Hi ${firstName}, would you mind leaving us a review?`,
        html,
      });

      if (!error && data) {
        emailsSent++;
      }
    } catch (err) {
      console.error(`[sendCampaign] Failed to send to ${contact.email}:`, err);
    }
  }

  // Update final counts
  const { data: updated, error: updateError } = await supabase
    .from("review_campaigns")
    .update({
      emails_sent: emailsSent,
      sent_at: new Date().toISOString(),
      status: "sent",
    })
    .eq("id", campaignId)
    .select()
    .single();

  if (updateError || !updated) {
    throw new Error(`Failed to update campaign: ${updateError?.message}`);
  }

  return updated as ReviewCampaign;
}

/**
 * Attribute reviews to a campaign.
 * Looks for new reviews that arrived within 48h of the campaign send date.
 * Approximate attribution only.
 */
export async function attributeReviews(campaignId: string): Promise<number> {
  const supabase = await createClient();

  const { data: campaign, error } = await supabase
    .from("review_campaigns")
    .select("*, review_configs(config_id)")
    .eq("id", campaignId)
    .single();

  if (error || !campaign || !campaign.sent_at) {
    return 0;
  }

  const sentAt = new Date(campaign.sent_at);
  const windowEnd = new Date(sentAt.getTime() + 48 * 60 * 60 * 1000).toISOString();

  // Count new reviews that arrived in the 48h window after campaign send
  const { count } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("config_id", campaign.config_id)
    .gte("created_at", campaign.sent_at)
    .lte("created_at", windowEnd);

  const attributed = count ?? 0;

  if (attributed > 0) {
    await supabase
      .from("review_campaigns")
      .update({ reviews_attributed: attributed })
      .eq("id", campaignId);
  }

  return attributed;
}
