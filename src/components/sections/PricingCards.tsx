"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import NumberFlow from "@number-flow/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SparklesCore } from "@/components/ui/sparkles";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { GlassButton } from "@/components/ui/glass-button";
import { getPricing } from "@/app/actions/pricing";
import type { PricingCategory } from "@/lib/stripe-catalog";

/* ------------------------------------------------------------------ */
/*  Plan data per service category                                     */
/* ------------------------------------------------------------------ */

interface Plan {
  name: string;
  price: number;
  yearlyPrice?: number;
  oneTime?: boolean;
  description: string;
  features: string[];
  popular?: boolean;
}

interface ServiceCategory {
  label: string;
  recurring?: boolean;
  plans: Plan[];
}

// Type guard to check if we're using Stripe data or hardcoded
type AnyCategory = ServiceCategory | PricingCategory;

const CATEGORIES: ServiceCategory[] = [
  {
    label: "Websites",
    plans: [
      {
        name: "Landing Page",
        price: 1500,
        description: "A focused single-page site to capture leads and drive conversions.",
        features: [
          "Custom responsive design",
          "Mobile-first development",
          "Contact form integration",
          "SEO foundation",
          "Google Analytics setup",
          "14 days post-launch support",
        ],
      },
      {
        name: "Business Website",
        price: 2500,
        description: "A full multi-page website built to establish your digital presence.",
        features: [
          "Everything in Landing Page, plus:",
          "Up to 8 custom pages",
          "Content management system",
          "Blog or news section",
          "Performance optimization",
          "30 days post-launch support",
        ],
        popular: true,
      },
      {
        name: "Premium Build",
        price: 5000,
        description: "A bespoke site with advanced features, animations, and integrations.",
        features: [
          "Everything in Business, plus:",
          "Custom animations & interactions",
          "E-commerce or booking system",
          "Third-party API integrations",
          "Advanced SEO strategy",
          "60 days post-launch support",
        ],
      },
    ],
  },
  {
    label: "SEO",
    recurring: true,
    plans: [
      {
        name: "SEO Audit",
        price: 400,
        oneTime: true,
        description: "A comprehensive one-time audit with actionable recommendations.",
        features: [
          "Technical SEO analysis",
          "On-page optimization report",
          "Competitor benchmarking",
          "Keyword opportunity map",
          "Branded PDF report",
          "30-minute review call",
        ],
      },
      {
        name: "SEO Growth",
        price: 250,
        yearlyPrice: 2500,
        description: "Monthly optimization to steadily improve your search rankings.",
        features: [
          "Everything in Audit, plus:",
          "Monthly on-page updates",
          "Google Business Profile management",
          "Monthly performance reports",
          "Keyword tracking dashboard",
          "Priority support",
        ],
        popular: true,
      },
      {
        name: "SEO Domination",
        price: 500,
        yearlyPrice: 5000,
        description: "Aggressive growth strategy for businesses ready to own their market.",
        features: [
          "Everything in Growth, plus:",
          "Content strategy & creation",
          "Link building outreach",
          "Local SEO optimization",
          "Quarterly strategy reviews",
          "Dedicated SEO specialist",
        ],
      },
    ],
  },
  {
    label: "Social Media",
    recurring: true,
    plans: [
      {
        name: "Essentials",
        price: 250,
        yearlyPrice: 2500,
        description: "Consistent social presence without the time investment.",
        features: [
          "3 posts per week",
          "2 platforms managed",
          "Content calendar",
          "Basic analytics report",
          "Brand voice development",
          "Monthly review call",
        ],
      },
      {
        name: "Growth",
        price: 450,
        yearlyPrice: 4500,
        description: "Expanded reach with more content, more platforms, more engagement.",
        features: [
          "Everything in Essentials, plus:",
          "5 posts per week",
          "4 platforms managed",
          "Community management",
          "Monthly video content",
          "Detailed analytics dashboard",
        ],
        popular: true,
      },
      {
        name: "Pro",
        price: 700,
        yearlyPrice: 7000,
        description: "Full-service social media management for maximum impact.",
        features: [
          "Everything in Growth, plus:",
          "Daily posting",
          "All platforms managed",
          "Paid ad management",
          "Influencer outreach",
          "Weekly strategy calls",
        ],
      },
    ],
  },
  {
    label: "AI Growth",
    recurring: true,
    plans: [
      {
        name: "Essentials",
        price: 297,
        yearlyPrice: 2970,
        description: "AI chatbot, content creation, and SEO reporting to jumpstart your digital presence.",
        features: [
          "AI chatbot (website)",
          "4 blog posts + 12 social posts/mo",
          "Monthly SEO audit & report",
          "Monthly analytics PDF",
          "$500 setup fee",
        ],
      },
      {
        name: "Growth",
        price: 497,
        yearlyPrice: 4970,
        description: "Managed SEO, email campaigns, and review management to accelerate your business.",
        features: [
          "Everything in Essentials, plus:",
          "Advanced chatbot (website + 1 channel)",
          "8 blogs + 20 social posts/mo",
          "Managed SEO with optimization",
          "2 email campaigns/mo",
          "Review monitoring + AI responses",
          "Live analytics dashboard",
        ],
        popular: true,
      },
      {
        name: "Pro",
        price: 797,
        yearlyPrice: 7970,
        description: "Full-service AI growth with ads, CRM, and content strategy for maximum impact.",
        features: [
          "Everything in Growth, plus:",
          "Multi-channel chatbot",
          "12 blogs + 30 social + video scripts",
          "Full SEO + content strategy",
          "4 email campaigns + automations",
          "Review generation campaigns",
          "Google + Meta ad management",
          "CRM pipeline + lead scoring",
          "Dashboard + AI-written insights",
        ],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  PricingCards section                                                */
/* ------------------------------------------------------------------ */

export function PricingCards() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [activeTab, setActiveTab] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isYearly, setIsYearly] = useState(false);
  const [stripeCategories, setStripeCategories] = useState<PricingCategory[] | null>(null);

  // Fetch live pricing from Stripe
  useEffect(() => {
    getPricing().then((data) => {
      if (data.length > 0) setStripeCategories(data);
    });
  }, []);

  const handleTabChange = (newIndex: number) => {
    setDirection(newIndex > activeTab ? 1 : -1);
    setActiveTab(newIndex);
  };

  // Use Stripe data if loaded, otherwise fall back to hardcoded CATEGORIES
  const categories = stripeCategories ?? CATEGORIES;
  const currentCategory = categories[activeTab];
  const isRecurring = currentCategory.recurring ?? false;

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-forest py-24 lg:py-32"
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

      {/* radial glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-full max-w-[900px] rounded-full opacity-40"
        style={{
          background: "radial-gradient(ellipse at center, rgba(196,162,101,0.15) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* heading */}
        <div className="mb-12 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="mb-4 font-mono text-sm uppercase tracking-widest text-gold"
          >
            Pricing
          </motion.p>

          <h2 className="text-2xl sm:text-4xl font-bold text-text-light md:text-5xl">
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
            Transparent pricing. No hidden fees.
          </motion.p>
        </div>

        {/* tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map((cat, i) => (
            <button
              key={cat.label}
              onClick={() => handleTabChange(i)}
              className={cn(
                "relative px-6 py-2.5 rounded-full text-sm font-medium transition-colors",
                i === activeTab
                  ? "text-forest-deep"
                  : "text-text-muted hover:text-text-light"
              )}
            >
              {i === activeTab && (
                <motion.span
                  layoutId="pricing-tab"
                  className="absolute inset-0 rounded-full bg-gold"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{cat.label}</span>
            </button>
          ))}
        </motion.div>

        {/* monthly/yearly toggle for recurring services */}
        <AnimatePresence>
          {isRecurring && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center mb-10"
            >
              <div className="relative flex rounded-full bg-forest-deep border border-white/10 p-1">
                <button
                  type="button"
                  onClick={() => setIsYearly(false)}
                  className={cn(
                    "relative z-10 rounded-full px-6 py-2 text-sm font-medium transition-colors",
                    !isYearly ? "text-forest-deep" : "text-text-muted"
                  )}
                >
                  {!isYearly && (
                    <motion.span
                      layoutId="billing-toggle"
                      className="absolute inset-0 rounded-full bg-gold"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative">Monthly</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsYearly(true)}
                  className={cn(
                    "relative z-10 rounded-full px-6 py-2 text-sm font-medium transition-colors",
                    isYearly ? "text-forest-deep" : "text-text-muted"
                  )}
                >
                  {isYearly && (
                    <motion.span
                      layoutId="billing-toggle"
                      className="absolute inset-0 rounded-full bg-gold"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative">Yearly</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* cards with directional animation */}
        <div className="relative min-h-[520px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeTab}
              custom={direction}
              variants={{
                enter: (d: number) => ({ x: d * 300, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (d: number) => ({ x: d * -300, opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.25 },
              }}
              className="grid gap-8 md:grid-cols-3"
            >
              {currentCategory.plans.map((plan, index) => (
                <PricingCard
                  key={plan.name}
                  plan={plan}
                  index={index}
                  isRecurring={isRecurring}
                  isYearly={isYearly}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* footer note */}
        <p className="text-sm text-text-muted/60 mt-8 text-center">
          Prices vary depending on scope and complexity.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Individual pricing card                                            */
/* ------------------------------------------------------------------ */

interface PricingCardProps {
  plan: Plan;
  index: number;
  isRecurring: boolean;
  isYearly: boolean;
}

function PricingCard({ plan, index, isRecurring, isYearly }: PricingCardProps) {
  const isOneTime = plan.oneTime ?? false;
  const displayPrice = isRecurring && !isOneTime && isYearly && plan.yearlyPrice ? plan.yearlyPrice : plan.price;
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border p-8 transition-all duration-300",
        plan.popular
          ? "border-gold bg-forest-deep shadow-[0_0_40px_rgba(196,162,101,0.15)] scale-[1.02]"
          : "border-white/10 bg-forest-deep hover:border-gold/30"
      )}
    >
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-gold to-gold-light px-4 py-1 text-xs font-semibold uppercase tracking-wider text-forest-deep">
            Most Popular
          </span>
        </div>
      )}

      <h3 className="text-xl font-semibold text-text-light">{plan.name}</h3>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-sm text-text-muted">
          {isOneTime ? "One-time" : isRecurring ? (isYearly ? "Per year" : "Per month") : "Starting at"}
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-text-light">$</span>
        <span className="text-5xl font-bold text-text-light">
          <NumberFlow
            value={displayPrice}
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
        </span>
        {isRecurring && !isOneTime && (
          <span className="text-text-muted text-sm">/{isYearly ? "yr" : "mo"}</span>
        )}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-text-muted">
        {plan.description}
      </p>

      <div className="my-6 h-px bg-white/10" />

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

      <div className="mt-8">
        <GlassButton size="sm" href="#contact">
          Get Started
        </GlassButton>
      </div>

      {!plan.popular && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: "radial-gradient(ellipse at 50% 0%, rgba(196,162,101,0.06) 0%, transparent 70%)",
            }}
          />
        </div>
      )}
    </div>
  );
}
