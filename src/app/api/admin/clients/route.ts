import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { notifyAdmins } from "@/lib/notifications";
import type { ServiceType } from "@/lib/supabase/types";

const WEB_SERVICES: ServiceType[] = [
  "web_starter",
  "web_professional",
  "web_ecommerce",
];

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized", status: 401 };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Forbidden", status: 403 };

  return { supabase, user };
}

export async function GET() {
  const auth = await verifyAdmin();
  if ("error" in auth) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  const { supabase } = auth;

  const { data: clients, error } = await supabase
    .from("clients")
    .select(
      `
      *,
      client_services (*),
      projects (*)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ clients });
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdmin();
  if ("error" in auth) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  const { supabase } = auth;

  const body = await request.json();
  const {
    first_name,
    last_name,
    contact_email,
    company_name,
    website_url,
    services,
  }: {
    first_name: string;
    last_name: string;
    contact_email: string;
    company_name?: string;
    website_url?: string;
    services?: ServiceType[];
  } = body;

  if (!first_name || !last_name || !contact_email) {
    return NextResponse.json(
      { error: "first_name, last_name, and contact_email are required" },
      { status: 400 }
    );
  }

  const fullName = `${first_name} ${last_name}`;
  const displayName = company_name || fullName;

  // Check if a profile already exists for this email
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", contact_email)
    .maybeSingle();

  let profileId = existingProfile?.id;

  // If no profile, create user via service role client
  if (!profileId) {
    const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Service role configuration missing" },
        { status: 500 }
      );
    }

    const serviceClient = createServiceClient(serviceUrl, serviceKey);

    const { data: newUser, error: createError } =
      await serviceClient.auth.admin.createUser({
        email: contact_email,
        email_confirm: true,
        user_metadata: { full_name: fullName, company: displayName },
      });

    if (createError) {
      return NextResponse.json(
        { error: `Failed to create user: ${createError.message}` },
        { status: 500 }
      );
    }

    profileId = newUser.user.id;

    // Create profile record
    await serviceClient.from("profiles").upsert({
      id: profileId,
      email: contact_email,
      full_name: fullName,
      role: "client",
      company: displayName,
      website_url: website_url ?? null,
    });

    // Generate account setup link and send welcome email
    try {
      const { data: linkData } =
        await serviceClient.auth.admin.generateLink({
          type: "recovery",
          email: contact_email,
        });

      const tokenHash = linkData?.properties?.hashed_token;
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ophidianai.com";
      // Build our own link that goes through our auth callback with query params
      // This avoids Supabase's redirect which uses hash fragments that server routes can't read
      const setupLink = tokenHash
        ? `${siteUrl}/auth/callback?token_hash=${tokenHash}&type=recovery&next=/account-setup`
        : null;

      if (setupLink) {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: "OphidianAI <iris@ophidianai.com>",
          to: contact_email,
          subject: "Welcome to OphidianAI - Set Up Your Account",
          html: `
            <div style="background-color: #0D1B2A; width: 100%; padding: 0; margin: 0;">
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 48px 32px; background-color: #0D1B2A;">
                <h1 style="color: #F1F5F9; font-size: 24px; margin: 0 0 8px 0;">Welcome, ${first_name}!</h1>
                <p style="color: #94A3B8; font-size: 15px; line-height: 1.6; margin: 0 0 28px 0;">
                  Your OphidianAI client portal is ready. Click the button below to set your password and access your dashboard.
                </p>
                <a href="${setupLink}" style="display: inline-block; background: #39FF14; color: #0D1B2A; font-weight: 600; font-size: 15px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
                  Set Up Your Account
                </a>
                <p style="color: #64748B; font-size: 13px; margin: 32px 0 0 0; line-height: 1.5;">
                  This link expires in 24 hours. If you didn't expect this email, you can safely ignore it.
                </p>
                <hr style="border: none; border-top: 1px solid #1E293B; margin: 32px 0;" />
                <p style="color: #475569; font-size: 12px; margin: 0;">OphidianAI - AI-Powered Solutions</p>
              </div>
            </div>
          `,
        });
      }
    } catch (emailErr) {
      console.error("Welcome email failed:", emailErr);
    }
  }

  // Create client record
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert({
      profile_id: profileId,
      name: displayName,
      company_name: displayName,
      contact_email,
      website_url: website_url ?? null,
    })
    .select()
    .single();

  if (clientError) {
    return NextResponse.json(
      { error: `Failed to create client: ${clientError.message}` },
      { status: 500 }
    );
  }

  // Create client_services records (if services were selected)
  if (services && services.length > 0) {
    const serviceRecords = services.map((serviceType) => ({
      client_id: client.id,
      service_type: serviceType,
      status: "active" as const,
      started_at: new Date().toISOString(),
    }));

    const { error: servicesError } = await supabase
      .from("client_services")
      .insert(serviceRecords);

    if (servicesError) {
      return NextResponse.json(
        { error: `Failed to create services: ${servicesError.message}` },
        { status: 500 }
      );
    }
  }

  // If a web design service was selected, create a project record
  const hasWebService = services?.some((s) => WEB_SERVICES.includes(s));
  if (hasWebService && services) {
    const webService = services.find((s) => WEB_SERVICES.includes(s))!;

    // Get the client_service id for the web service
    const { data: clientService } = await supabase
      .from("client_services")
      .select("id")
      .eq("client_id", client.id)
      .eq("service_type", webService)
      .single();

    if (clientService) {
      await supabase.from("projects").insert({
        client_id: client.id,
        client_service_id: clientService.id,
        status: "active",
        phase: "discovery",
        phase_updated_at: new Date().toISOString(),
      });
    }
  }

  // Notify admins about the new client
  try {
    await notifyAdmins({
      type: "client_created",
      title: "New client created",
      message: `${displayName} has been added as a client.`,
      link: `/dashboard/admin/clients/${client.id}`,
    });
  } catch (e) {
    console.error("Notification failed:", e);
  }

  return NextResponse.json({ client }, { status: 201 });
}
