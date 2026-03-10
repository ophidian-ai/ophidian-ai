import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { RETAINER_PLANS, type RetainerPlanId } from "@/lib/stripe-plans";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const { planId } = (await request.json()) as { planId: RetainerPlanId };

  const plan = RETAINER_PLANS[planId];
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: plan.name,
            description: plan.description,
          },
          unit_amount: plan.priceMonthly,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    custom_fields: [
      { key: "company_name", label: { type: "custom", custom: "Company Name" }, type: "text" },
      { key: "website_url", label: { type: "custom", custom: "Business Website URL" }, type: "text", optional: true },
    ],
    subscription_data: {
      metadata: { service_type: planId.startsWith("seo_") ? "seo_growth" : "maintenance" },
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://ophidian-ai.vercel.app"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://ophidian-ai.vercel.app"}/pricing`,
  });

  return NextResponse.json({ url: session.url });
}
