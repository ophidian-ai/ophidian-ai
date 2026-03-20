import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateResponse, regenerateResponse } from "@/lib/review/ai-responder";
import type { ReviewConfig, Review } from "@/lib/supabase/review-types";

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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { id: reviewId } = await params;

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    // body is optional
  }

  const { responseId } = body as { responseId?: string };

  try {
    if (responseId) {
      // Regenerate existing response
      const response = await regenerateResponse(responseId);
      return NextResponse.json({ response });
    }

    // No existing response -- generate a new one
    const { data: review, error: reviewError } = await supabase!
      .from("reviews")
      .select("*, review_configs(*)")
      .eq("id", reviewId)
      .single();

    if (reviewError || !review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const config = review.review_configs as ReviewConfig;
    const response = await generateResponse(config, review as Review);
    return NextResponse.json({ response });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
