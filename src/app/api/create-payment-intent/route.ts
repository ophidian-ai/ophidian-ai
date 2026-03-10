import { NextResponse } from "next/server"
import { getStripe, PLANS, type PlanId, type BillingInterval } from "@/lib/stripe"

export async function POST(request: Request) {
  try {
    const { planId, interval } = (await request.json()) as {
      planId: PlanId
      interval: BillingInterval
    }

    const plan = PLANS[planId]
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const amount = interval === "yearly" ? plan.yearly : plan.monthly

    const paymentIntent = await getStripe().paymentIntents.create({
      amount,
      currency: "usd",
      metadata: {
        planId,
        interval,
        planName: plan.name,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (err) {
    console.error("Failed to create payment intent:", err)
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    )
  }
}
