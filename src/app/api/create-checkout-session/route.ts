import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { RETAINER_PLANS, type RetainerPlanId } from "@/lib/stripe-plans";

let _stripe: Stripe | null = null;
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return _stripe;
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const { planId } = (await request.json()) as { planId: RetainerPlanId };

  const plan = RETAINER_PLANS[planId];
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  try {
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
  } catch (err) {
    console.error("Failed to create checkout session:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
