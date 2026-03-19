import { createClient } from "@/lib/supabase/server";
import type { ChatbotConfig } from "@/lib/supabase/chatbot-types";
import { onChatbotLeadCaptured } from "@/lib/crm/event-bus";

export interface LeadData {
  conversationId: string;
  name?: string;
  email?: string;
  phone?: string;
  customFields?: Record<string, unknown>;
  sourcePage?: string;
}

export async function captureLead(
  config: ChatbotConfig,
  data: LeadData
): Promise<void> {
  const supabase = await createClient();

  // 1. Insert lead record
  const { error: insertError } = await supabase.from("chatbot_leads").insert({
    config_id: config.id,
    conversation_id: data.conversationId,
    name: data.name ?? null,
    email: data.email ?? null,
    phone: data.phone ?? null,
    custom_fields: data.customFields ?? null,
    source_page: data.sourcePage ?? null,
  });

  if (insertError) {
    throw new Error(`Failed to insert lead: ${insertError.message}`);
  }

  // 2. Mark conversation as lead_captured
  const { error: updateError } = await supabase
    .from("chatbot_conversations")
    .update({ lead_captured: true })
    .eq("id", data.conversationId);

  if (updateError) {
    throw new Error(
      `Failed to update conversation lead_captured: ${updateError.message}`
    );
  }

  // 3. Increment daily leads analytics
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const { error: rpcError } = await supabase.rpc("increment_daily_leads", {
    p_config_id: config.id,
    p_date: today,
  });

  if (rpcError) {
    throw new Error(`Failed to increment daily leads: ${rpcError.message}`);
  }

  // 4. Send notification email (non-critical)
  if (config.client_id && config.fallback_contact.email) {
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) {
        console.error("[lead-capture] RESEND_API_KEY not set, skipping email");
        return;
      }

      const leadLabel = data.name || data.email || "Anonymous";
      const subject = `New lead from your AI chatbot: ${leadLabel}`;

      const htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #111;">New Lead Captured</h2>
          <p>Your AI chatbot captured a new lead. Here are the details:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tbody>
              ${
                data.name
                  ? `<tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 140px;">Name</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.name}</td>
              </tr>`
                  : ""
              }
              ${
                data.email
                  ? `<tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.email}</td>
              </tr>`
                  : ""
              }
              ${
                data.phone
                  ? `<tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Phone</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.phone}</td>
              </tr>`
                  : ""
              }
              ${
                data.sourcePage
                  ? `<tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Source Page</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.sourcePage}</td>
              </tr>`
                  : ""
              }
            </tbody>
          </table>
          <p>
            <a href="https://ophidianai.com/dashboard/chatbot" style="
              display: inline-block;
              padding: 10px 20px;
              background-color: #39ff14;
              color: #000;
              text-decoration: none;
              border-radius: 4px;
              font-weight: bold;
            ">View Dashboard</a>
          </p>
        </div>
      `;

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "notifications@ophidianai.com",
          to: config.fallback_contact.email,
          subject,
          html: htmlBody,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[lead-capture] Resend API error ${response.status}: ${errorText}`
        );
      }
    } catch (err) {
      console.error("[lead-capture] Failed to send notification email:", err);
    }
  }

  // 5. Fire CRM event bus (non-critical)
  if (config.client_id) {
    try {
      await onChatbotLeadCaptured(config.client_id, {
        name: data.name ?? undefined,
        email: data.email ?? "",
        phone: data.phone ?? undefined,
        conversationId: data.conversationId,
      });
    } catch (e) {
      console.error("[lead-capture] CRM event bus error:", e);
    }
  }
}
