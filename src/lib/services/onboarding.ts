import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { Resend } from "resend";
import { notifyAdmins } from "@/lib/notifications";
import type { ServiceType } from "@/lib/supabase/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export interface OnboardClientParams {
  clientId: string;
  email: string;
  fullName: string;
  company: string;
  phone?: string;
  websiteUrl?: string;
  serviceType: ServiceType;
  monthlyAmount?: number;
  proposalId?: string;
  signedPdfBuffer?: Uint8Array;
  baseAmount: number;
  discountCodes?: string[];
  depositAmount: number;
}

export interface OnboardResult {
  userId: string;
  clientId: string;
  projectId: string;
  stripeCustomerId: string;
  invoiceId: string;
  setupLink: string;
}

export async function onboardClient(params: OnboardClientParams): Promise<OnboardResult> {
  const supabase = getServiceClient();
  const stripe = getStripe();
  const resend = getResend();

  // Track progress for retry
  const updateStep = async (step: string) => {
    await supabase
      .from("clients")
      .update({ onboarding_step: step })
      .eq("id", params.clientId);
  };

  // Step 1: Create auth user (idempotent -- check existing first)
  await updateStep("auth_user");
  const { data: existingUsers } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", params.email)
    .limit(1);

  let userId: string;

  if (existingUsers && existingUsers.length > 0) {
    userId = existingUsers[0].id;
  } else {
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: params.email,
      email_confirm: true,
      user_metadata: {
        full_name: params.fullName,
        company: params.company,
      },
    });
    if (authError) throw new Error(`Auth user creation failed: ${authError.message}`);
    userId = authUser.user.id;

    // Step 2: Create profile
    await updateStep("profile");
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      email: params.email,
      full_name: params.fullName,
      role: "client",
      company: params.company,
      phone: params.phone || null,
      website_url: params.websiteUrl || null,
    });
    if (profileError) throw new Error(`Profile creation failed: ${profileError.message}`);
  }

  // Step 3: Update client record
  await updateStep("client_update");
  const { error: clientError } = await supabase
    .from("clients")
    .update({
      profile_id: userId,
      status: "active",
      company_name: params.company,
      contact_email: params.email,
      website_url: params.websiteUrl || null,
    })
    .eq("id", params.clientId);
  if (clientError) throw new Error(`Client update failed: ${clientError.message}`);

  // Step 4: Create client_services
  await updateStep("client_services");
  const { data: serviceData, error: serviceError } = await supabase
    .from("client_services")
    .insert({
      client_id: params.clientId,
      service_type: params.serviceType,
      status: "active",
      monthly_amount: params.monthlyAmount || null,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (serviceError) throw new Error(`Service creation failed: ${serviceError.message}`);

  // Step 5: Create project
  await updateStep("project");
  const isWebService = params.serviceType.startsWith("web_");
  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .insert({
      client_id: params.clientId,
      client_service_id: serviceData.id,
      name: `${params.company} Website`,
      status: "active",
      phase: isWebService ? "discovery" : null,
      phase_updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (projectError) throw new Error(`Project creation failed: ${projectError.message}`);

  // Step 6: Create project milestones (for web services)
  if (isWebService) {
    await updateStep("milestones");
    const phases = ["discovery", "design", "development", "review", "live"] as const;
    const milestones = phases.map((phase) => ({
      project_id: projectData.id,
      phase,
      title: phase.charAt(0).toUpperCase() + phase.slice(1),
      description: `${phase.charAt(0).toUpperCase() + phase.slice(1)} phase`,
    }));
    const { error: milestoneError } = await supabase
      .from("project_milestones")
      .insert(milestones);
    if (milestoneError) throw new Error(`Milestone creation failed: ${milestoneError.message}`);
  }

  // Step 7: Generate account setup link
  await updateStep("setup_link");
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email: params.email,
  });
  if (linkError) throw new Error(`Setup link generation failed: ${linkError.message}`);

  const setupUrl = new URL("/auth/callback", process.env.NEXT_PUBLIC_SITE_URL);
  setupUrl.searchParams.set("token_hash", linkData.properties.hashed_token);
  setupUrl.searchParams.set("type", "recovery");
  setupUrl.searchParams.set("next", "/account-setup");
  const setupLink = setupUrl.toString();

  // Step 8: Send welcome email
  await updateStep("welcome_email");
  await resend.emails.send({
    from: "OphidianAI <iris@ophidianai.com>",
    to: params.email,
    subject: "Welcome to OphidianAI -- Set Up Your Account",
    html: buildWelcomeEmailHtml(params.fullName, params.company, setupLink),
  });

  // Step 9: Create Stripe customer
  await updateStep("stripe_customer");
  const customer = await stripe.customers.create({
    email: params.email,
    name: params.company,
    metadata: { client_id: params.clientId },
  });

  // Step 10: Store stripe_customer_id
  await supabase
    .from("clients")
    .update({ stripe_customer_id: customer.id })
    .eq("id", params.clientId);

  // Step 11: Create Stripe invoice
  await updateStep("stripe_invoice");
  await stripe.invoiceItems.create({
    customer: customer.id,
    amount: params.baseAmount,
    currency: "usd",
    description: `${params.company} -- Project Deposit`,
  });

  const discounts = (params.discountCodes || []).map((coupon) => ({ coupon }));
  const invoice = await stripe.invoices.create({
    customer: customer.id,
    auto_advance: true,
    collection_method: "send_invoice",
    days_until_due: 7,
    discounts: discounts.length > 0 ? discounts : undefined,
    metadata: { client_id: params.clientId, project_id: projectData.id },
  });

  // Finalize and send
  await stripe.invoices.finalizeInvoice(invoice.id);
  await stripe.invoices.sendInvoice(invoice.id);

  // Step 12: Create payments record
  await updateStep("payments_record");
  await supabase.from("payments").insert({
    client_id: params.clientId,
    client_service_id: serviceData.id,
    project_id: projectData.id,
    amount: params.depositAmount,
    milestone_label: "deposit",
    status: "pending",
    stripe_payment_intent_id: invoice.id,
  });

  // Step 13: Queue Iris tasks
  await updateStep("iris_tasks");
  const irisPayload = {
    client_id: params.clientId,
    project_id: projectData.id,
    company_name: params.company,
    service_type: params.serviceType,
  };
  const irisTasks = [
    { task_type: "clickup_board", payload: irisPayload },
    { task_type: "engineering_scaffold", payload: irisPayload },
    { task_type: "tracker_update", payload: irisPayload },
    { task_type: "decision_log", payload: irisPayload },
    { task_type: "briefing_update", payload: irisPayload },
  ];
  await supabase.from("pending_iris_tasks").insert(irisTasks);

  // Step 14: Notify admin
  await updateStep("complete");
  await notifyAdmins({
    type: "client_created",
    title: "New Client Onboarded",
    message: `${params.company} has been onboarded. Account created, invoice sent.`,
    link: `/dashboard/admin/clients`,
  });

  return {
    userId,
    clientId: params.clientId,
    projectId: projectData.id,
    stripeCustomerId: customer.id,
    invoiceId: invoice.id,
    setupLink,
  };
}

function buildWelcomeEmailHtml(name: string, company: string, setupLink: string): string {
  return `
    <div style="background: #0D1B2A; padding: 40px 20px; font-family: system-ui, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #1B2838; border-radius: 12px; overflow: hidden;">
        <div style="padding: 30px; text-align: center; border-bottom: 1px solid #2A3A4A;">
          <h1 style="color: #39FF14; margin: 0; font-size: 24px;">OphidianAI</h1>
        </div>
        <div style="padding: 30px; color: #E0E0E0; line-height: 1.6;">
          <p>Hi ${name},</p>
          <p>Welcome to OphidianAI! Your project for <strong>${company}</strong> is now set up and ready to go.</p>
          <p>Click the button below to set up your account and access your project dashboard:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${setupLink}" style="background: #39FF14; color: #0D1B2A; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Set Up Your Account</a>
          </div>
          <p style="color: #888; font-size: 13px;">This link expires in 24 hours. If it expires, contact us for a new one.</p>
        </div>
      </div>
    </div>
  `;
}
