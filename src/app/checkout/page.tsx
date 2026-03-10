"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Container } from "@/components/ui/Container";
import { GlassButton } from "@/components/ui/glass-button";
import { RETAINER_PLANS, type RetainerPlanId } from "@/lib/stripe-plans";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const planId = searchParams.get("plan") as RetainerPlanId | null;
  const plan = planId ? RETAINER_PLANS[planId] : null;

  useEffect(() => {
    if (!plan || !planId) {
      setError("Invalid plan selected.");
      return;
    }

    setRedirecting(true);

    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setRedirecting(false);
        } else if (data.url) {
          window.location.href = data.url;
        } else {
          setError("Failed to create checkout session.");
          setRedirecting(false);
        }
      })
      .catch(() => {
        setError("Failed to initialize checkout. Please try again.");
        setRedirecting(false);
      });
  }, [plan, planId]);

  if (error) {
    return (
      <div className="text-center py-24">
        <p className="text-red-400 mb-6">{error}</p>
        <Link href="/pricing">
          <GlassButton>Back to Pricing</GlassButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
      <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
      {plan && (
        <div className="text-center">
          <p className="text-foreground font-semibold text-lg mb-1">
            {plan.name}
          </p>
          <p className="text-foreground-muted text-sm mb-4">
            ${(plan.priceMonthly / 100).toFixed(0)}/mo
          </p>
        </div>
      )}
      <p className="text-foreground-muted text-sm">
        {redirecting ? "Redirecting to checkout..." : "Preparing checkout..."}
      </p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <PageWrapper>
      <div className="grain">
        <section className="py-16 md:py-24">
          <Container width="narrow">
            <Link
              href="/pricing"
              className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors mb-8 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to pricing
            </Link>

            <h1 className="text-3xl font-bold text-foreground mb-2">
              Checkout
            </h1>
            <p className="text-foreground-muted mb-10">
              Complete your purchase to get started with OphidianAI.
            </p>

            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center py-24">
                  <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
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
  );
}
