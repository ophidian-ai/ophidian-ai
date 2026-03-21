import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { GlassButton } from "@/components/ui/glass-button";
import { GlowCard } from "@/components/ui/spotlight-card";

export interface AIProductFeature {
  title: string;
  description: string;
}

export interface AIProductPageData {
  title: string;
  subtitle: string;
  description: string;
  icon: ReactNode;
  features: AIProductFeature[];
  howItWorks: { step: string; title: string; description: string }[];
  standalonePrice: { setup?: string; monthly: string };
  tierNudge: string;
}

export function AIProductHero({ product }: { product: AIProductPageData }) {
  return (
    <div className="grain">
      {/* Hero */}
      <section className="py-24 md:py-32">
        <Container width="default">
          <div className="max-w-3xl mx-auto text-center animate-fade-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6 text-primary">
              {product.icon}
            </div>
            <Heading level={1} gradient className="mb-4">
              {product.title}
            </Heading>
            <Text variant="lead" className="mb-6">
              {product.subtitle}
            </Text>
            <Text variant="body" className="mb-8 max-w-2xl mx-auto">
              {product.description}
            </Text>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GlassButton size="lg" href="/contact?service=ai_growth">
                Book a Call
              </GlassButton>
              <GlassButton size="lg" href="/pricing">
                View All Plans
              </GlassButton>
            </div>
          </div>
        </Container>
      </section>

      {/* Features */}
      <section className="py-20 md:py-24">
        <Container width="default">
          <div className="mb-12 text-center">
            <Heading level={2} gradient>
              Key Features
            </Heading>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {product.features.map((feature, i) => (
              <GlowCard
                key={i}
                className="glass rounded-2xl border border-primary/10 p-8 animate-fade-up"
              >
                <Heading level={4} className="mb-2">
                  {feature.title}
                </Heading>
                <Text variant="small">{feature.description}</Text>
              </GlowCard>
            ))}
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-24">
        <Container width="default">
          <div className="mb-12 text-center">
            <Heading level={2} gradient>
              How It Works
            </Heading>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {product.howItWorks.map((step, i) => (
              <div key={i} className="text-center animate-fade-up">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-lg font-bold mb-4">
                  {step.step}
                </div>
                <Heading level={4} className="mb-2">
                  {step.title}
                </Heading>
                <Text variant="small">{step.description}</Text>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Standalone Pricing + Tier Nudge */}
      <section className="py-20 md:py-24">
        <Container width="narrow">
          <GlowCard className="glass rounded-2xl border border-primary/10 p-10 text-center">
            <Heading level={3} gradient className="mb-2">
              Standalone Pricing
            </Heading>
            <div className="flex items-baseline justify-center gap-2 mb-1">
              <span className="text-4xl font-bold text-foreground">
                {product.standalonePrice.monthly}
              </span>
              <span className="text-foreground-muted">/mo</span>
            </div>
            {product.standalonePrice.setup && (
              <Text variant="small" className="mb-4">
                {product.standalonePrice.setup} setup fee
              </Text>
            )}
            <div className="my-6 h-px bg-primary/10" />
            <Text variant="body" className="mb-6">
              {product.tierNudge}
            </Text>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GlassButton size="default" href="/contact?service=ai_standalone">
                Get This Product
              </GlassButton>
              <GlassButton size="default" href="/pricing">
                Compare Plans
              </GlassButton>
            </div>
          </GlowCard>
        </Container>
      </section>
    </div>
  );
}
