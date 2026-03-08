import { PageWrapper } from "@/components/layout";
import { HeroSimple, FAQAccordion, CTABanner } from "@/components/sections";
import { Container, Heading, Text, Button, Badge } from "@/components/ui";

/* ------------------------------------------------------------------
   Pricing Tier Data
   ------------------------------------------------------------------ */

type Tier = {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: { label: string; href: string; variant: "primary" | "cta" | "secondary" };
  popular?: boolean;
};

const tiers: Tier[] = [
  {
    name: "Starter",
    price: "$2,000",
    period: "/mo",
    description: "Small businesses starting with AI",
    features: [
      "1 AI integration",
      "20 hrs/mo support",
      "Basic monitoring",
      "Email support",
    ],
    cta: { label: "Get Started", href: "/contact", variant: "primary" },
  },
  {
    name: "Growth",
    price: "$3,500",
    period: "/mo",
    description: "Growing businesses scaling AI operations",
    features: [
      "Up to 3 integrations",
      "40 hrs/mo support",
      "Advanced monitoring",
      "Priority support",
      "Monthly strategy call",
    ],
    cta: { label: "Get Started", href: "/contact", variant: "cta" },
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Large organizations with complex needs",
    features: [
      "Unlimited integrations",
      "Dedicated engineer",
      "Custom SLAs",
      "24/7 support",
      "Quarterly business reviews",
    ],
    cta: { label: "Book a Call", href: "/contact", variant: "secondary" },
  },
];

/* ------------------------------------------------------------------
   Pricing Cards (inline component)
   ------------------------------------------------------------------ */

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5 shrink-0 text-primary"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PricingCard({ tier }: { tier: Tier }) {
  const isPopular = tier.popular;

  return (
    <div
      className={[
        "glass rounded-xl p-8 flex flex-col relative transition-all duration-300",
        isPopular
          ? "lg:scale-105 lg:-my-4 border-primary/40 shadow-glow animate-pulse-glow z-10"
          : "hover:-translate-y-1 hover:shadow-card-hover",
      ].join(" ")}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="accent">Most Popular</Badge>
        </div>
      )}

      {/* Tier name & description */}
      <div className="mb-6">
        <Heading level={3} className="text-foreground">
          {tier.name}
        </Heading>
        <Text variant="small" className="mt-2">
          Best for: {tier.description}
        </Text>
      </div>

      {/* Price */}
      <div className="mb-8">
        <span className="text-4xl font-bold text-foreground">{tier.price}</span>
        {tier.period && (
          <span className="text-foreground-muted text-lg">{tier.period}</span>
        )}
      </div>

      {/* Features */}
      <ul className="mb-10 flex-1 space-y-3">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <CheckIcon />
            <Text as="span" variant="body" className="leading-snug">
              {feature}
            </Text>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        variant={tier.cta.variant}
        size="lg"
        href={tier.cta.href}
        className="w-full justify-center"
      >
        {tier.cta.label}
      </Button>
    </div>
  );
}

function PricingCards() {
  return (
    <section className="py-16 md:py-20">
      <Container width="default">
        <div className="grid gap-8 lg:grid-cols-3 lg:items-center">
          {tiers.map((tier) => (
            <PricingCard key={tier.name} tier={tier} />
          ))}
        </div>

        <Text variant="small" className="mt-10 text-center">
          All plans include a 30-minute onboarding call. Usage beyond included
          hours billed at a pre-agreed hourly rate.
        </Text>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------
   FAQ Data
   ------------------------------------------------------------------ */

const faqItems = [
  {
    question: "What's included in the monthly retainer?",
    answer:
      "Your retainer covers a set number of support hours, active monitoring of your integrations, and access to our engineering team. It also includes routine maintenance, bug fixes, and minor enhancements to keep your AI systems running at peak performance.",
  },
  {
    question: "How does usage-based billing work?",
    answer:
      "Each plan includes a block of support hours per month. If your needs exceed that block, additional hours are billed at a pre-agreed hourly rate -- no surprises. We provide transparent usage reports so you always know where you stand.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Absolutely. You can upgrade or downgrade at the start of any billing cycle. If your needs grow beyond the Growth tier, we will work with you to build a custom Enterprise package that fits.",
  },
  {
    question: "What happens if I need to cancel?",
    answer:
      "We operate on a month-to-month basis with no long-term lock-in. Cancel anytime with 30 days notice. We will ensure a clean handoff of all code, documentation, and credentials so your integrations keep running.",
  },
  {
    question: "Do you offer a free trial?",
    answer:
      "We don't offer a traditional free trial, but every engagement starts with a free 30-minute discovery call. We will audit your workflows, identify the highest-impact AI opportunities, and outline a concrete plan -- no commitment required.",
  },
];

/* ------------------------------------------------------------------
   Page
   ------------------------------------------------------------------ */

export default function PricingPage() {
  return (
    <PageWrapper>
      <div className="grain">
        <HeroSimple
          title="Simple, Transparent Pricing"
          subtitle="Predictable retainers. No hidden fees. Scale up when you're ready."
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Pricing", href: "/pricing" },
          ]}
        />

        <PricingCards />

        <FAQAccordion
          heading="Frequently Asked Questions"
          subtitle="Everything you need to know about working with us."
          items={faqItems}
        />

        <CTABanner
          headline="Not sure which plan fits?"
          subtitle="Book a free discovery call and we will map out the right solution for your business in 30 minutes."
          cta={{ label: "Book a Free Call", href: "/contact" }}
        />
      </div>
    </PageWrapper>
  );
}
