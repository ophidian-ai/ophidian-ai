"use client";

import { useRouter } from "next/navigation";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import PricingSection from "@/components/ui/pricing-section";
import { Container } from "@/components/ui/Container";
import { usePageContent } from "@/lib/use-page-content";
import { EditableText } from "@/components/editable/editable-text";
import { useEditMode } from "@/lib/edit-mode-context";

const defaultFaqItems = [
  { question: "What's included in the monthly retainer?", answer: "Your retainer covers a set number of support hours, active monitoring of your integrations, and access to our engineering team. It also includes routine maintenance, bug fixes, and minor enhancements to keep your AI systems running at peak performance." },
  { question: "How does usage-based billing work?", answer: "Each plan includes a block of support hours per month. If your needs exceed that block, additional hours are billed at a pre-agreed hourly rate -- no surprises. We provide transparent usage reports so you always know where you stand." },
  { question: "Can I change plans later?", answer: "Absolutely. You can upgrade or downgrade at the start of any billing cycle. If your needs grow beyond the Growth tier, we will work with you to build a custom Enterprise package that fits." },
  { question: "What happens if I need to cancel?", answer: "We operate on a month-to-month basis with no long-term lock-in. Cancel anytime with 30 days notice. We will ensure a clean handoff of all code, documentation, and credentials so your integrations keep running." },
  { question: "Do you offer a free trial?", answer: "We don't offer a traditional free trial, but every engagement starts with a free 30-minute discovery call. We will audit your workflows, identify the highest-impact AI opportunities, and outline a concrete plan -- no commitment required." },
];

export default function PricingPage() {
  const content = usePageContent("pricing");
  const { isEditMode } = useEditMode();
  const router = useRouter();

  const resolvedFaqItems = defaultFaqItems.map((item, i) => ({
    question: content[`pricing_faq_${i + 1}_q`] || item.question,
    answer: content[`pricing_faq_${i + 1}_a`] || item.answer,
  }));

  return (
    <PageWrapper>
      <div className="grain">
        <PricingSection onPlanSelect={(plan, interval) => {
          const planId = plan.name.toLowerCase();
          if (planId === "enterprise") {
            router.push("/contact");
          } else {
            router.push(`/checkout?plan=${planId}&interval=${interval}`);
          }
        }} />

        {isEditMode ? (
          <section className="py-24 md:py-32">
            <Container width="default">
              <div className="mb-16 max-w-2xl">
                <EditableText page="pricing" contentKey="pricing_faq_heading" defaultValue="Frequently Asked Questions" dbValue={content["pricing_faq_heading"]} as="h2" className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" />
                <EditableText page="pricing" contentKey="pricing_faq_subtitle" defaultValue="Everything you need to know about working with us." dbValue={content["pricing_faq_subtitle"]} as="p" className="mt-4 text-lg text-foreground-muted" />
              </div>
              <div className="space-y-6 max-w-3xl">
                {defaultFaqItems.map((item, i) => (
                  <div key={i} className="glass rounded-xl border border-primary/10 p-6">
                    <EditableText page="pricing" contentKey={`pricing_faq_${i + 1}_q`} defaultValue={item.question} dbValue={content[`pricing_faq_${i + 1}_q`]} as="h3" className="text-lg font-semibold text-foreground mb-3" />
                    <EditableText page="pricing" contentKey={`pricing_faq_${i + 1}_a`} defaultValue={item.answer} dbValue={content[`pricing_faq_${i + 1}_a`]} as="p" className="text-foreground-muted text-sm" />
                  </div>
                ))}
              </div>
            </Container>
          </section>
        ) : (
          <FAQAccordion
            heading={content["pricing_faq_heading"] || "Frequently Asked Questions"}
            subtitle={content["pricing_faq_subtitle"] || "Everything you need to know about working with us."}
            items={resolvedFaqItems}
          />
        )}
      </div>
    </PageWrapper>
  );
}
