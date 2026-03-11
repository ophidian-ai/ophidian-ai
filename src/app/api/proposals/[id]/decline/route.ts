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
  const { token, reason } = body;

  if (!token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const tokenHash = hashToken(token);

  const { data: proposal, error } = await supabase
    .from("proposals")
    .select("*, clients(contact_name, company_name)")
    .eq("id", id)
    .eq("signing_token_hash", tokenHash)
    .single();

  if (error || !proposal) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 403 });
  }

  if (proposal.status !== "sent") {
    return NextResponse.json({ error: "Proposal is not in a declinable state" }, { status: 400 });
  }

  if (isTokenExpired(proposal.signing_token_expires_at)) {
    return NextResponse.json({ error: "This link has expired" }, { status: 410 });
  }

  await supabase
    .from("proposals")
    .update({
      status: "declined",
      signing_token_hash: null,
      signing_token_expires_at: null,
    })
    .eq("id", id);

  const client = proposal.clients;
  const reasonText = reason ? `: "${reason}"` : "";

  await notifyAdmins({
    type: "proposal_declined",
    title: "Proposal Declined",
    message: `${client.contact_name} (${client.company_name}) declined the proposal${reasonText}`,
    link: `/dashboard/admin/proposals/${id}`,
  });

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "OphidianAI <notifications@ophidianai.com>",
    to: "eric.lefler@ophidianai.com",
    subject: `Proposal Declined -- ${client.company_name}`,
    html: `<p><strong>${client.contact_name}</strong> from <strong>${client.company_name}</strong> has declined the proposal.${reason ? `</p><p>Reason: ${reason}` : ""}</p>`,
  });

  return NextResponse.json({ success: true });
}
