import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import type { ReviewConfig, Review } from "@/lib/supabase/review-types";
import { REVIEW_TIER_DEFAULTS } from "@/lib/review/tier-defaults";
import {
  listGbpReviews,
  starRatingToNumber,
  type GbpReview,
} from "@/lib/review/gbp-client";
import { generateResponse, analyzeSentiment } from "@/lib/review/ai-responder";
import { postGbpResponse } from "@/lib/review/gbp-client";

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY!);
  }
  return resend;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Poll Google Business Profile reviews for a config.
 * Inserts new reviews (deduplicated by platform_review_id).
 * Returns count of new reviews inserted.
 */
export async function pollGbpReviews(config: ReviewConfig): Promise<number> {
  const supabase = await createClient();
  let newCount = 0;
  let pageToken: string | undefined;

  do {
    const response = await listGbpReviews(config, pageToken);
    const reviews: GbpReview[] = response.reviews ?? [];
    pageToken = response.nextPageToken;

    for (const raw of reviews) {
      const rating = starRatingToNumber(raw.starRating);
      const platformReviewId = raw.reviewId ?? raw.name.split("/").pop() ?? raw.name;

      const row = {
        config_id: config.id,
        platform: "google",
        platform_review_id: platformReviewId,
        author_name: raw.reviewer.displayName,
        author_image_url: raw.reviewer.profilePhotoUrl ?? null,
        rating,
        text: raw.comment ?? null,
        review_date: raw.createTime,
        sentiment: null,
        response_status: "pending",
        is_competitor: false,
        competitor_name: null,
      };

      const { data: inserted, error } = await supabase
        .from("reviews")
        .insert(row)
        .select("id")
        .single();

      if (error) {
        // 23505 = unique_violation (duplicate) -- skip silently
        if (!error.code || error.code !== "23505") {
          console.error("[pollGbpReviews] Insert error:", error.message);
        }
        continue;
      }

      if (inserted) {
        newCount++;
      }
    }
  } while (pageToken);

  return newCount;
}

/**
 * Scrape Yelp reviews via Firecrawl.
 * Requires config.yelp_url and tier that supports it.
 */
export async function scrapeYelpReviews(config: ReviewConfig): Promise<number> {
  const tierConfig = REVIEW_TIER_DEFAULTS[config.tier];
  if (!tierConfig.platformsMonitored.includes("yelp") || !config.yelp_url) {
    return 0;
  }

  let scrapeData: Record<string, unknown> | null = null;

  try {
    const firecrawlKey = process.env.FIRECRAWL_API_KEY;
    if (!firecrawlKey) {
      console.warn("[scrapeYelpReviews] FIRECRAWL_API_KEY not set");
      return 0;
    }

    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: config.yelp_url,
        formats: ["html", "markdown"],
      }),
    });

    if (!res.ok) {
      console.error("[scrapeYelpReviews] Firecrawl error:", res.status);
      return 0;
    }

    scrapeData = await res.json();
  } catch (err) {
    console.error("[scrapeYelpReviews] Fetch error:", err);
    return 0;
  }

  if (!scrapeData) return 0;

  // Parse review cards from markdown/HTML
  // Yelp review format: author, star rating, text, date
  const markdown = (scrapeData.markdown as string) ?? "";
  const parsed = parseYelpMarkdown(markdown);

  if (parsed.length === 0) return 0;

  const supabase = await createClient();
  let newCount = 0;

  for (const review of parsed) {
    const row = {
      config_id: config.id,
      platform: "yelp",
      platform_review_id: review.id,
      author_name: review.author,
      author_image_url: null,
      rating: review.rating,
      text: review.text ?? null,
      review_date: review.date,
      sentiment: null,
      response_status: "pending",
      is_competitor: false,
      competitor_name: null,
    };

    const { error } = await supabase.from("reviews").insert(row);
    if (!error) {
      newCount++;
    }
  }

  return newCount;
}

interface ParsedReview {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

function parseYelpMarkdown(markdown: string): ParsedReview[] {
  // Minimal parser -- Yelp HTML structure changes frequently.
  // Looks for patterns like "★★★★★" or "5 star rating" + author names.
  const reviews: ParsedReview[] = [];
  const lines = markdown.split("\n");

  let current: Partial<ParsedReview> | null = null;

  for (const line of lines) {
    const starMatch = line.match(/(\d)\s*(?:star|★)/i);
    if (starMatch) {
      if (current?.author && current.rating) {
        reviews.push({
          id: `yelp-${current.author}-${current.date ?? ""}`.replace(/\s/g, "-"),
          author: current.author,
          rating: current.rating,
          text: current.text ?? "",
          date: current.date ?? new Date().toISOString(),
        });
      }
      current = { rating: parseInt(starMatch[1]) };
      continue;
    }

    if (current && !current.author && line.trim().length > 0 && line.trim().length < 60) {
      current.author = line.trim();
      continue;
    }

    if (current && current.author && !current.text && line.trim().length > 20) {
      current.text = line.trim();
      continue;
    }

    const dateMatch = line.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}/i);
    if (current && dateMatch) {
      current.date = new Date(dateMatch[0]).toISOString();
    }
  }

  if (current?.author && current.rating) {
    reviews.push({
      id: `yelp-${current.author}-${current.date ?? ""}`.replace(/\s/g, "-"),
      author: current.author,
      rating: current.rating,
      text: current.text ?? "",
      date: current.date ?? new Date().toISOString(),
    });
  }

  return reviews;
}

/**
 * Scrape Facebook page reviews via Firecrawl.
 */
export async function scrapeFacebookReviews(config: ReviewConfig): Promise<number> {
  const tierConfig = REVIEW_TIER_DEFAULTS[config.tier];
  if (!tierConfig.platformsMonitored.includes("facebook") || !config.facebook_page_id) {
    return 0;
  }

  const facebookUrl = `https://www.facebook.com/${config.facebook_page_id}/reviews`;

  let scrapeData: Record<string, unknown> | null = null;

  try {
    const firecrawlKey = process.env.FIRECRAWL_API_KEY;
    if (!firecrawlKey) {
      console.warn("[scrapeFacebookReviews] FIRECRAWL_API_KEY not set");
      return 0;
    }

    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: facebookUrl, formats: ["markdown"] }),
    });

    if (!res.ok) {
      console.error("[scrapeFacebookReviews] Firecrawl error:", res.status);
      return 0;
    }

    scrapeData = await res.json();
  } catch (err) {
    console.error("[scrapeFacebookReviews] Fetch error:", err);
    return 0;
  }

  if (!scrapeData) return 0;

  const markdown = (scrapeData.markdown as string) ?? "";
  const parsed = parseFacebookMarkdown(markdown, config.facebook_page_id);

  const supabase = await createClient();
  let newCount = 0;

  for (const review of parsed) {
    const row = {
      config_id: config.id,
      platform: "facebook",
      platform_review_id: review.id,
      author_name: review.author,
      author_image_url: null,
      rating: review.rating,
      text: review.text ?? null,
      review_date: review.date,
      sentiment: null,
      response_status: "pending",
      is_competitor: false,
      competitor_name: null,
    };

    const { error } = await supabase.from("reviews").insert(row);
    if (!error) {
      newCount++;
    }
  }

  return newCount;
}

function parseFacebookMarkdown(markdown: string, pageId: string): ParsedReview[] {
  // Facebook reviews page is often blocked by Firecrawl (logged-in wall).
  // This parser handles basic cases if content is accessible.
  const reviews: ParsedReview[] = [];
  const ratingPattern = /recommended|not recommended|\d\s*(?:out of 5|stars?)/gi;
  const segments = markdown.split(ratingPattern);

  segments.forEach((seg, i) => {
    if (i === 0) return;
    const lines = seg.trim().split("\n").filter((l) => l.trim());
    if (lines.length === 0) return;

    reviews.push({
      id: `fb-${pageId}-${i}`,
      author: lines[0]?.trim() ?? "Facebook Reviewer",
      rating: markdown.toLowerCase().includes("not recommended") ? 1 : 5,
      text: lines.slice(1).join(" ").trim(),
      date: new Date().toISOString(),
    });
  });

  return reviews;
}

/**
 * Send email notification about a new review.
 */
export async function notifyNewReview(
  config: ReviewConfig,
  review: Review
): Promise<void> {
  const client = getResend();
  const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

  try {
    await client.emails.send({
      from: "OphidianAI Reviews <reviews@ophidianai.com>",
      to: config.notification_email,
      subject: `New ${review.rating}-star review from ${review.author_name}`,
      html: `
        <p>A new review has been received on <strong>${review.platform}</strong>.</p>
        <p><strong>Author:</strong> ${review.author_name}</p>
        <p><strong>Rating:</strong> ${stars} (${review.rating}/5)</p>
        ${review.text ? `<p><strong>Review:</strong> "${review.text}"</p>` : ""}
        <p>Log in to your dashboard to review and respond.</p>
      `,
    });
  } catch (err) {
    console.error("[notifyNewReview] Resend error:", err);
  }
}

/**
 * Process a new review: generate AI response, auto-post if tier permits.
 * Logs to CRM event bus if CRM config exists.
 */
export async function processNewReview(
  config: ReviewConfig,
  review: Review,
  aiResponseBudget: { remaining: number }
): Promise<void> {
  const supabase = await createClient();
  const tierConfig = REVIEW_TIER_DEFAULTS[config.tier];

  // Sentiment analysis for Growth/Pro
  if (tierConfig.sentimentAnalysis) {
    try {
      await analyzeSentiment(review.id, review.text ?? "");
    } catch (err) {
      console.error("[processNewReview] Sentiment analysis failed:", err);
    }
  }

  // Generate AI response if budget allows
  if (aiResponseBudget.remaining <= 0) return;

  let response = null;
  try {
    response = await generateResponse(config, review);
    aiResponseBudget.remaining--;
  } catch (err) {
    console.error("[processNewReview] AI generation failed:", err);
    return;
  }

  // Auto-post logic by tier
  const isPositive = review.rating >= 4;

  if (config.tier === "growth" && isPositive && config.auto_respond_positive) {
    // Auto-post positive reviews for Growth
    const posted = await postGbpResponse(config, review.platform_review_id, response.generated_text);
    if (posted) {
      await supabase
        .from("review_responses")
        .update({ status: "posted", posted_at: new Date().toISOString(), auto_posted: true })
        .eq("id", response.id);
      await supabase
        .from("reviews")
        .update({ response_status: "posted" })
        .eq("id", review.id);
    }
  } else if (config.tier === "pro") {
    if (config.auto_respond_positive && isPositive) {
      const posted = await postGbpResponse(config, review.platform_review_id, response.generated_text);
      if (posted) {
        await supabase
          .from("review_responses")
          .update({ status: "posted", posted_at: new Date().toISOString(), auto_posted: true })
          .eq("id", response.id);
        await supabase
          .from("reviews")
          .update({ response_status: "posted" })
          .eq("id", review.id);
      }
    } else if (config.auto_respond_negative && !isPositive) {
      const posted = await postGbpResponse(config, review.platform_review_id, response.generated_text);
      if (posted) {
        await supabase
          .from("review_responses")
          .update({ status: "posted", posted_at: new Date().toISOString(), auto_posted: true })
          .eq("id", response.id);
        await supabase
          .from("reviews")
          .update({ response_status: "posted" })
          .eq("id", review.id);
      }

      // Escalation alert for 1-2 star reviews on Pro
      if (review.rating <= 2 && config.escalation_email && tierConfig.escalationAlertsWebhook) {
        try {
          const client = getResend();
          await client.emails.send({
            from: "OphidianAI Reviews <reviews@ophidianai.com>",
            to: config.escalation_email,
            subject: `URGENT: ${review.rating}-star review requires attention`,
            html: `
              <p>A low-rating review has been received and may require personal attention.</p>
              <p><strong>Author:</strong> ${review.author_name}</p>
              <p><strong>Rating:</strong> ${review.rating}/5</p>
              ${review.text ? `<p><strong>Review:</strong> "${review.text}"</p>` : ""}
              <p>An AI response has been drafted. Log in to review it.</p>
            `,
          });
        } catch (err) {
          console.error("[processNewReview] Escalation email failed:", err);
        }
      }
    }
  }
  // Essentials: draft only, no auto-post

  // CRM event bus (optional, best-effort)
  try {
    const { logActivity } = await import("@/lib/crm/activities");
    // Find CRM config for this client
    const { data: crmConfig } = await supabase
      .from("crm_configs")
      .select("id")
      .eq("client_id", config.client_id)
      .eq("active", true)
      .single();

    if (crmConfig) {
      // Find CRM contact by review author name (approximate match)
      const { data: contact } = await supabase
        .from("crm_contacts")
        .select("id")
        .eq("config_id", crmConfig.id)
        .ilike("name", `%${review.author_name}%`)
        .limit(1)
        .single();

      if (contact) {
        await logActivity(
          crmConfig.id,
          contact.id,
          "review_received",
          `${review.rating}-star review received on ${review.platform}: "${(review.text ?? "").slice(0, 100)}"`,
          { type: "review", id: review.id }
        );
      }
    }
  } catch {
    // CRM logging is optional -- swallow all errors
  }
}

/**
 * Orchestrate one full monitoring cycle for a config.
 * Called by the review-poll cron job.
 */
export async function runMonitoringCycle(
  configId: string,
  aiResponseBudget: { remaining: number }
): Promise<{ newReviews: number }> {
  const supabase = await createClient();

  const { data: config, error } = await supabase
    .from("review_configs")
    .select("*")
    .eq("id", configId)
    .eq("active", true)
    .single();

  if (error || !config) {
    console.error("[runMonitoringCycle] Config not found:", configId);
    return { newReviews: 0 };
  }

  const reviewConfig = config as ReviewConfig;
  let totalNew = 0;

  // Poll GBP
  try {
    const gbpNew = await pollGbpReviews(reviewConfig);
    totalNew += gbpNew;
  } catch (err) {
    console.error("[runMonitoringCycle] GBP poll failed:", err);
  }

  // Respect GBP rate limit (60 req/min): add 1s delay between clients
  await sleep(1000);

  // Scrape Yelp
  try {
    const yelpNew = await scrapeYelpReviews(reviewConfig);
    totalNew += yelpNew;
  } catch (err) {
    console.error("[runMonitoringCycle] Yelp scrape failed:", err);
  }

  // Scrape Facebook
  try {
    const fbNew = await scrapeFacebookReviews(reviewConfig);
    totalNew += fbNew;
  } catch (err) {
    console.error("[runMonitoringCycle] Facebook scrape failed:", err);
  }

  // Fetch newly inserted reviews and process them
  if (totalNew > 0) {
    const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // last 10 min
    const { data: newReviews } = await supabase
      .from("reviews")
      .select("*")
      .eq("config_id", configId)
      .eq("response_status", "pending")
      .gte("created_at", cutoff)
      .order("created_at", { ascending: false });

    if (newReviews) {
      for (const review of newReviews as Review[]) {
        // Notify admin
        try {
          await notifyNewReview(reviewConfig, review);
        } catch (err) {
          console.error("[runMonitoringCycle] Notification failed:", err);
        }

        // Process (generate response + auto-post)
        try {
          await processNewReview(reviewConfig, review, aiResponseBudget);
        } catch (err) {
          console.error("[runMonitoringCycle] Processing failed:", err);
        }

        if (aiResponseBudget.remaining <= 0) break;
      }
    }
  }

  return { newReviews: totalNew };
}
