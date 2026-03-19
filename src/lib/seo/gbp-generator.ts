import { generateText } from "ai";
import { execFileNoThrow } from "@/utils/execFileNoThrow";
import type { SeoConfig } from "@/lib/supabase/seo-types";
import { GBP_DRAFT_EXPIRY_DAYS } from "./tier-defaults";
import { createClient } from "@/lib/supabase/server";

export async function generateGbpDraft(
  blogUrl: string,
  keywords: string[],
  config: SeoConfig
): Promise<{ content: string; keywordsUsed: string[] }> {
  // 1. Scrape blog post with firecrawl
  const scrapeResult = await execFileNoThrow("firecrawl", [
    "scrape",
    blogUrl,
    "--format",
    "markdown",
  ]);

  if (scrapeResult.status === "error" || !scrapeResult.stdout.trim()) {
    throw new Error(
      `Failed to scrape blog post: ${scrapeResult.stderr || "empty output"}`
    );
  }

  // 2. Truncate scraped content to 3000 chars if longer
  const scraped = scrapeResult.stdout.trim();
  const blogContent = scraped.length > 3000 ? scraped.slice(0, 3000) : scraped;

  // 3. Generate GBP update via AI Gateway
  const { text } = await generateText({
    model: "google/gemini-2.5-flash" as any,
    system: `You are a Google Business Profile update writer. Convert the blog post into a GBP update. Max 1500 characters. Naturally incorporate these keywords: ${keywords.join(", ")}. Keep it informative and actionable. Include a call-to-action linking to the blog post URL. Do not use hashtags or emojis.`,
    prompt: blogContent,
  });

  // 4. Identify which keywords appear in the output (case-insensitive)
  const lowerText = text.toLowerCase();
  const keywordsUsed = keywords.filter((kw) =>
    lowerText.includes(kw.toLowerCase())
  );

  // 5. Truncate to 1500 chars if AI exceeded limit
  const content = text.length > 1500 ? text.slice(0, 1500) : text;

  return { content, keywordsUsed };
}

export async function storeGbpDraft(
  configId: string,
  blogUrl: string,
  content: string,
  keywordsUsed: string[]
): Promise<void> {
  const supabase = await createClient();

  const expiresAt = new Date(
    Date.now() + GBP_DRAFT_EXPIRY_DAYS * 86400000
  ).toISOString();

  const { error } = await supabase.from("seo_gbp_drafts").insert({
    config_id: configId,
    source_url: blogUrl,
    content,
    keywords_used: keywordsUsed,
    status: "draft",
    expires_at: expiresAt,
  });

  if (error) {
    throw new Error(`Failed to store GBP draft: ${error.message}`);
  }
}
