import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { postGbpResponse } from "@/lib/review/gbp-client";
import type { ReviewConfig } from "@/lib/supabase/review-types";

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

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { responseId, finalText, action } = body as {
    responseId?: string;
    finalText?: string;
    action?: "approve" | "skip";
  };

  if (!action || !["approve", "skip"].includes(action)) {
    return NextResponse.json(
      { error: "action must be 'approve' or 'skip'" },
      { status: 400 }
    );
  }

  // Load the review
  const { data: review, error: reviewError } = await supabase!
    .from("reviews")
    .select("*, review_configs(*)")
    .eq("id", reviewId)
    .single();

  if (reviewError || !review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  if (action === "skip") {
    await supabase!
      .from("reviews")
      .update({ response_status: "skipped" })
      .eq("id", reviewId);
    return NextResponse.json({ success: true, status: "skipped" });
  }

  // action === 'approve'
  if (!responseId || typeof responseId !== "string") {
    return NextResponse.json({ error: "responseId is required for approve" }, { status: 400 });
  }
  if (!finalText || typeof finalText !== "string") {
    return NextResponse.json({ error: "finalText is required for approve" }, { status: 400 });
  }

  // Update the response record to approved
  const { error: updateError } = await supabase!
    .from("review_responses")
    .update({ final_text: finalText, status: "approved" })
    .eq("id", responseId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Post to GBP
  const config = review.review_configs as ReviewConfig;
  const posted = review.platform === "google"
    ? await postGbpResponse(config, review.platform_review_id, finalText)
    : false;

  const finalStatus = posted ? "posted" : "approved";
  const now = new Date().toISOString();

  await supabase!
    .from("review_responses")
    .update({
      status: finalStatus,
      posted_at: posted ? now : null,
    })
    .eq("id", responseId);

  await supabase!
    .from("reviews")
    .update({ response_status: finalStatus })
    .eq("id", reviewId);

  return NextResponse.json({ success: true, status: finalStatus, posted });
}
