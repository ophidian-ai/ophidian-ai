import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("*, clients(company_name, contact_name, contact_email)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { contact_name, contact_email, company_name, phone, content, payment_schedule } = body;

  if (!contact_name || !contact_email || !company_name) {
    return NextResponse.json({ error: "contact_name, contact_email, and company_name are required" }, { status: 400 });
  }

  const supabase = getServiceClient();

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert({
      name: company_name,
      company_name,
      contact_name,
      contact_email,
      phone: phone || null,
      status: "prospect",
    })
    .select("id")
    .single();

  if (clientError) return NextResponse.json({ error: clientError.message }, { status: 500 });

  const { data: proposal, error: proposalError } = await supabase
    .from("proposals")
    .insert({
      client_id: client.id,
      content: content || {},
      payment_schedule: payment_schedule || [],
      status: "draft",
    })
    .select("id")
    .single();

  if (proposalError) return NextResponse.json({ error: proposalError.message }, { status: 500 });

  return NextResponse.json({ client_id: client.id, proposal_id: proposal.id }, { status: 201 });
}
