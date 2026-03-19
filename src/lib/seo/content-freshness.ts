import { execFileSync } from "child_process";
import { CONTENT_FRESHNESS_THRESHOLD_DAYS } from "./tier-defaults";

export interface StalePageResult {
  url: string;
  title: string;
  publishDate: string | null;
  ageInDays: number;
}

function extractPublishDate(output: string): string | null {
  // a. article:published_time meta tag
  const metaMatch =
    output.match(
      /<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i
    ) ||
    output.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']article:published_time["']/i
    );
  if (metaMatch) return metaMatch[1];

  // b. datePublished in JSON-LD schema
  const jsonLdMatch = output.match(/"datePublished"\s*:\s*"([^"]+)"/);
  if (jsonLdMatch) return jsonLdMatch[1];

  // c. <time> element with datetime attribute
  const timeMatch = output.match(/<time[^>]+datetime=["']([^"']+)["']/i);
  if (timeMatch) return timeMatch[1];

  return null;
}

function extractTitle(output: string): string {
  // Try <title> tag first
  const titleMatch = output.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) return titleMatch[1].trim();

  // Fall back to first H1 in markdown
  const h1Match = output.match(/^#\s+(.+)$/m);
  if (h1Match) return h1Match[1].trim();

  return "";
}

function calcAgeInDays(dateStr: string): number {
  const publishDate = new Date(dateStr);
  if (isNaN(publishDate.getTime())) return -1;
  const now = new Date();
  const diffMs = now.getTime() - publishDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function isBlogUrl(url: string): boolean {
  return /\/(blog|article|articles|news|post|posts)\//i.test(url);
}

export async function scanContentFreshness(
  siteUrl: string
): Promise<StalePageResult[]> {
  // 1. Map site with firecrawl to get all page URLs
  let allUrls: string[] = [];
  try {
    const mapOutput = execFileSync("firecrawl", ["map", siteUrl], {
      encoding: "utf-8",
      timeout: 60000,
    });
    // Parse URLs from output -- one per line, filter lines that look like URLs
    allUrls = mapOutput
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("http"));
  } catch {
    return [];
  }

  // 2. Filter for blog/article pages (max 20 to control API usage)
  const blogUrls = allUrls.filter(isBlogUrl).slice(0, 20);

  if (blogUrls.length === 0) return [];

  // 3. Scrape each blog page and extract publish date
  const stalePages: StalePageResult[] = [];

  for (const url of blogUrls) {
    try {
      const scrapeOutput = execFileSync(
        "firecrawl",
        ["scrape", url, "--format", "markdown"],
        {
          encoding: "utf-8",
          timeout: 30000,
        }
      );

      const publishDateStr = extractPublishDate(scrapeOutput);
      if (!publishDateStr) continue;

      const ageInDays = calcAgeInDays(publishDateStr);
      if (ageInDays < 0) continue;

      // 4. Return pages older than CONTENT_FRESHNESS_THRESHOLD_DAYS (180)
      if (ageInDays > CONTENT_FRESHNESS_THRESHOLD_DAYS) {
        stalePages.push({
          url,
          title: extractTitle(scrapeOutput),
          publishDate: publishDateStr,
          ageInDays,
        });
      }
    } catch {
      // Skip pages that can't be scraped or have no date
      continue;
    }
  }

  // 5. Sort by age descending (oldest first)
  stalePages.sort((a, b) => b.ageInDays - a.ageInDays);

  return stalePages;
}
