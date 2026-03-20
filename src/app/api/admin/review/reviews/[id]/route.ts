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
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;

  // Return review with full response history
  const { data: review, error: reviewError } = await supabase!
    .from("reviews")
    .select("*")
    .eq("id", id)
    .single();

  if (reviewError || !review) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: responses, error: responsesError } = await supabase!
    .from("review_responses")
    .select("*")
    .eq("review_id", id)
    .order("created_at", { ascending: false });

  if (responsesError) {
    return NextResponse.json({ error: responsesError.message }, { status: 500 });
  }

  return NextResponse.json({ review, responses: responses ?? [] });
}
