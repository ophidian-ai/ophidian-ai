import type { SeoTier } from "@/lib/supabase/seo-types";

export interface SeoTierConfig {
  maxKeywords: number;
  maxCompetitors: number;
  aeoGeoLevel: "structured_data" | "monitoring" | "full_strategy";
  gbpSync: "manual" | "auto" | "auto_ongoing";
  contentFreshnessAlerts: boolean;
  aiInsights: boolean;
}

export const SEO_TIER_DEFAULTS: Record<SeoTier, SeoTierConfig> = {
  essentials: {
    maxKeywords: 5,
    maxCompetitors: 2,
    aeoGeoLevel: "structured_data",
    gbpSync: "manual",
    contentFreshnessAlerts: false,
    aiInsights: false,
  },
  growth: {
    maxKeywords: 15,
    maxCompetitors: 5,
    aeoGeoLevel: "monitoring",
    gbpSync: "auto",
    contentFreshnessAlerts: true,
    aiInsights: false,
  },
  pro: {
    maxKeywords: 30,
    maxCompetitors: 10,
    aeoGeoLevel: "full_strategy",
    gbpSync: "auto_ongoing",
    contentFreshnessAlerts: true,
    aiInsights: true,
  },
};

export const AUDIT_RATE_LIMIT_PER_DAY = 1;
export const KEYWORD_DISCOVERY_MAX_QUERIES = 20;
export const CONTENT_FRESHNESS_THRESHOLD_DAYS = 180;
export const GBP_DRAFT_EXPIRY_DAYS = 14;
