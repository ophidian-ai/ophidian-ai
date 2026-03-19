import crypto from "crypto";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import type { CrmAutomation } from "@/lib/supabase/crm-types";
import { CRM_TIER_DEFAULTS } from "./tier-defaults";
import { logActivity } from "./activities";
import { enrollContact } from "@/lib/email/sequences";
import { createTask } from "./tasks";

const MAX_ACTIONS_PER_TRIGGER = 10;

function idempotencyKey(
  automationId: string,
  dealId: string,
  minuteBucket: number
): string {
  return crypto
    .createHash("sha256")
    .update(`${automationId}:${dealId}:${minuteBucket}`)
    .digest("hex");
}

export async function evaluateAutomations(
  configId: string,
  triggerType: string,
  triggerData: Record<string, unknown>
): Promise<void> {
  const supabase = await createClient();

  // Load config and check tier
  const { data: config, error: configError } = await supabase
    .from("crm_configs")
    .select("*")
    .eq("id", configId)
    .single();

  if (configError || !config) {
    return;
  }

  const tierDefaults = CRM_TIER_DEFAULTS[config.tier as keyof typeof CRM_TIER_DEFAULTS];
  if (!tierDefaults.automationEnabled) {
    return;
  }

  // Load active automations matching this trigger type
  const { data: automations, error: autoError } = await supabase
    .from("crm_automations")
    .select("*")
    .eq("config_id", configId)
    .eq("trigger_type", triggerType)
    .eq("active", true);

  if (autoError || !automations || automations.length === 0) {
    return;
  }

  const dealId = (triggerData.dealId as string) ?? "";
  const minuteBucket = Math.floor(Date.now() / 60000);

  let queued = 0;

  for (const row of automations) {
    if (queued >= MAX_ACTIONS_PER_TRIGGER) {
      break;
    }

    const automation = row as CrmAutomation;

    // Check trigger_config key/value match against triggerData
    const matches = Object.entries(automation.trigger_config).every(
      ([k, v]) => triggerData[k] === v
    );

    if (!matches) {
      continue;
    }

    const iKey = idempotencyKey(automation.id, dealId, minuteBucket);

    // Use a placeholder contact_id from config for system-level activities
    // We log against a synthetic "system" contact scoped to the config
    // Actual contact comes from triggerData if available
    const contactId = (triggerData.contactId as string) ?? "system";

    // Log automation_queued with idempotency key -- prevents dupes
    try {
      await logActivity(
        configId,
        contactId,
        "automation_queued",
        `automation_id=${automation.id} ikey=${iKey}`,
        { type: "automation", id: automation.id },
        dealId || undefined
      );
      queued++;
    } catch (err) {
      // Duplicate idempotency key -- skip
      console.error(`[crm/automations] Duplicate or log error for ${automation.id}:`, err);
    }
  }
}

export async function processAutomationActions(): Promise<number> {
  const supabase = await createClient();

  // Query automation_queued activities from the last 2 minutes
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();

  const { data: activities, error: activitiesError } = await supabase
    .from("crm_activities")
    .select("*")
    .eq("type", "automation_queued")
    .gte("created_at", twoMinutesAgo);

  if (activitiesError || !activities || activities.length === 0) {
    return 0;
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const resend = resendApiKey ? new Resend(resendApiKey) : null;

  // Dedupe by idempotency key (extracted from description)
  const seenIKeys = new Set<string>();
  let processed = 0;

  for (const activity of activities) {
    // Extract ikey from description: "automation_id=... ikey=..."
    const ikeyMatch = (activity.description as string).match(/ikey=([a-f0-9]+)/);
    if (!ikeyMatch) {
      continue;
    }
    const iKey = ikeyMatch[1];
    if (seenIKeys.has(iKey)) {
      continue;
    }
    seenIKeys.add(iKey);

    // Load automation from linked_content_id
    const automationId = activity.linked_content_id as string;
    if (!automationId) {
      continue;
    }

    const { data: autoRow, error: autoError } = await supabase
      .from("crm_automations")
      .select("*")
      .eq("id", automationId)
      .single();

    if (autoError || !autoRow) {
      continue;
    }

    const automation = autoRow as CrmAutomation;

    try {
      switch (automation.action_type) {
        case "enroll_sequence": {
          const sequenceId = automation.action_config.sequence_id as string;
          const contactId = activity.contact_id as string;
          if (sequenceId && contactId && contactId !== "system") {
            await enrollContact(sequenceId, contactId);
          }
          break;
        }

        case "create_task": {
          const delayHours = (automation.action_config.delay_hours as number) ?? 0;
          const dueAt = new Date(
            Date.now() + delayHours * 60 * 60 * 1000
          ).toISOString();

          await createTask(activity.config_id as string, {
            contactId:
              activity.contact_id !== "system"
                ? (activity.contact_id as string)
                : undefined,
            dealId: activity.deal_id ?? undefined,
            title: (automation.action_config.title as string) ?? "Automated task",
            description: automation.action_config.description as string | undefined,
            dueAt,
            automationId: automation.id,
          });
          break;
        }

        case "send_notification": {
          if (!resend) {
            break;
          }
          const to =
            (automation.action_config.to as string) ?? "notifications@ophidianai.com";
          const subject =
            (automation.action_config.subject as string) ?? "CRM Notification";
          const body =
            (automation.action_config.body as string) ?? "An automation was triggered.";

          await resend.emails.send({
            from: "notifications@ophidianai.com",
            to,
            subject,
            html: `<div style="font-family: sans-serif;">${body}</div>`,
          });
          break;
        }

        case "update_deal": {
          const dealId = activity.deal_id as string;
          const newStage = automation.action_config.stage as string;

          if (!dealId || !newStage) {
            break;
          }

          // Loop prevention: check if triggering automation matches current automation
          const { data: deal } = await supabase
            .from("crm_deals")
            .select("stage")
            .eq("id", dealId)
            .single();

          if (!deal || deal.stage === newStage) {
            break;
          }

          // Import dynamically to avoid circular dep at module load time
          const { updateDealStage } = await import("./deals");
          await updateDealStage(dealId, newStage);
          break;
        }

        default:
          console.warn(`[crm/automations] Unknown action_type: ${automation.action_type}`);
      }

      // Log successful execution
      await logActivity(
        activity.config_id as string,
        activity.contact_id as string,
        "automation_executed",
        `Executed action: ${automation.action_type} for automation ${automation.id}`,
        { type: "automation", id: automation.id },
        activity.deal_id ?? undefined
      );

      processed++;
    } catch (err) {
      console.error(
        `[crm/automations] Failed to execute action for automation ${automation.id}:`,
        err
      );
    }
  }

  return processed;
}
