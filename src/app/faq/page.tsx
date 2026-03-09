"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { CTABanner } from "@/components/sections/CTABanner";
import { Container } from "@/components/ui/Container";
import { usePageContent } from "@/lib/use-page-content";
import { EditableText } from "@/components/editable/editable-text";
import { useEditMode } from "@/lib/edit-mode-context";

const defaultFaqItems = [
  { question: "What is an AI integration?", answer: "An AI integration connects intelligent software -- like language models, automation engines, or custom-trained AI -- directly into the tools and workflows your business already uses. Instead of switching to a new platform, we embed AI capabilities into your existing systems so your team can work faster, make better decisions, and eliminate repetitive tasks without changing how they operate day-to-day." },
  { question: "How long does a typical project take?", answer: "Most projects take between 2 and 6 weeks from kickoff to launch, depending on scope and complexity. A straightforward chatbot or single-workflow automation can be live in as little as two weeks. Larger integrations involving multiple systems, custom model training, or complex data pipelines typically fall in the 4-to-6-week range. We will give you a clear timeline during our initial consultation." },
  { question: "Do I need technical knowledge to work with you?", answer: "Not at all. We handle all of the technical work -- from architecture and development to deployment and training. All we need from you is a clear picture of your business processes, the problems you want solved, and access to the relevant tools and data. We will walk you through every decision in plain language and make sure your team is comfortable using everything we build." },
  { question: "What industries do you work with?", answer: "We work with small and mid-sized businesses across a range of industries, including professional services, e-commerce, healthcare, real estate, and local service businesses. AI and automation are not industry-specific -- if your team handles repetitive tasks, manages data across multiple systems, or needs faster customer response times, there is almost certainly an integration that can help." },
  { question: "How is OphidianAI different from other AI companies?", answer: "We focus exclusively on practical, revenue-generating AI integrations for small and mid-sized businesses. We are not building speculative research projects or selling generic SaaS tools. Every solution we deliver is custom-built for your specific workflows, plugged into the tools you already use, and designed to produce measurable results. We also operate on subscription-based pricing, which means you get continuous improvement and support -- not a one-time handoff." },
  { question: "What happens after my integration is live?", answer: "Launch is just the beginning. Every project includes hands-on training for your team so they are confident using the new tools from day one. After that, we provide ongoing support, monitoring, and optimization as part of your subscription. As your business evolves or new opportunities emerge, we iterate and improve your integrations to keep them performing at their best." },
  { question: "Can you work with my existing tools and software?", answer: "Yes. We specialize in meeting you where you are. Whether you use Salesforce, HubSpot, QuickBooks, Slack, Google Workspace, custom databases, or niche industry software -- we build integrations that connect to your current stack through APIs and automation platforms. The goal is to enhance what you already have, not replace it." },
];

export default function FAQPage() {
  const content = usePageContent("faq");
  const { isEditMode } = useEditMode();

  const resolvedFaqItems = defaultFaqItems.map((item, i) => ({
    question: content[`faq_${i + 1}_q`] || item.question,
    answer: content[`faq_${i + 1}_a`] || item.answer,
  }));

  return (
    <PageWrapper>
      <div className="grain">
        {isEditMode ? (
          <section className="py-24 md:py-32">
            <Container width="default">
              <div className="mb-16 max-w-2xl">
                <EditableText page="faq" contentKey="faq_heading" defaultValue="Common Questions" dbValue={content["faq_heading"]} as="h2" className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" />
                <EditableText page="faq" contentKey="faq_subtitle" defaultValue="If you do not see your question here, reach out and we will get you an answer." dbValue={content["faq_subtitle"]} as="p" className="mt-4 text-lg text-foreground-muted" />
              </div>
              <div className="space-y-6 max-w-3xl">
                {defaultFaqItems.map((item, i) => (
                  <div key={i} className="glass rounded-xl border border-primary/10 p-6">
                    <EditableText page="faq" contentKey={`faq_${i + 1}_q`} defaultValue={item.question} dbValue={content[`faq_${i + 1}_q`]} as="h3" className="text-lg font-semibold text-foreground mb-3" />
                    <EditableText page="faq" contentKey={`faq_${i + 1}_a`} defaultValue={item.answer} dbValue={content[`faq_${i + 1}_a`]} as="p" className="text-foreground-muted text-sm" />
                  </div>
                ))}
              </div>
            </Container>
          </section>
        ) : (
          <FAQAccordion
            heading={content["faq_heading"] || "Common Questions"}
            subtitle={content["faq_subtitle"] || "If you do not see your question here, reach out and we will get you an answer."}
            items={resolvedFaqItems}
          />
        )}

        {isEditMode ? (
          <section className="py-20 md:py-24 relative overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/5" />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
              <EditableText page="faq" contentKey="cta_headline" defaultValue="Still have questions?" dbValue={content["cta_headline"]} as="h2" className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4" />
              <EditableText page="faq" contentKey="cta_subtitle" defaultValue="We are happy to walk you through anything. No pressure, no sales pitch -- just a straightforward conversation about what AI can do for your business." dbValue={content["cta_subtitle"]} as="p" className="text-lg text-foreground-muted mb-8 max-w-xl mx-auto" />
            </div>
          </section>
        ) : (
          <CTABanner
            headline={content["cta_headline"] || "Still have questions?"}
            subtitle={content["cta_subtitle"] || "We are happy to walk you through anything. No pressure, no sales pitch -- just a straightforward conversation about what AI can do for your business."}
            cta={{ label: content["cta_label"] || "Contact Us", href: "/contact" }}
          />
        )}
      </div>
    </PageWrapper>
  );
}
