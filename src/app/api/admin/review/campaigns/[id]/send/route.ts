import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendCampaign } from "@/lib/review/campaigns";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "Unauthorized", status: 401 };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin")
    return { supabase: null, error: "Forbidden", status: 403 };
  return { supabase, error: null, status: 200 };
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;

  try {
    const campaign = await sendCampaign(id);
    return NextResponse.json({ campaign });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send campaign";
    const isTierError = message.includes("Pro tier");
    const isStatusError = message.includes("not in draft");
    return NextResponse.json(
      { error: message },
      { status: isTierError ? 403 : isStatusError ? 409 : 500 }
    );
  }
}
