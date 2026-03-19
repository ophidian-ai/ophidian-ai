import { createClient } from "@/lib/supabase/server";
import { unsubscribeContact } from "./contacts";

export async function processResendEvent(payload: unknown): Promise<void> {
  const supabase = await createClient();

  const event = payload as Record<string, unknown>;
  const eventType: string = (event.type as string) ?? "";
  const data = (event.data as Record<string, unknown>) ?? {};
  const resendMessageId: string = (data.email_id as string) ?? "";

  if (!resendMessageId) {
    console.error("[processResendEvent] Missing email_id in payload");
    return;
  }

  // Insert raw event record
  await supabase.from("email_events").insert({
    resend_message_id: resendMessageId,
    event_type: eventType,
    payload: event,
  });

  // Find matching campaign recipient
  const { data: recipient, error: recipientError } = await supabase
    .from("email_campaign_recipients")
    .select("*")
    .eq("resend_message_id", resendMessageId)
    .single();

  if (recipientError || !recipient) {
    // Event may be for a sequence email -- no campaign recipient, still process contact events
    await handleContactEngagement(supabase, resendMessageId, eventType, data);
    return;
  }

  // Build recipient update based on event type
  const now = new Date().toISOString();
  let recipientUpdate: Record<string, unknown> = {};

  switch (eventType) {
    case "email.delivered":
      recipientUpdate = { status: "delivered" };
      break;

    case "email.opened":
      recipientUpdate = { status: "opened", opened_at: now };
      break;

    case "email.clicked": {
      const clickUrl = (data.click as Record<string, unknown>)?.link as string | undefined;
      let linkClicks: Record<string, number> = (recipient.link_clicks as Record<string, number>) ?? {};
      if (clickUrl) {
        linkClicks = { ...linkClicks, [clickUrl]: (linkClicks[clickUrl] ?? 0) + 1 };
      }
      recipientUpdate = { status: "clicked", clicked_at: now, link_clicks: linkClicks };
      break;
    }

    case "email.bounced":
      recipientUpdate = { status: "bounced" };
      break;

    case "email.complained":
      recipientUpdate = { status: "complained" };
      await unsubscribeContact(recipient.contact_id);
      break;

    case "email.unsubscribed":
      await unsubscribeContact(recipient.contact_id);
      break;

    default:
      // Unknown event type -- still log, no status change
      break;
  }

  if (Object.keys(recipientUpdate).length > 0) {
    await supabase
      .from("email_campaign_recipients")
      .update(recipientUpdate)
      .eq("id", recipient.id);
  }

  // Update contact engagement for open/click events
  await handleContactEngagement(supabase, resendMessageId, eventType, data);

  // Check if contact is in an active sequence enrollment and may satisfy a condition
  if (eventType === "email.opened" || eventType === "email.clicked") {
    await checkSequenceConditions(supabase, recipient.contact_id);
  }
}

async function handleContactEngagement(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  resendMessageId: string,
  eventType: string,
  _data: Record<string, unknown>
): Promise<void> {
  if (eventType !== "email.opened" && eventType !== "email.clicked") {
    return;
  }

  // Find contact from campaign recipients (or sequence sends if we had that table)
  const { data: recipient } = await supabase
    .from("email_campaign_recipients")
    .select("contact_id")
    .eq("resend_message_id", resendMessageId)
    .single();

  if (!recipient) {
    return;
  }

  const { data: contact } = await supabase
    .from("email_contacts")
    .select("engagement_score")
    .eq("id", recipient.contact_id)
    .single();

  if (!contact) {
    return;
  }

  await supabase
    .from("email_contacts")
    .update({
      engagement_score: (contact.engagement_score ?? 0) + 1,
      last_engaged_at: new Date().toISOString(),
    })
    .eq("id", recipient.contact_id);
}

async function checkSequenceConditions(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  contactId: string
): Promise<void> {
  // Find active enrollments for this contact
  const { data: enrollments, error } = await supabase
    .from("email_sequence_enrollments")
    .select("id, next_send_at, status")
    .eq("contact_id", contactId)
    .eq("status", "active");

  if (error || !enrollments || enrollments.length === 0) {
    return;
  }

  // For each enrollment where next_send_at is in the future due to a condition gate,
  // we nudge it to now so the sequence processor can pick it up on the next cron cycle.
  // The processSequenceStep function owns condition evaluation; we just signal readiness.
  for (const enrollment of enrollments) {
    if (enrollment.next_send_at && enrollment.next_send_at > new Date().toISOString()) {
      await supabase
        .from("email_sequence_enrollments")
        .update({ next_send_at: new Date().toISOString() })
        .eq("id", enrollment.id);
    }
  }
}
