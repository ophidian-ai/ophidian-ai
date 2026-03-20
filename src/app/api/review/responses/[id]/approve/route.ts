import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { postGbpResponse } from "@/lib/review/gbp-client";
import type { ReviewConfig, Review } from "@/lib/supabase/review-types";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  // Client auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: responseId } = await params;

  // Load response -- RLS ensures client can only see their own
  const { data: response, error: fetchError } = await supabase
    .from("review_responses")
    .select("*, reviews(*, review_configs(*))")
    .eq("id", responseId)
    .single();

  if (fetchError || !response) {
    return NextResponse.json({ error: "Response not found" }, { status: 404 });
  }

  // Validate ownership: response.config_id -> review_configs.client_id -> clients.profile_id
  const reviewConfig = (response.reviews as { review_configs: ReviewConfig }).review_configs;
  const { data: clientRecord } = await supabase
    .from("clients")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!clientRecord || reviewConfig.client_id !== clientRecord.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const textToPost = response.final_text ?? response.generated_text;
  const review = response.reviews as Review & { review_configs: ReviewConfig };

  // Post to GBP if Google review
  const posted =
    review.platform === "google"
      ? await postGbpResponse(reviewConfig, review.platform_review_id, textToPost)
      : false;

  const finalStatus = posted ? "posted" : "approved";
  const now = new Date().toISOString();

  await supabase
    .from("review_responses")
    .update({ status: finalStatus, posted_at: posted ? now : null })
    .eq("id", responseId);

  await supabase
    .from("reviews")
    .update({ response_status: finalStatus })
    .eq("id", review.id);

  return NextResponse.json({ success: true, status: finalStatus, posted });
}
