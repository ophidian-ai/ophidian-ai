import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hashToken, isTokenExpired } from "@/lib/signing-tokens";
import { notifyAdmins } from "@/lib/notifications";
import { Resend } from "resend";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { token, message } = body;

  if (!token || !message) {
    return NextResponse.json({ error: "token and message are required" }, { status: 400 });
  }

  const supabase = getServiceClient();

  const tokenHash = hashToken(token);
  const { data: proposal, error } = await supabase
    .from("proposals")
    .select("*, clients(contact_name, company_name, contact_email)")
    .eq("id", id)
    .eq("signing_token_hash", tokenHash)
    .single();

  if (error || !proposal) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 403 });
  }

  if (proposal.status !== "sent") {
    return NextResponse.json({ error: "Proposal is not in a reviewable state" }, { status: 400 });
  }

  if (isTokenExpired(proposal.signing_token_expires_at)) {
    return NextResponse.json({ error: "This link has expired" }, { status: 410 });
  }

  await supabase
    .from("proposals")
    .update({
      status: "revision_requested",
      signing_token_hash: null,
      signing_token_expires_at: null,
    })
    .eq("id", id);

  await supabase.from("proposal_revisions").insert({
    proposal_id: id,
    message,
  });

  const client = proposal.clients;
  await notifyAdmins({
    type: "proposal_revision",
    title: "Proposal Revision Requested",
    message: `${client.contact_name} (${client.company_name}) requested changes: "${message.substring(0, 100)}${message.length > 100 ? "..." : ""}"`,
    link: `/dashboard/admin/proposals/${id}`,
  });

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "OphidianAI <notifications@ophidianai.com>",
    to: "eric.lefler@ophidianai.com",
    subject: `Proposal Revision Requested -- ${client.company_name}`,
    html: `
      <p><strong>${client.contact_name}</strong> from <strong>${client.company_name}</strong> has requested changes to their proposal.</p>
      <blockquote style="border-left: 3px solid #C4A265; padding-left: 12px; color: #666;">${message}</blockquote>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/admin/proposals/${id}">Review in Dashboard</a></p>
    `,
  });

  return NextResponse.json({ success: true });
}
