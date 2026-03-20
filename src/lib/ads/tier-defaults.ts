export const AD_TIER_DEFAULTS = {
  essentials: {
    platforms: 1,
    maxCampaigns: 1,
    maxDraftsPerMonth: 3,
    budgetRecommendations: false,
    weeklyOptimization: false,
    audienceSuggestions: false,
  },
  growth: {
    platforms: 2,
    maxCampaigns: 3,
    maxDraftsPerMonth: 10,
    budgetRecommendations: true,
    weeklyOptimization: true,
    audienceSuggestions: true,
  },
  pro: {
    platforms: 2,
    maxCampaigns: Infinity,
    maxDraftsPerMonth: Infinity,
    budgetRecommendations: true,
    weeklyOptimization: true,
    audienceSuggestions: true,
  },
} as const;
