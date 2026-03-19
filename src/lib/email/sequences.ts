import { createClient } from "@/lib/supabase/server";
import type { EmailSequenceEnrollment, EmailSequence, EmailContact, EmailConfig } from "@/lib/supabase/email-types";
import { sendEmail } from "./sending";
import { renderTemplate } from "./templates";

export async function enrollContact(sequenceId: string, contactId: string): Promise<void> {
  const supabase = await createClient();

  // Load sequence to get first step's delay
  const { data: sequence, error: seqError } = await supabase
    .from("email_sequences")
    .select("*")
    .eq("id", sequenceId)
    .single();

  if (seqError || !sequence) {
    throw new Error(`Sequence not found: ${seqError?.message}`);
  }

  const seq = sequence as EmailSequence;

  if (!seq.steps || seq.steps.length === 0) {
    throw new Error("Sequence has no steps");
  }

  const firstStep = seq.steps[0];
  const nextSendAt = new Date(
    Date.now() + firstStep.delay_hours * 60 * 60 * 1000
  ).toISOString();

  // Insert enrollment -- partial unique index on (sequence_id, contact_id) WHERE status='active'
  // handles deduplication so concurrent enrollments won't double-enroll active contacts
  const { error: insertError } = await supabase
    .from("email_sequence_enrollments")
    .insert({
      sequence_id: sequenceId,
      contact_id: contactId,
      current_step: 0,
      status: "active",
      next_send_at: nextSendAt,
    });

  if (insertError) {
    // Ignore unique constraint violation (already enrolled)
    if (insertError.code === "23505") {
      return;
    }
    throw new Error(`Failed to enroll contact: ${insertError.message}`);
  }
}

export async function processSequenceStep(enrollmentId: string): Promise<void> {
  const supabase = await createClient();

  // Load enrollment
  const { data: enrollment, error: enrollError } = await supabase
    .from("email_sequence_enrollments")
    .select("*")
    .eq("id", enrollmentId)
    .single();

  if (enrollError || !enrollment) {
    throw new Error(`Enrollment not found: ${enrollError?.message}`);
  }

  const enroll = enrollment as EmailSequenceEnrollment;

  if (enroll.status !== "active") {
    return;
  }

  // Load sequence
  const { data: sequence, error: seqError } = await supabase
    .from("email_sequences")
    .select("*, email_configs(*)")
    .eq("id", enroll.sequence_id)
    .single();

  if (seqError || !sequence) {
    throw new Error(`Sequence not found: ${seqError?.message}`);
  }

  const seq = sequence as EmailSequence & { email_configs: EmailConfig };
  const emailConfig = seq.email_configs;

  if (!seq.steps || enroll.current_step >= seq.steps.length) {
    // All steps completed
    await supabase
      .from("email_sequence_enrollments")
      .update({ status: "completed" })
      .eq("id", enrollmentId);
    return;
  }

  const step = seq.steps[enroll.current_step];

  // Load contact
  const { data: contactData, error: contactError } = await supabase
    .from("email_contacts")
    .select("*")
    .eq("id", enroll.contact_id)
    .single();

  if (contactError || !contactData) {
    throw new Error(`Contact not found: ${contactError?.message}`);
  }

  const contact = contactData as EmailContact;

  // Check condition if this step has one
  if (step.condition) {
    const conditionMet = await evaluateStepCondition(
      supabase,
      enroll,
      seq,
      step.condition
    );

    if (!conditionMet) {
      // Retry in 1 hour -- condition not yet satisfied
      const retryAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await supabase
        .from("email_sequence_enrollments")
        .update({ next_send_at: retryAt })
        .eq("id", enrollmentId);
      return;
    }
  }

  // Load template for this step
  const { data: template, error: templateError } = await supabase
    .from("email_templates")
    .select("*")
    .eq("id", step.template_id)
    .single();

  if (templateError || !template) {
    throw new Error(`Template not found for step ${enroll.current_step}: ${templateError?.message}`);
  }

  // Render and send
  const rendered = renderTemplate(template, contact, emailConfig);
  await sendEmail(emailConfig, contact, rendered.subject, rendered.html);

  // Advance to next step
  const nextStep = enroll.current_step + 1;
  const isLastStep = nextStep >= seq.steps.length;

  if (isLastStep) {
    await supabase
      .from("email_sequence_enrollments")
      .update({ current_step: nextStep, status: "completed", next_send_at: null })
      .eq("id", enrollmentId);
  } else {
    const nextStepDef = seq.steps[nextStep];
    const nextSendAt = new Date(
      Date.now() + nextStepDef.delay_hours * 60 * 60 * 1000
    ).toISOString();

    await supabase
      .from("email_sequence_enrollments")
      .update({ current_step: nextStep, next_send_at: nextSendAt })
      .eq("id", enrollmentId);
  }
}

async function evaluateStepCondition(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  enrollment: EmailSequenceEnrollment,
  sequence: EmailSequence,
  condition: { type: string; step: number }
): Promise<boolean> {
  // Condition references a prior step. We check if the contact opened/clicked
  // the email sent in that prior step by looking at campaign_recipients records
  // linked to this enrollment's contact.
  //
  // Since sequence sends are not tracked as campaign_recipients, we check the
  // contact's engagement (open/click events) after the sequence started.

  if (condition.type === "opened" || condition.type === "clicked") {
    const { data: contact } = await supabase
      .from("email_contacts")
      .select("last_engaged_at")
      .eq("id", enrollment.contact_id)
      .single();

    if (!contact || !contact.last_engaged_at) {
      return false;
    }

    // If contact engaged after enrollment was created, treat condition as met
    return contact.last_engaged_at > enrollment.created_at;
  }

  // Unknown condition type -- default to true (do not block)
  return true;
}

export async function evaluateTriggers(
  clientId: string,
  eventType: string,
  eventData: Record<string, unknown>
): Promise<void> {
  const supabase = await createClient();

  // Find active sequences matching this trigger type for this client
  const { data: sequences, error } = await supabase
    .from("email_sequences")
    .select("*, email_configs!inner(client_id)")
    .eq("email_configs.client_id", clientId)
    .eq("trigger_type", eventType)
    .eq("active", true);

  if (error || !sequences || sequences.length === 0) {
    return;
  }

  // Get contact by email from eventData
  const email = eventData.email as string | undefined;
  if (!email) {
    return;
  }

  const { data: contact, error: contactError } = await supabase
    .from("email_contacts")
    .select("id")
    .eq("client_id", clientId)
    .eq("email", email)
    .single();

  if (contactError || !contact) {
    return;
  }

  for (const sequence of sequences) {
    const seq = sequence as EmailSequence & { email_configs: { client_id: string } };

    // Check trigger_config conditions against eventData
    const configMatches = evaluateTriggerConfig(seq.trigger_config, eventData);
    if (!configMatches) {
      continue;
    }

    await enrollContact(seq.id, contact.id);
  }
}

function evaluateTriggerConfig(
  triggerConfig: Record<string, unknown>,
  eventData: Record<string, unknown>
): boolean {
  // Each key in triggerConfig must match the corresponding key in eventData
  for (const [key, expectedValue] of Object.entries(triggerConfig)) {
    if (eventData[key] !== expectedValue) {
      return false;
    }
  }
  return true;
}
