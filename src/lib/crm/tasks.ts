import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import type { CrmTask } from "@/lib/supabase/crm-types";
import { logActivity } from "./activities";

export async function createTask(
  configId: string,
  data: {
    contactId?: string;
    dealId?: string;
    title: string;
    description?: string;
    dueAt: string;
    automationId?: string;
  }
): Promise<CrmTask> {
  const supabase = await createClient();

  const { data: task, error } = await supabase
    .from("crm_tasks")
    .insert({
      config_id: configId,
      contact_id: data.contactId ?? null,
      deal_id: data.dealId ?? null,
      title: data.title,
      description: data.description ?? null,
      due_at: data.dueAt,
      status: "pending",
      auto_generated: data.automationId != null,
      automation_id: data.automationId ?? null,
      reminder_sent: false,
    })
    .select()
    .single();

  if (error || !task) {
    throw new Error(`Failed to create task: ${error?.message}`);
  }

  return task as CrmTask;
}

export async function completeTask(taskId: string): Promise<void> {
  const supabase = await createClient();

  // Load task to get config and contact IDs for activity log
  const { data: taskData, error: fetchError } = await supabase
    .from("crm_tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (fetchError || !taskData) {
    throw new Error(`Task not found: ${fetchError?.message}`);
  }

  const task = taskData as CrmTask;

  const { error: updateError } = await supabase
    .from("crm_tasks")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", taskId);

  if (updateError) {
    throw new Error(`Failed to complete task: ${updateError.message}`);
  }

  if (task.contact_id) {
    await logActivity(
      task.config_id,
      task.contact_id,
      "task_completed",
      `Task completed: ${task.title}`,
      { type: "task", id: taskId },
      task.deal_id ?? undefined
    );
  }
}

export async function getTasksDue(
  configId: string
): Promise<Array<CrmTask & { overdue: boolean }>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("crm_tasks")
    .select("*")
    .eq("config_id", configId)
    .eq("status", "pending")
    .order("due_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch tasks: ${error.message}`);
  }

  const now = new Date().toISOString();

  return ((data ?? []) as CrmTask[]).map((task) => ({
    ...task,
    overdue: task.due_at < now,
  }));
}

export async function sendTaskReminders(): Promise<number> {
  const supabase = await createClient();

  // Load all active configs
  const { data: configs, error: configsError } = await supabase
    .from("crm_configs")
    .select("id")
    .eq("active", true);

  if (configsError || !configs) {
    throw new Error(`Failed to load CRM configs: ${configsError?.message}`);
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY not set");
  }

  const resend = new Resend(resendApiKey);

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  let sentCount = 0;

  for (const config of configs) {
    const { data: tasks, error: tasksError } = await supabase
      .from("crm_tasks")
      .select("*")
      .eq("config_id", config.id)
      .eq("status", "pending")
      .eq("reminder_sent", false)
      .lte("due_at", in24h);

    if (tasksError || !tasks || tasks.length === 0) {
      continue;
    }

    for (const taskRow of tasks) {
      const task = taskRow as CrmTask;

      try {
        await resend.emails.send({
          from: "notifications@ophidianai.com",
          to: "notifications@ophidianai.com",
          subject: `Task reminder: ${task.title}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #111;">Task Due Soon</h2>
              <p>The following task is due within 24 hours:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tbody>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 140px;">Task</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${task.title}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Due</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date(task.due_at).toLocaleString()}</td>
                  </tr>
                  ${task.description ? `<tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Notes</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${task.description}</td>
                  </tr>` : ""}
                </tbody>
              </table>
            </div>
          `,
        });

        await supabase
          .from("crm_tasks")
          .update({ reminder_sent: true })
          .eq("id", task.id);

        sentCount++;
      } catch (err) {
        console.error(`[crm/tasks] Failed to send reminder for task ${task.id}:`, err);
      }
    }
  }

  return sentCount;
}
