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

export async function GET(request: NextRequest) {
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(request.url);
  const config_id = searchParams.get("config_id");
  const platform = searchParams.get("platform");
  const ratingParam = searchParams.get("rating");
  const statusFilter = searchParams.get("status");
  const cursor = searchParams.get("cursor");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "25", 10), 100);

  let query = supabase!
    .from("reviews")
    .select(
      "*, review_responses(id, status, generated_text, final_text, posted_at, auto_posted)",
      { count: "exact" }
    )
    .order("review_date", { ascending: false })
    .limit(limit);

  if (config_id) query = query.eq("config_id", config_id);
  if (platform) query = query.eq("platform", platform);
  if (ratingParam) {
    const rating = parseInt(ratingParam, 10);
    if (!isNaN(rating)) query = query.eq("rating", rating);
  }
  if (statusFilter) query = query.eq("response_status", statusFilter);
  if (cursor) query = query.lt("review_date", cursor);

  const { data, error: dbError, count } = await query;

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  const reviews = data ?? [];
  const nextCursor =
    reviews.length === limit
      ? reviews[reviews.length - 1].review_date
      : null;

  return NextResponse.json({ reviews, total: count, nextCursor });
}
