"use client";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card-shadcn";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { GlassButton } from "@/components/ui/glass-button";

interface PricingPlan {
  name: string;
  description: string;
  price: number;
  yearlyPrice: number;
  buttonText: string;
  buttonVariant: "outline" | "default";
  popular?: boolean;
  includes: string[];
}

interface PricingSectionProps {
  plans?: PricingPlan[];
  title?: string;
  subtitle?: string;
  onPlanSelect?: (plan: PricingPlan, interval: "monthly" | "yearly") => void;
}

const defaultPlans: PricingPlan[] = [
  {
    name: "Starter",
    description:
      "A polished, conversion-ready website to launch your online presence",
    price: 499,
    yearlyPrice: 4499,
    buttonText: "Get started",
    buttonVariant: "outline",
    includes: [
      "Starter includes:",
      "Custom 5-page website",
      "Mobile-responsive design",
      "SEO optimization",
      "Contact form integration",
      "1 round of revisions",
      "2-week delivery",
    ],
  },
  {
    name: "Growth",
    description:
      "Full-featured site with AI integrations to automate and scale",
    price: 1499,
    yearlyPrice: 13499,
    buttonText: "Get started",
    buttonVariant: "default",
    popular: true,
    includes: [
      "Everything in Starter, plus:",
      "Up to 10 pages",
      "AI chatbot integration",
      "CMS / blog setup",
      "Analytics dashboard",
      "E-commerce ready",
      "3 rounds of revisions",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    description:
      "Custom AI solutions and full-stack development for complex needs",
    price: 3999,
    yearlyPrice: 35999,
    buttonText: "Contact us",
    buttonVariant: "outline",
    includes: [
      "Everything in Growth, plus:",
      "Custom AI integrations",
      "API development",
      "Database architecture",
      "Dedicated project manager",
      "Unlimited revisions",
      "SLA guarantee",
      "Ongoing maintenance",
    ],
  },
];

const PricingSwitch = ({
  isYearly,
  onToggle,
}: {
  isYearly: boolean;
  onToggle: () => void;
}) => {
  return (
    <div className="flex justify-center">
      <div className="glass-button-wrap">
        <div className="relative flex w-fit rounded-full border border-[rgba(57,255,20,0.25)] bg-[linear-gradient(135deg,rgba(57,255,20,0.15)_0%,rgba(57,255,20,0.08)_50%,rgba(57,255,20,0.03)_100%)] backdrop-blur-[12px] p-1">
          <button
            onClick={() => { if (isYearly) onToggle(); }}
            className={cn(
              "relative z-10 w-fit h-10 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-all duration-300",
              !isYearly ? "text-[#0D1B2A]" : "text-[#39FF14]/60 hover:text-[#39FF14]"
            )}
          >
            <span className="relative z-10">Monthly</span>
          </button>

          <button
            onClick={() => { if (!isYearly) onToggle(); }}
            className={cn(
              "relative z-10 w-fit h-10 flex-shrink-0 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-all duration-300",
              isYearly ? "text-[#0D1B2A]" : "text-[#39FF14]/60 hover:text-[#39FF14]"
            )}
          >
            <span className="relative z-10">Yearly</span>
          </button>

          {/* Sliding indicator */}
          <motion.div
            className="absolute top-1 bottom-1 rounded-full bg-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.3)]"
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={{
              left: isYearly ? "50%" : "4px",
              right: isYearly ? "4px" : "50%",
            }}
          />
        </div>
        <div className="glass-button-shadow" />
      </div>
    </div>
  );
};

export default function PricingSection({
  plans = defaultPlans,
  title = "Plans that work best for your business",
  subtitle = "Trusted by growing businesses. Explore which option is right for you.",
  onPlanSelect,
}: PricingSectionProps) {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="relative py-20 overflow-x-hidden">
      <article className="text-center mb-10 max-w-3xl mx-auto space-y-4 relative z-10 px-4">
        <h2 className="text-4xl font-medium text-foreground">
          <VerticalCutReveal
            splitBy="words"
            staggerDuration={0.15}
            staggerFrom="first"
            reverse={true}
            containerClassName="justify-center"
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 40,
              delay: 0,
            }}
          >
            {title}
          </VerticalCutReveal>
        </h2>

        <p className="text-foreground-muted">{subtitle}</p>

        <PricingSwitch
          isYearly={isYearly}
          onToggle={() => setIsYearly((prev) => !prev)}
        />
      </article>

      <div className="grid md:grid-cols-3 max-w-5xl gap-6 py-6 mx-auto px-4 relative z-10 items-start justify-center">
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card
              className={`relative text-foreground border-primary/10 ${
                plan.popular
                  ? "glass shadow-[0px_-8px_60px_0px_rgba(57,255,20,0.3)] z-20 border-primary/30"
                  : "glass z-10"
              }`}
            >
              <CardHeader className="text-left">
                <div className="flex justify-between items-start">
                  <h3 className="text-3xl mb-2">{plan.name}</h3>
                  {plan.popular && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                      Popular
                    </span>
                  )}
                </div>
                <div className="flex items-baseline">
                  <span className="text-4xl font-semibold">$</span>
                  <NumberFlow
                    value={isYearly ? plan.yearlyPrice : plan.price}
                    className="text-4xl font-semibold"
                    transformTiming={{ duration: 500, easing: "ease-out" }}
                    spinTiming={{ duration: 500, easing: "ease-out" }}
                  />
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={isYearly ? "year" : "month"}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="text-foreground-muted ml-1"
                    >
                      /{isYearly ? "year" : "month"}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <p className="text-sm text-foreground-muted mb-4">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="pt-0">
                <GlassButton
                  size="lg"
                  onClick={() => onPlanSelect?.(plan, isYearly ? "yearly" : "monthly")}
                  className="w-full mb-6"
                >
                  {plan.buttonText}
                </GlassButton>

                <div className="space-y-3 pt-4 border-t border-primary/10">
                  <h4 className="font-medium text-base mb-3">
                    {plan.includes[0]}
                  </h4>
                  <ul className="space-y-2">
                    {plan.includes.slice(1).map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-2"
                      >
                        <span className="h-2.5 w-2.5 bg-primary/50 rounded-full flex-shrink-0" />
                        <span className="text-sm text-foreground-muted">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
