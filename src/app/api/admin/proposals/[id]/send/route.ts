import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { generateSigningToken } from "@/lib/signing-tokens";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

async function verifyAdmin(req: NextRequest) {
  const { createServerClient } = await import("@supabase/ssr");
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll().map((c) => ({ name: c.name, value: c.value })) } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return null;
  return user;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = getServiceClient();

  const { data: proposal, error } = await supabase
    .from("proposals")
    .select("*, clients(contact_email, contact_name, company_name)")
    .eq("id", id)
    .single();

  if (error || !proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });

  if (proposal.status !== "draft" && proposal.status !== "revision_requested") {
    return NextResponse.json({ error: `Cannot send proposal with status: ${proposal.status}` }, { status: 400 });
  }

  const { token, hash, expiresAt } = generateSigningToken();

  const { error: updateError } = await supabase
    .from("proposals")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      signing_token_hash: hash,
      signing_token_expires_at: expiresAt.toISOString(),
    })
    .eq("id", id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  const reviewUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/proposals/${id}?token=${token}`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const client = proposal.clients;

  await resend.emails.send({
    from: "OphidianAI <iris@ophidianai.com>",
    to: client.contact_email,
    subject: "Your proposal from OphidianAI is ready for review",
    html: `
      <div style="background: #0A0A0A; padding: 40px 20px; font-family: system-ui, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #161616; border-radius: 12px; overflow: hidden;">
          <div style="padding: 30px; text-align: center; border-bottom: 1px solid #2A2A2A;">
            <h1 style="color: #39FF14; margin: 0; font-size: 24px;">OphidianAI</h1>
          </div>
          <div style="padding: 30px; color: #E0E0E0; line-height: 1.6;">
            <p>Hi ${client.contact_name},</p>
            <p>Your proposal for <strong>${client.company_name}</strong> is ready for review.</p>
            <p>Click the button below to review the details, request changes, or approve:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${reviewUrl}" style="background: #39FF14; color: #0A0A0A; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Review Proposal</a>
            </div>
            <p style="color: #888; font-size: 13px;">This link expires in 7 days.</p>
          </div>
        </div>
      </div>
    `,
  });

  return NextResponse.json({ success: true, sent_at: new Date().toISOString() });
}
