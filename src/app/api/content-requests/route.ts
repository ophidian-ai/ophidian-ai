import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyAdmins } from "@/lib/notifications";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get client record by profile_id
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const { data: requests, error } = await supabase
    .from("content_requests")
    .select("*")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(requests);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { subject, description } = body;

  if (!subject || !description) {
    return NextResponse.json(
      { error: "Subject and description are required" },
      { status: 400 }
    );
  }

  // Get client record
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const { data: contentRequest, error } = await supabase
    .from("content_requests")
    .insert({
      client_id: client.id,
      subject,
      description,
      attachments: [],
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notify admins about the new content request
  try {
    await notifyAdmins({
      type: "content_request",
      title: "New content request",
      message: `New request: ${subject}`,
      link: "/dashboard/admin/clients",
    });
  } catch (e) {
    console.error("Notification failed:", e);
  }

  return NextResponse.json(contentRequest, { status: 201 });
}
