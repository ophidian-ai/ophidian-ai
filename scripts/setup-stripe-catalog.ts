/**
 * Sets up the OphidianAI product catalog in Stripe.
 * Run: npx tsx scripts/setup-stripe-catalog.ts
 *
 * Creates products and prices for all service tiers.
 * Idempotent -- checks for existing products by metadata before creating.
 */

import Stripe from "stripe";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^(\w+)="?([^"]*)"?$/);
  if (match) process.env[match[1]] = match[2];
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { typescript: true });

interface PriceDef {
  productKey: string;
  name: string;
  description: string;
  category: string;
  amount: number; // cents
  recurring?: { interval: "month" | "year" };
  oneTime?: boolean;
}

const CATALOG: PriceDef[] = [
  // Websites (one-time)
  { productKey: "website_landing", name: "Landing Page", description: "A focused single-page site to capture leads and drive conversions.", category: "Websites", amount: 150000, oneTime: true },
  { productKey: "website_business", name: "Business Website", description: "A full multi-page website built to establish your digital presence.", category: "Websites", amount: 250000, oneTime: true },
  { productKey: "website_premium", name: "Premium Build", description: "A bespoke site with advanced features, animations, and integrations.", category: "Websites", amount: 500000, oneTime: true },

  // SEO
  { productKey: "seo_audit", name: "SEO Audit", description: "A comprehensive one-time audit with actionable recommendations.", category: "SEO", amount: 40000, oneTime: true },
  { productKey: "seo_growth_monthly", name: "SEO Growth", description: "Monthly optimization to steadily improve your search rankings.", category: "SEO", amount: 25000, recurring: { interval: "month" } },
  { productKey: "seo_growth_yearly", name: "SEO Growth (Annual)", description: "Monthly optimization to steadily improve your search rankings.", category: "SEO", amount: 250000, recurring: { interval: "year" } },
  { productKey: "seo_domination_monthly", name: "SEO Domination", description: "Aggressive growth strategy for businesses ready to own their market.", category: "SEO", amount: 50000, recurring: { interval: "month" } },
  { productKey: "seo_domination_yearly", name: "SEO Domination (Annual)", description: "Aggressive growth strategy for businesses ready to own their market.", category: "SEO", amount: 500000, recurring: { interval: "year" } },

  // Social Media
  { productKey: "social_essentials_monthly", name: "Social Media Essentials", description: "Consistent social presence without the time investment.", category: "Social Media", amount: 25000, recurring: { interval: "month" } },
  { productKey: "social_essentials_yearly", name: "Social Media Essentials (Annual)", description: "Consistent social presence without the time investment.", category: "Social Media", amount: 250000, recurring: { interval: "year" } },
  { productKey: "social_growth_monthly", name: "Social Media Growth", description: "Expanded reach with more content, more platforms, more engagement.", category: "Social Media", amount: 45000, recurring: { interval: "month" } },
  { productKey: "social_growth_yearly", name: "Social Media Growth (Annual)", description: "Expanded reach with more content, more platforms, more engagement.", category: "Social Media", amount: 450000, recurring: { interval: "year" } },
  { productKey: "social_pro_monthly", name: "Social Media Pro", description: "Full-service social media management for maximum impact.", category: "Social Media", amount: 70000, recurring: { interval: "month" } },
  { productKey: "social_pro_yearly", name: "Social Media Pro (Annual)", description: "Full-service social media management for maximum impact.", category: "Social Media", amount: 700000, recurring: { interval: "year" } },

  // AI Services (one-time)
  { productKey: "ai_starter", name: "AI Starter", description: "Add intelligent automation to your existing workflows.", category: "AI Services", amount: 300000, oneTime: true },
  { productKey: "ai_growth", name: "AI Growth", description: "Multiple AI integrations working together across your business.", category: "AI Services", amount: 600000, oneTime: true },
  { productKey: "ai_enterprise", name: "AI Enterprise", description: "End-to-end AI transformation for businesses ready to scale.", category: "AI Services", amount: 1200000, oneTime: true },
];

async function findExistingProduct(key: string): Promise<Stripe.Product | null> {
  const products = await stripe.products.search({
    query: `metadata["product_key"]:"${key}"`,
  });
  return products.data[0] || null;
}

async function setup() {
  console.log("Setting up OphidianAI Stripe product catalog...\n");

  const results: Record<string, string> = {};

  for (const item of CATALOG) {
    // Check if product already exists
    let product = await findExistingProduct(item.productKey);

    if (!product) {
      product = await stripe.products.create({
        name: item.name,
        description: item.description,
        metadata: {
          product_key: item.productKey,
          category: item.category,
        },
      });
      console.log(`  Created product: ${item.name} (${product.id})`);
    } else {
      console.log(`  Exists: ${item.name} (${product.id})`);
    }

    // Check if price already exists for this product
    const existingPrices = await stripe.prices.list({
      product: product.id,
      active: true,
      limit: 10,
    });

    const matchingPrice = existingPrices.data.find(
      (p) =>
        p.unit_amount === item.amount &&
        (item.recurring
          ? p.recurring?.interval === item.recurring.interval
          : p.type === "one_time")
    );

    if (matchingPrice) {
      console.log(`    Price exists: $${(item.amount / 100).toFixed(2)} (${matchingPrice.id})`);
      results[item.productKey] = matchingPrice.id;
    } else {
      const priceParams: Stripe.PriceCreateParams = {
        product: product.id,
        unit_amount: item.amount,
        currency: "usd",
        metadata: { product_key: item.productKey },
      };

      if (item.recurring) {
        priceParams.recurring = { interval: item.recurring.interval };
      }

      const price = await stripe.prices.create(priceParams);
      console.log(`    Created price: $${(item.amount / 100).toFixed(2)} (${price.id})`);
      results[item.productKey] = price.id;
    }
  }

  console.log("\n--- Price IDs for .env.local ---\n");
  for (const [key, priceId] of Object.entries(results)) {
    console.log(`STRIPE_PRICE_${key.toUpperCase()}=${priceId}`);
  }

  console.log("\nDone.");
}

setup().catch(console.error);
