import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import type Stripe from "stripe"

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log(
        `Payment succeeded: ${paymentIntent.id} | Plan: ${paymentIntent.metadata.planName} | Amount: $${(paymentIntent.amount / 100).toFixed(2)}`
      )
      // TODO: Send confirmation email via Resend, create client record in Supabase
      break
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.error(
        `Payment failed: ${paymentIntent.id} | Plan: ${paymentIntent.metadata.planName}`
      )
      break
    }

    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription
      console.log(`Subscription created: ${subscription.id}`)
      // TODO: Handle AI integration subscription setup
      break
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription
      console.log(`Subscription updated: ${subscription.id} | Status: ${subscription.status}`)
      break
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription
      console.log(`Subscription cancelled: ${subscription.id}`)
      // TODO: Handle subscription cancellation
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
