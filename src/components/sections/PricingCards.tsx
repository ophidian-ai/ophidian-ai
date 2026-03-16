"use client";

import React, { useRef } from "react";
import { motion, useInView } from "motion/react";
import NumberFlow from "@number-flow/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SparklesCore } from "@/components/ui/sparkles";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";

/* ------------------------------------------------------------------ */
/*  Plan data                                                         */
/* ------------------------------------------------------------------ */

interface Plan {
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    name: "Starter Website",
    price: 2500,
    description:
      "Custom-built website for small businesses getting online for the first time.",
    features: [
      "Custom responsive design",
      "SEO foundation",
      "Mobile-first development",
      "Contact form integration",
      "Google Analytics setup",
      "30 days post-launch support",
    ],
  },
  {
    name: "Growth Package",
    price: 4500,
    description:
      "Full-service digital presence with SEO, social media, and ongoing optimization.",
    features: [
      "Everything in Starter, plus:",
      "Monthly SEO optimization",
      "Social media management",
      "Content strategy",
      "Performance monitoring",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "AI Integration",
    price: 8000,
    description:
      "Custom AI solutions, automation, and intelligent integrations for scaling businesses.",
    features: [
      "Everything in Growth, plus:",
      "Custom AI chatbot",
      "Workflow automation",
      "CRM integration",
      "Analytics dashboard",
      "Dedicated account manager",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  PricingCards section                                               */
/* ------------------------------------------------------------------ */

export function PricingCards() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-forest-deep py-24 lg:py-32"
    >
      {/* sparkles background */}
      <div className="pointer-events-none absolute inset-0 h-full w-full">
        <SparklesCore
          className="h-full w-full"
          color="#C4A265"
          density={1200}
          speed={0.6}
          size={1}
          opacity={0.4}
          direction="top"
        />
      </div>

      {/* radial glow behind cards */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[900px] rounded-full opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(196,162,101,0.15) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* heading */}
        <div className="mb-16 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="mb-4 font-mono text-sm uppercase tracking-widest text-gold"
          >
            Pricing
          </motion.p>

          <h2 className="text-4xl font-bold text-text-light md:text-5xl">
            {isInView && (
              <VerticalCutReveal
                splitBy="words"
                staggerDuration={0.08}
                containerClassName="justify-center"
              >
                Invest in your digital future
              </VerticalCutReveal>
            )}
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mx-auto mt-4 max-w-2xl text-text-muted"
          >
            Transparent project-based pricing. No hidden fees, no recurring
            lock-ins.
          </motion.p>
        </div>

        {/* cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Individual pricing card                                           */
/* ------------------------------------------------------------------ */

interface PricingCardProps {
  plan: Plan;
  index: number;
  isInView: boolean;
}

function PricingCard({ plan, index, isInView }: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: 0.2 + index * 0.15,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(
        "group relative flex flex-col rounded-2xl border p-8 transition-all duration-300",
        plan.popular
          ? "border-gold bg-forest shadow-[0_0_40px_rgba(196,162,101,0.15)] scale-[1.02]"
          : "border-white/10 bg-forest hover:border-gold/30"
      )}
    >
      {/* popular badge */}
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-gold to-gold-light px-4 py-1 text-xs font-semibold uppercase tracking-wider text-forest-deep">
            Most Popular
          </span>
        </div>
      )}

      {/* plan name */}
      <h3 className="text-xl font-semibold text-text-light">{plan.name}</h3>

      {/* price */}
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-sm text-text-muted">Starting at</span>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-text-light">$</span>
        <span className="text-5xl font-bold text-text-light">
          {isInView ? (
            <NumberFlow
              value={plan.price}
              format={{ useGrouping: true }}
              transformTiming={{
                duration: 750,
                easing: "cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              spinTiming={{
                duration: 750,
                easing: "cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          ) : (
            plan.price.toLocaleString()
          )}
        </span>
      </div>

      {/* description */}
      <p className="mt-4 text-sm leading-relaxed text-text-muted">
        {plan.description}
      </p>

      {/* divider */}
      <div className="my-6 h-px bg-white/10" />

      {/* features */}
      <ul className="flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <Check
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                plan.popular ? "text-gold" : "text-sage-accent"
              )}
            />
            <span className="text-text-light">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA button */}
      <a
        href="#contact"
        className={cn(
          "mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300",
          plan.popular
            ? "bg-gradient-to-r from-gold to-gold-light text-forest-deep hover:shadow-[0_0_24px_rgba(196,162,101,0.4)]"
            : "border border-white/10 text-text-light hover:border-gold/40 hover:text-gold"
        )}
      >
        Get Started
      </a>

      {/* hover glow for non-popular cards */}
      {!plan.popular && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(196,162,101,0.06) 0%, transparent 70%)",
            }}
          />
        </div>
      )}
    </motion.div>
  );
}
