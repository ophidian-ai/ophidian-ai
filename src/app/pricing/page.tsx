"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import PricingSection from "@/components/ui/pricing-section";

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

export default function PricingPage() {
  return (
    <PageWrapper>
      <div className="grain">
        <PricingSection
          onPlanSelect={() => {
            window.location.href = "/contact";
          }}
        />

        <FAQAccordion
          heading="Frequently Asked Questions"
          subtitle="Everything you need to know about working with us."
          items={faqItems}
        />
      </div>
    </PageWrapper>
  );
}
