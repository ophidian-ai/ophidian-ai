import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action } = body;

  if (!action || !["approved", "declined"].includes(action)) {
    return NextResponse.json(
      { error: "Invalid action. Must be 'approved' or 'declined'." },
      { status: 400 }
    );
  }

  // Get client record
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id, company_name, contact_email")
    .eq("profile_id", user.id)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // Find proposal and verify ownership
  const { data: proposal, error: proposalError } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", id)
    .eq("client_id", client.id)
    .single();

  if (proposalError || !proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  if (proposal.status !== "sent") {
    return NextResponse.json(
      { error: `Proposal has already been ${proposal.status}` },
      { status: 409 }
    );
  }

  // Update proposal
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const now = new Date().toISOString();

  const updateData: Record<string, unknown> = {
    status: action,
  };

  if (action === "approved") {
    updateData.approved_at = now;
    updateData.approved_by_ip = ip;
  }

  const { data: updated, error: updateError } = await supabase
    .from("proposals")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Send notification email to Eric
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const title =
      (proposal.content as Record<string, unknown>)?.title ?? "Proposal";
    await resend.emails.send({
      from: "OphidianAI <notifications@ophidianai.com>",
      to: "eric.lefler@ophidianai.com",
      subject: `Proposal ${action}: ${title} -- ${client.company_name}`,
      html: `
        <h2>Proposal ${action === "approved" ? "Approved" : "Declined"}</h2>
        <p><strong>Client:</strong> ${client.company_name} (${client.contact_email})</p>
        <p><strong>Proposal:</strong> ${title}</p>
        <p><strong>Action:</strong> ${action}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString("en-US", { timeZone: "America/Indiana/Indianapolis" })}</p>
        ${ip ? `<p><strong>IP:</strong> ${ip}</p>` : ""}
      `,
    });
  } catch {
    // Email failure shouldn't block the response
    console.error("Failed to send proposal notification email");
  }

  return NextResponse.json(updated);
}
