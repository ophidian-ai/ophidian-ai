import type { ReviewTier } from "@/lib/supabase/review-types";

export interface ReviewTierConfig {
  platformsMonitored: string[];
  brandVoice: "fixed" | "configurable";
  autoRespondPositive: boolean;
  autoRespondNegative: boolean;
  escalationAlertsWebhook: boolean;
  reviewRequestCampaigns: boolean;
  sentimentAnalysis: boolean;
  ratingTrendTracking: boolean;
  competitorBenchmarking: number;
  monthlyPdfReport: boolean;
}

export const REVIEW_TIER_DEFAULTS: Record<ReviewTier, ReviewTierConfig> = {
  essentials: {
    platformsMonitored: ["google"],
    brandVoice: "fixed",
    autoRespondPositive: false,
    autoRespondNegative: false,
    escalationAlertsWebhook: false,
    reviewRequestCampaigns: false,
    sentimentAnalysis: false,
    ratingTrendTracking: false,
    competitorBenchmarking: 0,
    monthlyPdfReport: true,
  },
  growth: {
    platformsMonitored: ["google", "yelp", "facebook"],
    brandVoice: "configurable",
    autoRespondPositive: true,
    autoRespondNegative: false,
    escalationAlertsWebhook: false,
    reviewRequestCampaigns: false,
    sentimentAnalysis: true,
    ratingTrendTracking: true,
    competitorBenchmarking: 0,
    monthlyPdfReport: true,
  },
  pro: {
    platformsMonitored: ["google", "yelp", "facebook"],
    brandVoice: "configurable",
    autoRespondPositive: true,
    autoRespondNegative: true,
    escalationAlertsWebhook: true,
    reviewRequestCampaigns: true,
    sentimentAnalysis: true,
    ratingTrendTracking: true,
    competitorBenchmarking: 3,
    monthlyPdfReport: true,
  },
};

export const MAX_AI_RESPONSES_PER_CRON_RUN = 50;
export const POLL_INTERVAL_HOURS = 4;
export const CAMPAIGN_MAX_CONTACTS = 500;
export const COMPETITOR_MAX_COUNT = 3;
