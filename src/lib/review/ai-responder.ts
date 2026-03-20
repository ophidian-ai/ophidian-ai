import { generateText } from "ai";
import { createClient } from "@/lib/supabase/server";
import type { ReviewConfig, Review, ReviewResponse } from "@/lib/supabase/review-types";
import { REVIEW_TIER_DEFAULTS } from "@/lib/review/tier-defaults";

/**
 * Generate an AI response for a review and save it to review_responses.
 * Returns the created ReviewResponse.
 */
export async function generateResponse(
  config: ReviewConfig,
  review: Review
): Promise<ReviewResponse> {
  const supabase = await createClient();
  const tierConfig = REVIEW_TIER_DEFAULTS[config.tier];

  // Build brand voice prompt
  let voiceInstructions: string;
  if (config.tier === "essentials" || tierConfig.brandVoice === "fixed") {
    voiceInstructions = `Tone: Professional and polite. Keep the response brief (2-3 sentences).
Do not include a sign-off name. Thank the reviewer and address their feedback factually.`;
  } else {
    const bv = config.brand_voice;
    voiceInstructions = `Tone: ${bv.tone}.
Brand voice guidelines: ${bv.guidelines}
Sign-off: ${bv.signoff}`;
  }

  const ratingLabel =
    review.rating >= 4 ? "positive" : review.rating === 3 ? "neutral" : "negative";

  const systemPrompt = `You are writing a public Google review response on behalf of a business owner.
Business name is not provided -- do not reference it by name; use "we" and "our team".
Keep responses natural, genuine, and appropriately brief (2-4 sentences max).
Never be defensive or argumentative. Always thank the reviewer.
Do not use emojis or hashtags.
${voiceInstructions}`;

  const userPrompt = `Write a response to this ${ratingLabel} review (${review.rating}/5 stars):

Reviewer: ${review.author_name}
Review text: "${review.text ?? "(no text provided)"}"

Respond directly with only the response text -- no preamble, no quotes around it.`;

  const { text } = await generateText({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model: "anthropic/claude-haiku-4.5" as any,
    system: systemPrompt,
    prompt: userPrompt,
  });

  const generatedText = text.trim();

  // Save to review_responses
  const { data: response, error } = await supabase
    .from("review_responses")
    .insert({
      review_id: review.id,
      config_id: config.id,
      generated_text: generatedText,
      final_text: null,
      status: "draft",
      auto_posted: false,
      posted_at: null,
    })
    .select()
    .single();

  if (error || !response) {
    throw new Error(`Failed to save review response: ${error?.message}`);
  }

  return response as ReviewResponse;
}

/**
 * Analyze sentiment of a review text and update the reviews table.
 * Growth/Pro only -- Essentials tier skips this.
 */
export async function analyzeSentiment(
  reviewId: string,
  reviewText: string
): Promise<"positive" | "neutral" | "negative"> {
  if (!reviewText || reviewText.trim().length === 0) {
    return "neutral";
  }

  const { text } = await generateText({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model: "anthropic/claude-haiku-4.5" as any,
    system: `You classify customer review sentiment. Respond with exactly one word: positive, neutral, or negative. Nothing else.`,
    prompt: `Review: "${reviewText}"`,
  });

  const sentiment = text.trim().toLowerCase() as "positive" | "neutral" | "negative";
  const valid = ["positive", "neutral", "negative"];
  const resolved = valid.includes(sentiment) ? sentiment : "neutral";

  const supabase = await createClient();
  await supabase
    .from("reviews")
    .update({ sentiment: resolved })
    .eq("id", reviewId);

  return resolved;
}

/**
 * Regenerate an AI response for an existing response record.
 * Resets status to 'draft' and updates generated_text in place.
 */
export async function regenerateResponse(responseId: string): Promise<ReviewResponse> {
  const supabase = await createClient();

  // Load the existing response + review + config
  const { data: existing, error: fetchError } = await supabase
    .from("review_responses")
    .select("*, reviews(*), review_configs(*)")
    .eq("id", responseId)
    .single();

  if (fetchError || !existing) {
    throw new Error(`Response not found: ${fetchError?.message}`);
  }

  const review = existing.reviews as Review;
  const config = existing.review_configs as ReviewConfig;

  if (!review || !config) {
    throw new Error("Could not load review or config for regeneration");
  }

  const tierConfig = REVIEW_TIER_DEFAULTS[config.tier];

  let voiceInstructions: string;
  if (config.tier === "essentials" || tierConfig.brandVoice === "fixed") {
    voiceInstructions = `Tone: Professional and polite. Keep the response brief (2-3 sentences).
Do not include a sign-off name. Thank the reviewer and address their feedback factually.`;
  } else {
    const bv = config.brand_voice;
    voiceInstructions = `Tone: ${bv.tone}.
Brand voice guidelines: ${bv.guidelines}
Sign-off: ${bv.signoff}`;
  }

  const ratingLabel =
    review.rating >= 4 ? "positive" : review.rating === 3 ? "neutral" : "negative";

  const systemPrompt = `You are writing a public Google review response on behalf of a business owner.
Business name is not provided -- do not reference it by name; use "we" and "our team".
Keep responses natural, genuine, and appropriately brief (2-4 sentences max).
Never be defensive or argumentative. Always thank the reviewer.
Do not use emojis or hashtags.
${voiceInstructions}`;

  const userPrompt = `Write a response to this ${ratingLabel} review (${review.rating}/5 stars):

Reviewer: ${review.author_name}
Review text: "${review.text ?? "(no text provided)"}"

Respond directly with only the response text -- no preamble, no quotes around it.`;

  const { text } = await generateText({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model: "anthropic/claude-haiku-4.5" as any,
    system: systemPrompt,
    prompt: userPrompt,
  });

  const generatedText = text.trim();

  const { data: updated, error: updateError } = await supabase
    .from("review_responses")
    .update({
      generated_text: generatedText,
      final_text: null,
      status: "draft",
      updated_at: new Date().toISOString(),
    })
    .eq("id", responseId)
    .select()
    .single();

  if (updateError || !updated) {
    throw new Error(`Failed to update response: ${updateError?.message}`);
  }

  return updated as ReviewResponse;
}
