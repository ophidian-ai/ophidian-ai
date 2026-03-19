import type { SeoTier } from "@/lib/supabase/seo-types";
import { createClient } from "@/lib/supabase/server";
import { execFileNoThrow } from "@/utils/execFileNoThrow";

export interface AuditResult {
  scores: {
    onpage: number;
    technical: number;
    content: number;
    local: number;
    speed: number;
    aiVisibility: number;
  };
  issues: Array<{
    area: string;
    finding: string;
    severity: "high" | "medium" | "low";
    impact: string;
    status: "open";
  }>;
  recommendations: Array<{
    priority: number;
    action: string;
    impact: string;
  }>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function scrape(url: string): Promise<string> {
  const result = await execFileNoThrow("firecrawl", ["scrape", url, "--format", "markdown"], {
    timeout: 30_000,
  });
  return result.stdout;
}

async function mapSite(url: string): Promise<string[]> {
  const result = await execFileNoThrow("firecrawl", ["map", url], { timeout: 30_000 });
  if (result.status === "error" || !result.stdout) return [];
  return result.stdout
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.startsWith("http"));
}

async function tryFetch(url: string): Promise<string> {
  const result = await execFileNoThrow("firecrawl", ["scrape", url, "--format", "markdown"], {
    timeout: 15_000,
  });
  return result.stdout;
}

function countWords(markdown: string): number {
  return markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/[#*_~[\]()!>|]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

// ---------------------------------------------------------------------------
// On-page analysis (score 1–5)
// ---------------------------------------------------------------------------

interface OnPageAnalysis {
  score: number;
  missingTitle: boolean;
  badTitleLength: boolean;
  missingMeta: boolean;
  badMetaLength: boolean;
  missingH1: boolean;
  multipleH1: boolean;
  missingH2: boolean;
  imagesWithoutAlt: boolean;
}

function analyzeOnPage(content: string): OnPageAnalysis {
  // Title tag
  const titleMatch = content.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const titleText = titleMatch ? titleMatch[1].trim() : "";
  const missingTitle = titleText.length === 0;
  const badTitleLength = !missingTitle && (titleText.length < 50 || titleText.length > 60);

  // Meta description
  const metaMatch =
    content.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ??
    content.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const metaText = metaMatch ? metaMatch[1].trim() : "";
  const missingMeta = metaText.length === 0;
  const badMetaLength = !missingMeta && (metaText.length < 150 || metaText.length > 160);

  // H1
  const h1HtmlCount = (content.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) ?? []).length;
  const h1MdCount = (content.match(/^#\s+.+/gm) ?? []).length;
  const h1Count = h1HtmlCount + h1MdCount;
  const missingH1 = h1Count === 0;
  const multipleH1 = h1Count > 1;

  // H2s
  const h2HtmlCount = (content.match(/<h2[^>]*>/gi) ?? []).length;
  const h2MdCount = (content.match(/^##\s+.+/gm) ?? []).length;
  const missingH2 = h2HtmlCount + h2MdCount === 0;

  // Images without alt
  const imgNoAltCount = (
    content.match(/<img(?![^>]*\balt=["'][^"']+["'])[^>]*>/gi) ?? []
  ).length;
  const imagesWithoutAlt = imgNoAltCount > 0;

  // Score: start at 5, deduct per gap
  let score = 5;
  if (missingTitle) score -= 1;
  else if (badTitleLength) score -= 0.5;
  if (missingMeta) score -= 1;
  else if (badMetaLength) score -= 0.5;
  if (missingH1 || multipleH1) score -= 1;
  if (missingH2) score -= 0.5;
  if (imagesWithoutAlt) score -= 0.5;

  return {
    score: Math.max(1, Math.round(score)),
    missingTitle,
    badTitleLength,
    missingMeta,
    badMetaLength,
    missingH1,
    multipleH1,
    missingH2,
    imagesWithoutAlt,
  };
}

// ---------------------------------------------------------------------------
// Technical analysis (score 1–5)
// ---------------------------------------------------------------------------

interface TechnicalAnalysis {
  score: number;
  noHttps: boolean;
  noSitemap: boolean;
  noRobots: boolean;
  dirtyUrl: boolean;
}

async function analyzeTechnical(url: string): Promise<TechnicalAnalysis> {
  const noHttps = !url.startsWith("https://");

  const origin = (() => {
    try {
      return new URL(url).origin;
    } catch {
      return url.replace(/\/$/, "");
    }
  })();

  const [sitemapContent, robotsContent] = await Promise.all([
    tryFetch(`${origin}/sitemap.xml`),
    tryFetch(`${origin}/robots.txt`),
  ]);

  const noSitemap = sitemapContent.length < 50;
  const noRobots = robotsContent.length < 10;
  const dirtyUrl = /[?#]/.test(url);

  let score = 5;
  if (noHttps) score -= 2;
  if (noSitemap) score -= 1;
  if (noRobots) score -= 1;
  if (dirtyUrl) score -= 0.5;

  return {
    score: Math.max(1, Math.round(score)),
    noHttps,
    noSitemap,
    noRobots,
    dirtyUrl,
  };
}

// ---------------------------------------------------------------------------
// Content analysis (score 1–5)
// ---------------------------------------------------------------------------

interface ContentAnalysis {
  score: number;
  thinContent: boolean;
  noKeywords: boolean;
  wordCount: number;
}

function analyzeContent(content: string, targetKeywords: string[]): ContentAnalysis {
  const wordCount = countWords(content);
  const thinContent = wordCount < 300;

  const lower = content.toLowerCase();
  const noKeywords =
    targetKeywords.length > 0 &&
    !targetKeywords.some((kw) => lower.includes(kw.toLowerCase()));

  let score = 5;
  if (thinContent) score -= 2;
  if (noKeywords) score -= 1;
  if (wordCount < 150) score -= 1; // severely thin

  return {
    score: Math.max(1, Math.round(score)),
    thinContent,
    noKeywords,
    wordCount,
  };
}

// ---------------------------------------------------------------------------
// Local analysis (score 1–5)
// ---------------------------------------------------------------------------

interface LocalAnalysis {
  score: number;
  noNap: boolean;
  noLocalKeywords: boolean;
  noMapOrGbp: boolean;
}

function analyzeLocal(content: string, location: string | null): LocalAnalysis {
  const lower = content.toLowerCase();

  // NAP: phone + address indicators
  const hasPhone = /\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4}/.test(content);
  const hasAddress =
    /(street|st\.|avenue|ave\.|road|rd\.|drive|dr\.|blvd|boulevard|lane|ln\.|suite|ste\.)/i.test(
      content
    );
  const noNap = !(hasPhone && hasAddress);

  // Local keywords from location field or generic geo patterns
  const localTerms = location
    ? location.toLowerCase().split(/[\s,]+/).filter((t) => t.length > 2)
    : [];
  const genericGeoPatterns = /(serving|located in|near|local|community|neighborhood)/i.test(
    content
  );
  const noLocalKeywords =
    localTerms.length > 0 ? !localTerms.some((t) => lower.includes(t)) : !genericGeoPatterns;

  // Map / GBP
  const hasMap =
    /google\.com\/maps/i.test(content) ||
    /maps\.googleapis/i.test(content) ||
    /<iframe[^>]*maps/i.test(content) ||
    /business\.google\.com/i.test(content);
  const noMapOrGbp = !hasMap;

  let score = 5;
  if (noNap) score -= 2;
  if (noLocalKeywords) score -= 1;
  if (noMapOrGbp) score -= 1;

  return {
    score: Math.max(1, Math.round(score)),
    noNap,
    noLocalKeywords,
    noMapOrGbp,
  };
}

// ---------------------------------------------------------------------------
// Speed analysis (score 1–5, heuristic-only)
// ---------------------------------------------------------------------------

interface SpeedAnalysis {
  score: number;
  largeImages: boolean;
  excessiveScripts: boolean;
}

function analyzeSpeed(content: string): SpeedAnalysis {
  // Images lacking optimization parameters
  const imageUrls =
    content.match(/https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|gif|bmp|webp)/gi) ?? [];
  const unoptimized = imageUrls.filter(
    (u) => !/(width=|w=|quality=|q=|auto=|format=|f=|resize|compress|optimize)/i.test(u)
  );
  const largeImages = unoptimized.length > 3;

  // Excessive external scripts
  const externalScripts = (content.match(/<script[^>]+src=["']https?:\/\//gi) ?? []).length;
  const excessiveScripts = externalScripts > 8;

  // Default mid-range, adjust by indicators
  let score = 3;
  if (!largeImages && !excessiveScripts) score = 4;
  if (largeImages) score -= 1;
  if (excessiveScripts) score -= 1;

  return {
    score: Math.max(1, Math.min(5, score)),
    largeImages,
    excessiveScripts,
  };
}

// ---------------------------------------------------------------------------
// AI Visibility / AEO / GEO analysis (score 1–5)
// ---------------------------------------------------------------------------

interface AiVisibilityAnalysis {
  score: number;
  noSchema: boolean;
  noQandA: boolean;
  noFaqSection: boolean;
}

function analyzeAiVisibility(content: string): AiVisibilityAnalysis {
  // Schema: JSON-LD or microdata
  const hasJsonLd = /<script[^>]+type=["']application\/ld\+json["']/i.test(content);
  const hasMicrodata = /itemtype=["']https?:\/\/schema\.org/i.test(content);
  const noSchema = !(hasJsonLd || hasMicrodata);

  // Q&A patterns
  const hasQandA =
    /\b(q:|question:|a:|answer:)/i.test(content) || /\?\s*\n[\s\S]{1,500}?\n/m.test(content);
  const noQandA = !hasQandA;

  // FAQ sections
  const hasFaqSection = /faq|frequently asked questions|common questions/i.test(content);
  const noFaqSection = !hasFaqSection;

  // Rubric: 1=none, 2=basic schema only, 3=schema+Q&A, 4=schema+Q&A+FAQ, 5=full structured data
  let score: number;
  if (noSchema && noQandA && noFaqSection) {
    score = 1;
  } else if (!noSchema && noQandA && noFaqSection) {
    score = 2;
  } else if (!noSchema && !noQandA && noFaqSection) {
    score = 3;
  } else if (!noSchema && !noQandA && !noFaqSection) {
    score = 4;
  } else {
    score = noSchema ? 1 : 2;
    if (!noQandA) score += 1;
    if (!noFaqSection) score += 1;
    score = Math.min(4, score);
  }

  // Full 5 only with rich schema types + all three signals
  if (
    !noSchema &&
    /LocalBusiness|FAQPage|HowTo/i.test(content) &&
    !noQandA &&
    !noFaqSection
  ) {
    score = 5;
  }

  return {
    score: Math.max(1, Math.min(5, score)),
    noSchema,
    noQandA,
    noFaqSection,
  };
}

// ---------------------------------------------------------------------------
// Issue + recommendation builder
// ---------------------------------------------------------------------------

type IssueSeverity = "high" | "medium" | "low";

interface RawIssue {
  area: string;
  finding: string;
  severity: IssueSeverity;
  impact: string;
  priority: number;
  action: string;
}

function buildIssues(
  onPage: OnPageAnalysis,
  technical: TechnicalAnalysis,
  content: ContentAnalysis,
  local: LocalAnalysis,
  speed: SpeedAnalysis,
  aiVis: AiVisibilityAnalysis
): RawIssue[] {
  const issues: RawIssue[] = [];

  // --- On-page ---
  if (onPage.missingTitle) {
    issues.push({
      area: "On-Page",
      finding: "Search engines have no label to show your page in results",
      severity: "high",
      impact: "Lost click-through from search results on every page missing a title",
      priority: 1,
      action: "Add a descriptive title tag (50–60 characters) to every page",
    });
  } else if (onPage.badTitleLength) {
    issues.push({
      area: "On-Page",
      finding: "Page title gets cut off or wastes space in search results",
      severity: "medium",
      impact: "Reduced click-through rate from search results",
      priority: 4,
      action: "Rewrite title tags to 50–60 characters with the primary keyword near the front",
    });
  }

  if (onPage.missingMeta) {
    issues.push({
      area: "On-Page",
      finding: "Search engines can't tell what your pages are about",
      severity: "high",
      impact: "Google writes its own snippet—often pulling irrelevant text—lowering click rates",
      priority: 2,
      action: "Write a unique meta description (150–160 characters) for every page",
    });
  } else if (onPage.badMetaLength) {
    issues.push({
      area: "On-Page",
      finding: "Meta description is too short or gets truncated in search results",
      severity: "low",
      impact: "Search snippet is less compelling, reducing clicks",
      priority: 6,
      action: "Adjust meta descriptions to 150–160 characters",
    });
  }

  if (onPage.missingH1) {
    issues.push({
      area: "On-Page",
      finding: "Search engines can't identify the main topic of the page",
      severity: "high",
      impact: "Weaker keyword relevance signals reduce rankings for target terms",
      priority: 3,
      action: "Add exactly one H1 tag per page that contains the primary keyword",
    });
  }

  if (onPage.multipleH1) {
    issues.push({
      area: "On-Page",
      finding: "Multiple H1 tags confuse search engines about the page topic",
      severity: "medium",
      impact: "Diluted topical relevance signal lowers ranking potential",
      priority: 5,
      action: "Remove extra H1 tags—keep exactly one per page",
    });
  }

  if (onPage.missingH2) {
    issues.push({
      area: "On-Page",
      finding: "Content has no structure, making it harder for search engines to parse sections",
      severity: "low",
      impact: "Reduced content crawlability and engagement; no subtopic coverage signals",
      priority: 8,
      action: "Break content into sections using H2 subheadings",
    });
  }

  if (onPage.imagesWithoutAlt) {
    issues.push({
      area: "On-Page",
      finding: "Images are invisible to search engines and screen readers",
      severity: "medium",
      impact: "Missed image-search traffic and accessibility compliance risk",
      priority: 7,
      action: "Add descriptive alt text to every image",
    });
  }

  // --- Technical ---
  if (technical.noHttps) {
    issues.push({
      area: "Technical",
      finding: "Browsers warn visitors your site is not secure",
      severity: "high",
      impact: "Visitors leave immediately; Google ranks HTTPS sites above HTTP",
      priority: 1,
      action: "Install an SSL certificate and redirect all HTTP traffic to HTTPS",
    });
  }

  if (technical.noSitemap) {
    issues.push({
      area: "Technical",
      finding: "Search engines have no map to find all your pages",
      severity: "medium",
      impact: "New or updated pages may not get indexed for weeks",
      priority: 4,
      action: "Generate and submit an XML sitemap to Google Search Console",
    });
  }

  if (technical.noRobots) {
    issues.push({
      area: "Technical",
      finding: "Search engine crawlers have no guidance on what to index",
      severity: "low",
      impact: "Risk of duplicate or private pages appearing in search results",
      priority: 7,
      action: "Create a robots.txt file at the site root",
    });
  }

  if (technical.dirtyUrl) {
    issues.push({
      area: "Technical",
      finding: "URL contains parameters that make it hard to share and index",
      severity: "low",
      impact: "Link equity dilution and potential for duplicate content",
      priority: 9,
      action: "Use clean, keyword-friendly URL slugs without query parameters",
    });
  }

  // --- Content ---
  if (content.thinContent) {
    issues.push({
      area: "Content",
      finding: "Pages don't have enough content for search engines to rank them",
      severity: "high",
      impact: "Google skips thin pages; visitors leave without converting",
      priority: 2,
      action: `Expand page content to at least 300 words (current: ~${content.wordCount} words)`,
    });
  }

  if (content.noKeywords) {
    issues.push({
      area: "Content",
      finding: "Target keywords don't appear on the page",
      severity: "high",
      impact: "Page won't rank for the terms your customers are searching",
      priority: 3,
      action: "Naturally work target keywords into headings, first paragraph, and body copy",
    });
  }

  // --- Local ---
  if (local.noNap) {
    issues.push({
      area: "Local",
      finding: "Customers can't find your address or phone number on the site",
      severity: "high",
      impact: "Lower local pack rankings; customers call competitors instead",
      priority: 2,
      action:
        "Add your business name, full address, and phone number to every page (typically in the footer)",
    });
  }

  if (local.noLocalKeywords) {
    issues.push({
      area: "Local",
      finding: "Your location isn't mentioned, so you won't show up in local searches",
      severity: "medium",
      impact: "Invisible to people searching for services in your city",
      priority: 5,
      action: "Include your city and state naturally in page headings and body copy",
    });
  }

  if (local.noMapOrGbp) {
    issues.push({
      area: "Local",
      finding: "No Google Maps or Business Profile link—customers can't verify your location",
      severity: "medium",
      impact: "Reduced trust and weaker local SEO signals",
      priority: 6,
      action: "Embed a Google Map or link to your Google Business Profile on the Contact page",
    });
  }

  // --- Speed ---
  if (speed.largeImages) {
    issues.push({
      area: "Speed",
      finding: "Unoptimized images are slowing your site down",
      severity: "medium",
      impact: "Slow load times push visitors away and lower Google rankings",
      priority: 4,
      action: "Compress and serve images in WebP format with width/quality parameters",
    });
  }

  if (speed.excessiveScripts) {
    issues.push({
      area: "Speed",
      finding: "Too many third-party scripts are blocking your pages from loading",
      severity: "medium",
      impact: "Each extra script adds 100–500ms of load time, hurting rankings and conversions",
      priority: 5,
      action: "Audit and remove unnecessary third-party scripts; defer non-critical ones",
    });
  }

  // --- AI Visibility ---
  if (aiVis.noSchema) {
    issues.push({
      area: "AI Visibility",
      finding: "Google can't show your business info in search results",
      severity: "high",
      impact: "Invisible in AI-generated search overviews and rich results",
      priority: 3,
      action: "Add LocalBusiness JSON-LD schema to every page",
    });
  }

  if (aiVis.noQandA) {
    issues.push({
      area: "AI Visibility",
      finding: "No Q&A content for AI search engines to surface as answers",
      severity: "medium",
      impact: "Competitors with Q&A content get featured in AI Overviews instead of you",
      priority: 5,
      action: "Add a Q&A or FAQ section answering the top questions customers ask",
    });
  }

  if (aiVis.noFaqSection) {
    issues.push({
      area: "AI Visibility",
      finding: "No FAQ section reduces your chances of appearing in AI-generated answers",
      severity: "low",
      impact: "Lower likelihood of being cited in Google AI Overviews and Perplexity answers",
      priority: 8,
      action: "Create a dedicated FAQ page or section with FAQPage schema markup",
    });
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Public: runSiteAudit
// ---------------------------------------------------------------------------

export async function runSiteAudit(url: string, tier: SeoTier): Promise<AuditResult> {
  // 1. Scrape page content and site structure in parallel
  const [pageContent] = await Promise.all([scrape(url), mapSite(url)]);

  // Target keywords and location are resolved from the caller's SeoConfig;
  // pass empty defaults here — callers that have the config can extend this.
  const targetKeywords: string[] = [];
  const location: string | null = null;

  // 2. Run all analyses (technical fetches sitemap + robots in parallel internally)
  const [onPage, technical, aiVis] = await Promise.all([
    Promise.resolve(analyzeOnPage(pageContent)),
    analyzeTechnical(url),
    Promise.resolve(analyzeAiVisibility(pageContent)),
  ]);
  const content = analyzeContent(pageContent, targetKeywords);
  const local = analyzeLocal(pageContent, location);
  const speed = analyzeSpeed(pageContent);

  // 3. Build issues and recommendations
  const rawIssues = buildIssues(onPage, technical, content, local, speed, aiVis);

  const issues: AuditResult["issues"] = rawIssues.map((i) => ({
    area: i.area,
    finding: i.finding,
    severity: i.severity,
    impact: i.impact,
    status: "open" as const,
  }));

  const recommendations: AuditResult["recommendations"] = rawIssues
    .sort((a, b) => a.priority - b.priority)
    .map((i, idx) => ({
      priority: idx + 1,
      action: i.action,
      impact: i.impact,
    }));

  return {
    scores: {
      onpage: onPage.score,
      technical: technical.score,
      content: content.score,
      local: local.score,
      speed: speed.score,
      aiVisibility: aiVis.score,
    },
    issues,
    recommendations,
  };
}

// ---------------------------------------------------------------------------
// Public: storeAudit
// ---------------------------------------------------------------------------

export async function storeAudit(
  configId: string,
  date: string,
  result: AuditResult,
  reportUrl: string | null,
  aiInsights: string | null
): Promise<void> {
  const supabase = await createClient();

  await supabase.from("seo_audits").insert({
    config_id: configId,
    date,
    score_onpage: result.scores.onpage,
    score_technical: result.scores.technical,
    score_content: result.scores.content,
    score_local: result.scores.local,
    score_speed: result.scores.speed,
    score_ai_visibility: result.scores.aiVisibility,
    issues: result.issues,
    recommendations: result.recommendations,
    report_url: reportUrl,
    ai_insights: aiInsights,
  });
}
