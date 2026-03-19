import { execFileNoThrow } from "@/utils/execFileNoThrow";
import { createClient } from "@/lib/supabase/server";
import type { SeoRanking } from "@/lib/supabase/seo-types";

export interface RankResult {
  keyword: string;
  position: "top-3" | "top-10" | "top-20" | "not-found";
  aiOverview: boolean;
  competitorPositions: Record<string, string>;
}

interface FirecrawlSearchResult {
  url: string;
  title: string;
  description: string;
}

function getPositionBucket(index: number): "top-3" | "top-10" | "top-20" | "not-found" {
  if (index >= 0 && index <= 2) return "top-3";
  if (index >= 3 && index <= 9) return "top-10";
  if (index >= 10 && index <= 19) return "top-20";
  return "not-found";
}

function hostnameMatches(resultUrl: string, targetUrl: string): boolean {
  try {
    const resultHost = new URL(resultUrl).hostname;
    const targetHost = new URL(targetUrl).hostname;
    return resultHost.includes(targetHost) || targetHost.includes(resultHost);
  } catch {
    return false;
  }
}

function hasAiOverview(results: FirecrawlSearchResult[]): boolean {
  const topResults = results.slice(0, 5);
  return topResults.some(
    (r) =>
      r.title?.toLowerCase().includes("ai overview") ||
      r.description?.toLowerCase().includes("ai overview") ||
      r.url?.toLowerCase().includes("ai-overview")
  );
}

export async function checkKeywordRanks(
  clientUrl: string,
  keywords: string[],
  competitors: Array<{ name: string; url: string }>
): Promise<RankResult[]> {
  const results: RankResult[] = [];

  for (const keyword of keywords) {
    const { stdout, status } = await execFileNoThrow("firecrawl", ["search", keyword, "--format", "json"], {
      timeout: 30000,
    });

    if (status === "error" || !stdout.trim()) {
      console.error(`[rank-tracker] Firecrawl failed for keyword "${keyword}"`);
      results.push({
        keyword,
        position: "not-found",
        aiOverview: false,
        competitorPositions: {},
      });
      continue;
    }

    let searchResults: FirecrawlSearchResult[] = [];
    try {
      const parsed = JSON.parse(stdout);
      searchResults = Array.isArray(parsed) ? parsed : (parsed.results ?? parsed.data ?? []);
    } catch {
      console.error(`[rank-tracker] Failed to parse JSON output for keyword "${keyword}"`);
      results.push({
        keyword,
        position: "not-found",
        aiOverview: false,
        competitorPositions: {},
      });
      continue;
    }

    // Find client position
    const clientIndex = searchResults.findIndex((r) => hostnameMatches(r.url, clientUrl));
    const position = clientIndex === -1 ? "not-found" : getPositionBucket(clientIndex);

    // Check AI overview
    const aiOverview = hasAiOverview(searchResults);

    // Find competitor positions
    const competitorPositions: Record<string, string> = {};
    for (const competitor of competitors) {
      const compIndex = searchResults.findIndex((r) => hostnameMatches(r.url, competitor.url));
      competitorPositions[competitor.name] =
        compIndex === -1 ? "not-found" : getPositionBucket(compIndex);
    }

    results.push({ keyword, position, aiOverview, competitorPositions });
  }

  return results;
}

export async function storeRankings(
  configId: string,
  date: string,
  results: RankResult[]
): Promise<void> {
  const supabase = await createClient();

  for (const result of results) {
    const record: Omit<SeoRanking, "id" | "created_at"> = {
      config_id: configId,
      date,
      keyword: result.keyword,
      position: result.position,
      ai_overview: result.aiOverview,
      competitor_positions: result.competitorPositions,
    };

    const { error } = await supabase
      .from("seo_rankings")
      .upsert(record, { onConflict: "config_id,date,keyword" });

    if (error) {
      console.error(
        `[rank-tracker] Failed to upsert ranking for keyword "${result.keyword}":`,
        error.message
      );
    }
  }
}
