import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") ?? "30", 10);

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceIso = since.toISOString().split("T")[0];

  const [analyticsResult, leadsResult, conversationsResult] = await Promise.all(
    [
      supabase!
        .from("chatbot_analytics")
        .select("*")
        .eq("config_id", id)
        .gte("date", sinceIso)
        .order("date", { ascending: true }),
      supabase!
        .from("chatbot_leads")
        .select("*")
        .eq("config_id", id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase!
        .from("chatbot_conversations")
        .select("*")
        .eq("config_id", id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]
  );

  if (analyticsResult.error) {
    return NextResponse.json(
      { error: analyticsResult.error.message },
      { status: 500 }
    );
  }
  if (leadsResult.error) {
    return NextResponse.json(
      { error: leadsResult.error.message },
      { status: 500 }
    );
  }
  if (conversationsResult.error) {
    return NextResponse.json(
      { error: conversationsResult.error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    analytics: analyticsResult.data,
    leads: leadsResult.data,
    conversations: conversationsResult.data,
  });
}
