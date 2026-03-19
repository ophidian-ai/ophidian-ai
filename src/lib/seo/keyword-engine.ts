import { KEYWORD_DISCOVERY_MAX_QUERIES } from "./tier-defaults";
import { firecrawlSearch, type FirecrawlSearchResult } from "@/lib/seo/firecrawl-client";

export interface KeywordSuggestion {
  keyword: string;
  source: string;
}

function extractKeywordsFromText(text: string): string[] {
  const keywords: string[] = [];

  // Extract "related searches" patterns
  const relatedSearchesMatches = text.match(
    /related searches?[:\s]+([^\n.]+)/gi
  );
  if (relatedSearchesMatches) {
    for (const match of relatedSearchesMatches) {
      const phrase = match.replace(/related searches?[:\s]+/i, "").trim();
      if (phrase.length > 3 && phrase.length < 100) {
        keywords.push(phrase);
      }
    }
  }

  // Extract "people also ask" patterns
  const peopleAskMatches = text.match(/people also ask[:\s]+([^\n.]+)/gi);
  if (peopleAskMatches) {
    for (const match of peopleAskMatches) {
      const phrase = match.replace(/people also ask[:\s]+/i, "").trim();
      if (phrase.length > 3 && phrase.length < 100) {
        keywords.push(phrase);
      }
    }
  }

  // Extract keyword-like noun phrases containing service/intent signals
  const nounPhrasePattern =
    /\b([a-z][a-z\s]{3,40}(?:service|company|near|best|local|small business|specialist|expert|provider|solution|tool|software|platform|agency|consultant)[a-z\s]*)\b/gi;
  const nounMatches = text.match(nounPhrasePattern);
  if (nounMatches) {
    for (const match of nounMatches) {
      const phrase = match.trim().toLowerCase();
      if (phrase.length > 3 && phrase.length < 80) {
        keywords.push(phrase);
      }
    }
  }

  return keywords;
}

async function runFirecrawlSearch(
  query: string
): Promise<FirecrawlSearchResult[] | null> {
  const results = await firecrawlSearch(query);
  return results.length > 0 ? results : null;
}

export async function discoverKeywords(
  topic: string,
  location: string,
  limit: number = 20
): Promise<KeywordSuggestion[]> {
  const maxQueries = Math.min(limit, KEYWORD_DISCOVERY_MAX_QUERIES);

  const queries = [
    `${topic} ${location}`,
    `${topic} near me ${location}`,
    `best ${topic} ${location}`,
    `${topic} for small business ${location}`,
    `${topic} services ${location}`,
  ].slice(0, maxQueries);

  const seen = new Set<string>();
  const suggestions: KeywordSuggestion[] = [];

  for (const query of queries) {
    if (suggestions.length >= limit) break;

    const results = await runFirecrawlSearch(query);
    if (!results) continue;

    for (const result of results) {
      if (suggestions.length >= limit) break;

      // Add the title itself as a keyword candidate if it looks like a short phrase
      if (result.title) {
        const normalized = result.title.toLowerCase().trim();
        if (normalized.length > 2 && normalized.length < 80 && !seen.has(normalized)) {
          seen.add(normalized);
          suggestions.push({ keyword: normalized, source: query });
          if (suggestions.length >= limit) break;
        }
      }

      // Extract keywords from title, description, and snippet text
      const texts = [result.title, result.description, result.snippet].filter(
        Boolean
      ) as string[];

      for (const text of texts) {
        if (suggestions.length >= limit) break;

        const extracted = extractKeywordsFromText(text);

        for (const kw of extracted) {
          if (suggestions.length >= limit) break;

          const normalized = kw.toLowerCase().trim();
          if (!seen.has(normalized) && normalized.length > 2) {
            seen.add(normalized);
            suggestions.push({ keyword: normalized, source: query });
          }
        }
      }
    }
  }

  return suggestions.slice(0, limit);
}
