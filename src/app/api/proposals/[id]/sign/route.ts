import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { hashToken, isTokenExpired } from "@/lib/signing-tokens";
import { generateSignedPdf } from "@/lib/signed-pdf";
import { onboardClient } from "@/lib/services/onboarding";
import { Resend } from "resend";
import type { ProposalContent } from "@/lib/supabase/types";

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
  const { token, typed_name, agreed } = body;

  if (!token || !typed_name || !agreed) {
    return NextResponse.json({ error: "token, typed_name, and agreed are required" }, { status: 400 });
  }

  const supabase = getServiceClient();

  const tokenHash = hashToken(token);
  const { data: proposal, error } = await supabase
    .from("proposals")
    .select("*, clients(id, contact_email, contact_name, company_name, phone, website_url)")
    .eq("id", id)
    .eq("signing_token_hash", tokenHash)
    .single();

  if (error || !proposal) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 403 });
  }

  if (proposal.status !== "sent") {
    return NextResponse.json({ error: "Proposal is not in a signable state" }, { status: 400 });
  }

  if (isTokenExpired(proposal.signing_token_expires_at)) {
    return NextResponse.json({ error: "This link has expired. Please contact OphidianAI for a new one." }, { status: 410 });
  }

  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  const documentHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(proposal.content))
    .digest("hex");

  const { error: updateError } = await supabase
    .from("proposals")
    .update({
      status: "approved",
      typed_name,
      approved_at: new Date().toISOString(),
      approved_by_ip: ip,
      user_agent: userAgent,
      document_hash: documentHash,
      signing_token_hash: null,
      signing_token_expires_at: null,
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to record signature" }, { status: 500 });
  }

  const content = proposal.content as ProposalContent;
  const client = proposal.clients;
  const pdfBytes = await generateSignedPdf(
    {
      clientName: client.contact_name,
      companyName: client.company_name,
      scope: content.scope || "",
      timeline: content.timeline || "",
      deliverables: content.deliverables || [],
      basePrice: content.basePrice || 0,
      discounts: (content.discounts || []).map((d) => ({ label: d.label, amount: d.amount })),
      finalPrice: content.finalPrice || 0,
      paymentSchedule: proposal.payment_schedule || [],
    },
    {
      typedName: typed_name,
      signedAt: new Date().toISOString(),
      ipAddress: ip,
      documentHash,
    }
  );

  const resend = new Resend(process.env.RESEND_API_KEY);
  const pdfBuffer = Buffer.from(pdfBytes);

  await resend.emails.send({
    from: "OphidianAI <iris@ophidianai.com>",
    to: [client.contact_email, "eric.lefler@ophidianai.com"],
    subject: `Signed Proposal -- ${client.company_name}`,
    html: `<p>The attached proposal has been electronically signed by ${typed_name} on ${new Date().toLocaleDateString()}.</p>`,
    attachments: [
      {
        filename: `${client.company_name.replace(/\s+/g, "-")}-Proposal-Signed.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  const schedule = proposal.payment_schedule as Array<{ milestone: string; amount: number; percentage: number }>;
  const deposit = schedule.find((s) => s.milestone === "deposit");
  const depositAmount = deposit ? deposit.amount : content.finalPrice;
  const serviceType = (content as unknown as Record<string, unknown>).serviceType as string || "web_professional";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _result = await onboardClient({
    clientId: client.id,
    email: client.contact_email,
    fullName: client.contact_name,
    company: client.company_name,
    phone: client.phone || undefined,
    websiteUrl: client.website_url || undefined,
    serviceType: serviceType as import("@/lib/supabase/types").ServiceType,
    proposalId: id,
    signedPdfBuffer: pdfBytes,
    baseAmount: content.basePrice || 0,
    discountCodes: (content.discounts || []).map((d) => d.code),
    depositAmount,
  });

  return NextResponse.json({
    success: true,
    message: "Proposal signed successfully. You will receive your account setup email and invoice shortly.",
  });
}
