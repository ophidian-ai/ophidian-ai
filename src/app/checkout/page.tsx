"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { Container } from "@/components/ui/Container"
import { GlassButton } from "@/components/ui/glass-button"
import { PLANS, type PlanId, type BillingInterval } from "@/lib/stripe"
import { CheckCircle, ArrowLeft, Shield, Lock } from "lucide-react"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

function CheckoutForm({
  planId,
  interval,
}: {
  planId: PlanId
  interval: BillingInterval
}) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [succeeded, setSucceeded] = useState(false)

  const plan = PLANS[planId]
  const amount = interval === "yearly" ? plan.yearly : plan.monthly
  const displayAmount = (amount / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)
    setError(null)

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?plan=${planId}&interval=${interval}`,
      },
      redirect: "if_required",
    })

    if (submitError) {
      setError(submitError.message ?? "Payment failed. Please try again.")
      setIsProcessing(false)
    } else {
      setSucceeded(true)
      setIsProcessing(false)
    }
  }

  if (succeeded) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 mb-6">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Payment successful
        </h2>
        <p className="text-foreground-muted mb-8">
          Thank you for choosing OphidianAI. We&apos;ll be in touch within 24
          hours to kick off your {plan.name} project.
        </p>
        <GlassButton onClick={() => router.push("/")}>
          Back to Home
        </GlassButton>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order summary */}
      <div className="glass rounded-xl border border-primary/10 p-6">
        <h3 className="text-sm font-medium text-foreground-muted uppercase tracking-wider mb-4">
          Order Summary
        </h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-foreground font-semibold text-lg">
            {plan.name} Plan
          </span>
          <span className="text-foreground font-bold text-xl">
            {displayAmount}
          </span>
        </div>
        <p className="text-foreground-dim text-sm">
          {plan.description}
        </p>
        <div className="mt-3 pt-3 border-t border-primary/10">
          <span className="text-xs text-foreground-dim">
            Billed {interval === "yearly" ? "annually" : "monthly"}
          </span>
        </div>
      </div>

      {/* Payment form */}
      <div className="glass rounded-xl border border-primary/10 p-6">
        <h3 className="text-sm font-medium text-foreground-muted uppercase tracking-wider mb-4">
          Payment Details
        </h3>
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <GlassButton
        type="submit"
        disabled={!stripe || isProcessing}
        size="lg"
        className="w-full"
      >
        {isProcessing ? "Processing..." : `Pay ${displayAmount}`}
      </GlassButton>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-6 text-foreground-dim text-xs">
        <span className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5" />
          Secure checkout
        </span>
        <span className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5" />
          SSL encrypted
        </span>
      </div>
    </form>
  )
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const planId = (searchParams.get("plan") ?? "starter") as PlanId
  const interval = (searchParams.get("interval") ?? "monthly") as BillingInterval

  const validPlan = planId in PLANS
  const validInterval = interval === "monthly" || interval === "yearly"

  useEffect(() => {
    if (!validPlan || !validInterval) {
      setError("Invalid plan or billing interval.")
      setLoading(false)
      return
    }

    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, interval }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setClientSecret(data.clientSecret)
        }
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to initialize checkout. Please try again.")
        setLoading(false)
      })
  }, [planId, interval, validPlan, validInterval])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="h-10 w-10 rounded-lg bg-primary/20 animate-pulse mb-4" />
        <p className="text-foreground-muted text-sm">
          Preparing checkout...
        </p>
      </div>
    )
  }

  if (error || !clientSecret) {
    return (
      <div className="text-center py-24">
        <p className="text-red-400 mb-6">{error ?? "Something went wrong."}</p>
        <GlassButton onClick={() => router.push("/pricing")}>
          Back to Pricing
        </GlassButton>
      </div>
    )
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#0DB1B2",
            colorBackground: "#0D1B2A",
            colorText: "#e2e8f0",
            colorTextSecondary: "#94a3b8",
            colorDanger: "#ef4444",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            borderRadius: "8px",
            spacingUnit: "4px",
          },
          rules: {
            ".Input": {
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "none",
            },
            ".Input:focus": {
              border: "1px solid rgba(13, 177, 178, 0.5)",
              boxShadow: "0 0 0 1px rgba(13, 177, 178, 0.3)",
            },
            ".Label": {
              color: "#94a3b8",
              fontSize: "13px",
              fontWeight: "500",
            },
            ".Tab": {
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            },
            ".Tab--selected": {
              backgroundColor: "rgba(13, 177, 178, 0.15)",
              border: "1px solid rgba(13, 177, 178, 0.3)",
            },
          },
        },
      }}
    >
      <CheckoutForm planId={planId} interval={interval} />
    </Elements>
  )
}

export default function CheckoutPage() {
  const router = useRouter()

  return (
    <PageWrapper>
      <div className="grain">
        <section className="py-16 md:py-24">
          <Container width="narrow">
            <button
              onClick={() => router.push("/pricing")}
              className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors mb-8 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to pricing
            </button>

            <h1 className="text-3xl font-bold text-foreground mb-2">
              Checkout
            </h1>
            <p className="text-foreground-muted mb-10">
              Complete your purchase to get started with OphidianAI.
            </p>

            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 animate-pulse mb-4" />
                  <p className="text-foreground-muted text-sm">Loading...</p>
                </div>
              }
            >
              <CheckoutContent />
            </Suspense>
          </Container>
        </section>
      </div>
    </PageWrapper>
  )
}
