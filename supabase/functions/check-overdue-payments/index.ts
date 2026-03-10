import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface OverduePayment {
  id: string;
  client_id: string;
  amount: number;
  due_date: string;
  clients?: { company_name: string; contact_email: string };
}

serve(async (_req: Request) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const today = new Date().toISOString().split("T")[0];

    // Find pending payments that are past due
    const { data: overduePayments, error: queryError } = await supabase
      .from("payments")
      .select("id, client_id, amount, due_date, clients(company_name, contact_email)")
      .eq("status", "pending")
      .lt("due_date", today);

    if (queryError) {
      throw new Error(`Failed to query payments: ${queryError.message}`);
    }

    const payments = (overduePayments ?? []) as OverduePayment[];

    if (payments.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No overdue payments found",
          updated: 0,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Update all overdue payments to 'overdue' status
    const paymentIds = payments.map((p) => p.id);

    const { error: updateError } = await supabase
      .from("payments")
      .update({ status: "overdue" })
      .in("id", paymentIds);

    if (updateError) {
      throw new Error(`Failed to update payments: ${updateError.message}`);
    }

    // Build email body with overdue payment details
    const rows = payments
      .map((p) => {
        const company = p.clients?.company_name ?? "Unknown";
        const amount = (p.amount / 100).toFixed(2);
        return `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${company}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">$${amount}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${p.due_date}</td>
        </tr>`;
      })
      .join("\n");

    const html = `
      <div style="font-family: sans-serif; max-width: 600px;">
        <h2 style="color: #0D1B2A;">Overdue Payments Alert</h2>
        <p>${payments.length} payment${payments.length === 1 ? "" : "s"} marked as overdue:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 8px; text-align: left;">Client</th>
              <th style="padding: 8px; text-align: left;">Amount</th>
              <th style="padding: 8px; text-align: left;">Due Date</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="margin-top: 16px; color: #666;">
          Review these in the <a href="https://ophidianai.com/dashboard">admin dashboard</a>.
        </p>
      </div>
    `;

    // Send notification email via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (resendKey) {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "OphidianAI System <billing@ophidianai.com>",
          to: "eric.lefler@ophidianai.com",
          subject: `Overdue Payments Alert: ${payments.length} payment${payments.length === 1 ? "" : "s"} past due`,
          html,
        }),
      });

      if (!emailRes.ok) {
        const err = await emailRes.text();
        console.error("Failed to send email via Resend:", err);
      }
    } else {
      console.warn("RESEND_API_KEY not set, skipping email notification");
    }

    return new Response(
      JSON.stringify({
        success: true,
        updated: payments.length,
        payments: payments.map((p) => ({
          id: p.id,
          client: p.clients?.company_name,
          amount: p.amount,
          due_date: p.due_date,
        })),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: (err as Error).message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
