import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { postGbpResponse } from "@/lib/review/gbp-client";
import type { ReviewConfig, Review } from "@/lib/supabase/review-types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  // Client auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: responseId } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { finalText, post } = body as { finalText?: string; post?: boolean };

  if (!finalText || typeof finalText !== "string") {
    return NextResponse.json({ error: "finalText is required" }, { status: 400 });
  }

  // Load response -- RLS ensures client can only see their own
  const { data: response, error: fetchError } = await supabase
    .from("review_responses")
    .select("*, reviews(*, review_configs(*))")
    .eq("id", responseId)
    .single();

  if (fetchError || !response) {
    return NextResponse.json({ error: "Response not found" }, { status: 404 });
  }

  // Validate ownership
  const reviewConfig = (response.reviews as { review_configs: ReviewConfig }).review_configs;
  const { data: clientRecord } = await supabase
    .from("clients")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!clientRecord || reviewConfig.client_id !== clientRecord.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Update final_text
  await supabase
    .from("review_responses")
    .update({ final_text: finalText, status: "approved" })
    .eq("id", responseId);

  // Optionally post immediately
  if (post) {
    const review = response.reviews as Review & { review_configs: ReviewConfig };
    const posted =
      review.platform === "google"
        ? await postGbpResponse(reviewConfig, review.platform_review_id, finalText)
        : false;

    if (posted) {
      const now = new Date().toISOString();
      await supabase
        .from("review_responses")
        .update({ status: "posted", posted_at: now })
        .eq("id", responseId);
      await supabase
        .from("reviews")
        .update({ response_status: "posted" })
        .eq("id", review.id);
    }

    return NextResponse.json({ success: true, status: posted ? "posted" : "approved", posted });
  }

  return NextResponse.json({ success: true, status: "approved" });
}
