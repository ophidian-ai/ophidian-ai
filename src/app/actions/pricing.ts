"use server";

import { fetchPricingFromStripe, type PricingCategory } from "@/lib/stripe-catalog";

let cachedPricing: PricingCategory[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function getPricing(): Promise<PricingCategory[]> {
  const now = Date.now();

  if (cachedPricing && now - cacheTimestamp < CACHE_TTL) {
    return cachedPricing;
  }

  try {
    cachedPricing = await fetchPricingFromStripe();
    cacheTimestamp = now;
    return cachedPricing;
  } catch (error) {
    console.error("Failed to fetch pricing from Stripe:", error);
    // Return cached data if available, even if stale
    if (cachedPricing) return cachedPricing;
    return [];
  }
}
