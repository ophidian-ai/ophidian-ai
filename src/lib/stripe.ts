import Stripe from "stripe"

// Lazy-init: avoids build-time crash when env var isn't present
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set")
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { typescript: true })
  }
  return _stripe
}

export const PLANS = {
  starter: {
    name: "Starter",
    monthly: 49900, // $499 in cents
    yearly: 449900,
    description: "A polished, conversion-ready website to launch your online presence",
  },
  growth: {
    name: "Growth",
    monthly: 149900,
    yearly: 1349900,
    description: "Full-featured site with AI integrations to automate and scale",
  },
  enterprise: {
    name: "Enterprise",
    monthly: 399900,
    yearly: 3599900,
    description: "Custom AI solutions and full-stack development for complex needs",
  },
} as const

export type PlanId = keyof typeof PLANS
export type BillingInterval = "monthly" | "yearly"
