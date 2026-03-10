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
    company_name,
    contact_email,
    website_url,
    services,
  }: {
    company_name: string;
    contact_email: string;
    website_url?: string;
    services: ServiceType[];
  } = body;

  if (!company_name || !contact_email || !services?.length) {
    return NextResponse.json(
      { error: "company_name, contact_email, and services are required" },
      { status: 400 }
    );
  }

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
        user_metadata: { company: company_name },
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
      role: "client",
      company: company_name,
      website_url: website_url ?? null,
    });
  }

  // Create client record
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert({
      profile_id: profileId,
      company_name,
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

  // Create client_services records
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

  // If a web design service was selected, create a project record
  const hasWebService = services.some((s) => WEB_SERVICES.includes(s));
  if (hasWebService) {
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
      message: `${company_name} has been added as a client.`,
      link: `/dashboard/admin/clients/${client.id}`,
    });
  } catch (e) {
    console.error("Notification failed:", e);
  }

  return NextResponse.json({ client }, { status: 201 });
}
