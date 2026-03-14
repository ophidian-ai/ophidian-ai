// src/lib/stripe-plans.ts
// Plan definitions for self-service checkout (retainer services only)
// Web design projects use Stripe Payment Links (generated manually per client)

export interface RetainerPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number; // cents
  stripePriceId: string;
  features: string[];
}

export const RETAINER_PLANS: Record<string, RetainerPlan> = {
  seo_growth_standard: {
    id: "seo_growth_standard",
    name: "SEO Growth - Standard",
    description: "Ongoing SEO optimization with monthly reporting",
    priceMonthly: 25000, // $250
    stripePriceId: process.env.STRIPE_PRICE_SEO_GROWTH_STANDARD || "price_1TA0CGR4rFKcPc1jldz9yRYR",
    features: [
      "Keyword tracking",
      "1 blog post/page update per month",
      "Google Business Profile management",
      "Monthly performance report",
    ],
  },
  seo_growth_premium: {
    id: "seo_growth_premium",
    name: "SEO Growth - Premium",
    description: "Comprehensive SEO with strategy calls",
    priceMonthly: 35000, // $350
    stripePriceId: process.env.STRIPE_PRICE_SEO_GROWTH_PREMIUM || "price_1TA0CQR4rFKcPc1jSucwFEXJ",
    features: [
      "Everything in Standard",
      "2 posts/updates per month",
      "Quarterly strategy call",
      "Internal linking maintenance",
    ],
  },
  maintenance_standard: {
    id: "maintenance_standard",
    name: "Website Maintenance",
    description: "Hosting, security, and minor content updates",
    priceMonthly: 10000, // $100
    stripePriceId: process.env.STRIPE_PRICE_MAINTENANCE_STANDARD || "price_1TA09lR4rFKcPc1jv1EVGLQc",
    features: [
      "Vercel hosting",
      "SSL certificate",
      "Monthly security checks",
      "Minor content updates",
      "Uptime monitoring",
    ],
  },
  maintenance_ecommerce: {
    id: "maintenance_ecommerce",
    name: "E-Commerce Maintenance",
    description: "Enhanced maintenance for online stores",
    priceMonthly: 15000, // $150
    stripePriceId: process.env.STRIPE_PRICE_MAINTENANCE_ECOMMERCE || "price_1TA09yR4rFKcPc1jQN0HDUtr",
    features: [
      "Everything in Standard Maintenance",
      "Product catalog updates",
      "Payment system monitoring",
    ],
  },
};

export type RetainerPlanId = keyof typeof RETAINER_PLANS;
