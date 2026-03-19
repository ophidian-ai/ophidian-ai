import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { onboardClient } from "@/lib/services/onboarding";
import type { ServiceType } from "@/lib/supabase/types";

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
      projects (*),
      profiles!clients_profile_id_fkey (full_name, phone)
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

  const body = await request.json();
  const {
    first_name,
    last_name,
    contact_email,
    company_name,
    website_url,
    phone,
    services,
    base_amount,
    deposit_amount,
    discount_codes,
  }: {
    first_name: string;
    last_name: string;
    contact_email: string;
    company_name?: string;
    website_url?: string;
    phone?: string;
    services?: ServiceType[];
    base_amount?: number;
    deposit_amount?: number;
    discount_codes?: string[];
  } = body;

  if (!first_name || !last_name || !contact_email) {
    return NextResponse.json(
      { error: "first_name, last_name, and contact_email are required" },
      { status: 400 }
    );
  }

  const fullName = `${first_name} ${last_name}`;
  const displayName = company_name || fullName;

  // Create the client record first (prospect status until onboarding completes)
  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Service role configuration missing" },
      { status: 500 }
    );
  }

  const serviceClient = createServiceClient(serviceUrl, serviceKey);

  const { data: client, error: clientError } = await serviceClient
    .from("clients")
    .insert({
      name: displayName,
      company_name: displayName,
      contact_name: fullName,
      contact_email,
      phone: phone ?? null,
      website_url: website_url ?? null,
      status: "prospect",
    })
    .select()
    .single();

  if (clientError) {
    return NextResponse.json(
      { error: `Failed to create client: ${clientError.message}` },
      { status: 500 }
    );
  }

  // Determine service type -- use first provided service or default to web_starter
  const serviceType: ServiceType =
    (services && services.length > 0 ? services[0] : null) ?? "web_starter";

  try {
    const result = await onboardClient({
      clientId: client.id,
      email: contact_email,
      fullName,
      company: displayName,
      phone: phone,
      websiteUrl: website_url,
      serviceType,
      baseAmount: base_amount ?? 0,
      depositAmount: deposit_amount ?? 0,
      discountCodes: discount_codes,
    });

    // Fetch the fully-populated client record to return the same shape as before
    const { data: updatedClient } = await serviceClient
      .from("clients")
      .select(
        `
        *,
        client_services (*),
        projects (*)
      `
      )
      .eq("id", client.id)
      .single();

    return NextResponse.json(
      { client: updatedClient ?? client, onboarding: result },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Onboarding failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
