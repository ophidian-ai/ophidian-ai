// src/lib/stripe-catalog.ts
// Fetches pricing from Stripe product catalog at build/request time.
// Products are identified by their metadata.product_key.

import { getStripe } from "./stripe";

export interface StripePlan {
  name: string;
  description: string;
  price: number; // dollars (not cents)
  yearlyPrice?: number; // dollars
  priceId: string;
  yearlyPriceId?: string;
  oneTime?: boolean;
  category: string;
  popular?: boolean;
  features: string[];
}

// Feature lists keyed by product_key
const FEATURES: Record<string, string[]> = {
  website_landing: [
    "Custom responsive design",
    "Mobile-first development",
    "Contact form integration",
    "SEO foundation",
    "Google Analytics setup",
    "14 days post-launch support",
  ],
  website_business: [
    "Everything in Landing Page, plus:",
    "Up to 8 custom pages",
    "Content management system",
    "Blog or news section",
    "Performance optimization",
    "30 days post-launch support",
  ],
  website_premium: [
    "Everything in Business, plus:",
    "Custom animations & interactions",
    "E-commerce or booking system",
    "Third-party API integrations",
    "Advanced SEO strategy",
    "60 days post-launch support",
  ],
  seo_audit: [
    "Technical SEO analysis",
    "On-page optimization report",
    "Competitor benchmarking",
    "Keyword opportunity map",
    "Branded PDF report",
    "30-minute review call",
  ],
  seo_growth_monthly: [
    "Everything in Audit, plus:",
    "Monthly on-page updates",
    "Google Business Profile management",
    "Monthly performance reports",
    "Keyword tracking dashboard",
    "Priority support",
  ],
  seo_domination_monthly: [
    "Everything in Growth, plus:",
    "Content strategy & creation",
    "Link building outreach",
    "Local SEO optimization",
    "Quarterly strategy reviews",
    "Dedicated SEO specialist",
  ],
  social_essentials_monthly: [
    "3 posts per week",
    "2 platforms managed",
    "Content calendar",
    "Basic analytics report",
    "Brand voice development",
    "Monthly review call",
  ],
  social_growth_monthly: [
    "Everything in Essentials, plus:",
    "5 posts per week",
    "4 platforms managed",
    "Community management",
    "Monthly video content",
    "Detailed analytics dashboard",
  ],
  social_pro_monthly: [
    "Everything in Growth, plus:",
    "Daily posting",
    "All platforms managed",
    "Paid ad management",
    "Influencer outreach",
    "Weekly strategy calls",
  ],
  ai_starter: [
    "Workflow analysis & mapping",
    "Single automation build",
    "Chatbot integration",
    "Training & documentation",
    "30 days of support",
    "Performance monitoring",
  ],
  ai_growth: [
    "Everything in Starter, plus:",
    "Up to 3 automation workflows",
    "CRM integration",
    "Custom AI agent",
    "Analytics dashboard",
    "60 days of support",
  ],
  ai_enterprise: [
    "Everything in Growth, plus:",
    "Unlimited automation workflows",
    "Voice agent integration",
    "Custom model fine-tuning",
    "Dedicated account manager",
    "Ongoing maintenance & updates",
  ],
};

const POPULAR_KEYS = new Set([
  "website_business",
  "seo_growth_monthly",
  "social_growth_monthly",
  "ai_growth",
]);

interface CategoryConfig {
  label: string;
  recurring?: boolean;
  planKeys: string[]; // product_keys for monthly prices
  yearlyKeys?: string[]; // product_keys for yearly prices (parallel to planKeys)
}

const CATEGORY_CONFIG: CategoryConfig[] = [
  {
    label: "Websites",
    planKeys: ["website_landing", "website_business", "website_premium"],
  },
  {
    label: "SEO",
    recurring: true,
    planKeys: ["seo_audit", "seo_growth_monthly", "seo_domination_monthly"],
    yearlyKeys: [undefined as unknown as string, "seo_growth_yearly", "seo_domination_yearly"],
  },
  {
    label: "Social Media",
    recurring: true,
    planKeys: ["social_essentials_monthly", "social_growth_monthly", "social_pro_monthly"],
    yearlyKeys: ["social_essentials_yearly", "social_growth_yearly", "social_pro_yearly"],
  },
  {
    label: "AI Services",
    planKeys: ["ai_starter", "ai_growth", "ai_enterprise"],
  },
];

export interface PricingCategory {
  label: string;
  recurring?: boolean;
  plans: StripePlan[];
}

export async function fetchPricingFromStripe(): Promise<PricingCategory[]> {
  const stripe = getStripe();

  // Fetch all active prices with product data
  const prices = await stripe.prices.list({
    active: true,
    limit: 100,
    expand: ["data.product"],
  });

  // Index prices by product_key
  const pricesByKey: Record<string, { amount: number; id: string }> = {};
  for (const price of prices.data) {
    const product = price.product as { metadata?: { product_key?: string } };
    const key = product.metadata?.product_key || price.metadata?.product_key;
    if (key && price.unit_amount) {
      pricesByKey[key] = { amount: price.unit_amount / 100, id: price.id };
    }
  }

  // Build categories
  return CATEGORY_CONFIG.map((config) => ({
    label: config.label,
    recurring: config.recurring,
    plans: config.planKeys.map((key, i) => {
      const priceData = pricesByKey[key];
      const yearlyKey = config.yearlyKeys?.[i];
      const yearlyData = yearlyKey ? pricesByKey[yearlyKey] : undefined;

      // Get product name from Stripe or fallback
      const name = key
        .replace(/_monthly$|_yearly$/, "")
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      return {
        name: FEATURES[key]
          ? name
          : name,
        description: "",
        price: priceData?.amount ?? 0,
        priceId: priceData?.id ?? "",
        yearlyPrice: yearlyData?.amount,
        yearlyPriceId: yearlyData?.id,
        oneTime: key === "seo_audit" || !config.recurring,
        category: config.label,
        popular: POPULAR_KEYS.has(key),
        features: FEATURES[key] ?? [],
      };
    }),
  }));
}
