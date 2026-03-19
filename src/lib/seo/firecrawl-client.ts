// Firecrawl REST API client for serverless environments.
// Replaces CLI calls (execFileNoThrow("firecrawl", ...)) which don't work on Vercel.

const FIRECRAWL_API_URL = "https://api.firecrawl.dev/v1";

function getApiKey(): string {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) throw new Error("[firecrawl-client] FIRECRAWL_API_KEY is not set");
  return key;
}

function headers(): Record<string, string> {
  return {
    Authorization: `Bearer ${getApiKey()}`,
    "Content-Type": "application/json",
  };
}

// ---------------------------------------------------------------------------
// Scrape
// ---------------------------------------------------------------------------

export async function firecrawlScrape(
  url: string,
  options?: { format?: "markdown" | "html"; timeout?: number }
): Promise<string> {
  const format = options?.format ?? "markdown";
  const timeout = options?.timeout ?? 30_000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${FIRECRAWL_API_URL}/scrape`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ url, formats: [format] }),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error(`[firecrawl-client] scrape failed (${res.status}): ${await res.text()}`);
      return "";
    }

    const data = await res.json();
    return data?.data?.[format] ?? data?.data?.markdown ?? data?.data?.html ?? "";
  } catch (err) {
    console.error(`[firecrawl-client] scrape error for ${url}:`, err);
    return "";
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Map
// ---------------------------------------------------------------------------

export async function firecrawlMap(
  url: string,
  options?: { timeout?: number }
): Promise<string[]> {
  const timeout = options?.timeout ?? 60_000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${FIRECRAWL_API_URL}/map`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error(`[firecrawl-client] map failed (${res.status}): ${await res.text()}`);
      return [];
    }

    const data = await res.json();
    const links: string[] = data?.links ?? data?.data ?? [];
    return links.filter((l: string) => typeof l === "string" && l.startsWith("http"));
  } catch (err) {
    console.error(`[firecrawl-client] map error for ${url}:`, err);
    return [];
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface FirecrawlSearchResult {
  url: string;
  title: string;
  description: string;
  snippet?: string;
}

export async function firecrawlSearch(
  query: string,
  options?: { limit?: number; timeout?: number }
): Promise<FirecrawlSearchResult[]> {
  const limit = options?.limit ?? 20;
  const timeout = options?.timeout ?? 30_000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${FIRECRAWL_API_URL}/search`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ query, limit }),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error(`[firecrawl-client] search failed (${res.status}): ${await res.text()}`);
      return [];
    }

    const data = await res.json();
    const results = data?.data ?? data?.results ?? [];
    return Array.isArray(results) ? results : [];
  } catch (err) {
    console.error(`[firecrawl-client] search error for "${query}":`, err);
    return [];
  } finally {
    clearTimeout(timer);
  }
}
