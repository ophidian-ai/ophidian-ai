import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin();
  if ("error" in auth) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  const { supabase } = auth;
  const { id } = await params;

  const { data: client, error } = await supabase
    .from("clients")
    .select(
      `
      *,
      client_services (*),
      projects (*),
      profiles!clients_profile_id_fkey (full_name, phone)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!client) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ client });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin();
  if ("error" in auth) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  const { supabase } = auth;
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { company_name, contact_name, contact_email, phone, website_url, status } = body as {
    company_name?: string;
    contact_name?: string;
    contact_email?: string;
    phone?: string;
    website_url?: string;
    status?: string;
  };

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (company_name !== undefined) updates.company_name = company_name;
  if (contact_name !== undefined) updates.contact_name = contact_name;
  if (contact_email !== undefined) updates.contact_email = contact_email;
  if (phone !== undefined) updates.phone = phone;
  if (website_url !== undefined) updates.website_url = website_url;
  if (status !== undefined) updates.status = status;

  if (Object.keys(updates).length === 1) {
    return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
  }

  const { data: updated, error } = await supabase
    .from("clients")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ client: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin();
  if ("error" in auth) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  const { supabase } = auth;
  const { id } = await params;

  const { error } = await supabase
    .from("clients")
    .update({ status: "inactive", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
