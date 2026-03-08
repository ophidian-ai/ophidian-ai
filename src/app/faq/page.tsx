import { PageWrapper } from "@/components/layout/PageWrapper";
import { HeroSimple } from "@/components/sections/HeroSimple";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { CTABanner } from "@/components/sections/CTABanner";

const faqItems = [
  {
    question: "What is an AI integration?",
    answer:
      "An AI integration connects intelligent software -- like language models, automation engines, or custom-trained AI -- directly into the tools and workflows your business already uses. Instead of switching to a new platform, we embed AI capabilities into your existing systems so your team can work faster, make better decisions, and eliminate repetitive tasks without changing how they operate day-to-day.",
  },
  {
    question: "How long does a typical project take?",
    answer:
      "Most projects take between 2 and 6 weeks from kickoff to launch, depending on scope and complexity. A straightforward chatbot or single-workflow automation can be live in as little as two weeks. Larger integrations involving multiple systems, custom model training, or complex data pipelines typically fall in the 4-to-6-week range. We will give you a clear timeline during our initial consultation.",
  },
  {
    question: "Do I need technical knowledge to work with you?",
    answer:
      "Not at all. We handle all of the technical work -- from architecture and development to deployment and training. All we need from you is a clear picture of your business processes, the problems you want solved, and access to the relevant tools and data. We will walk you through every decision in plain language and make sure your team is comfortable using everything we build.",
  },
  {
    question: "What industries do you work with?",
    answer:
      "We work with small and mid-sized businesses across a range of industries, including professional services, e-commerce, healthcare, real estate, and local service businesses. AI and automation are not industry-specific -- if your team handles repetitive tasks, manages data across multiple systems, or needs faster customer response times, there is almost certainly an integration that can help.",
  },
  {
    question: "How is OphidianAI different from other AI companies?",
    answer:
      "We focus exclusively on practical, revenue-generating AI integrations for small and mid-sized businesses. We are not building speculative research projects or selling generic SaaS tools. Every solution we deliver is custom-built for your specific workflows, plugged into the tools you already use, and designed to produce measurable results. We also operate on subscription-based pricing, which means you get continuous improvement and support -- not a one-time handoff.",
  },
  {
    question: "What happens after my integration is live?",
    answer:
      "Launch is just the beginning. Every project includes hands-on training for your team so they are confident using the new tools from day one. After that, we provide ongoing support, monitoring, and optimization as part of your subscription. As your business evolves or new opportunities emerge, we iterate and improve your integrations to keep them performing at their best.",
  },
  {
    question: "Can you work with my existing tools and software?",
    answer:
      "Yes. We specialize in meeting you where you are. Whether you use Salesforce, HubSpot, QuickBooks, Slack, Google Workspace, custom databases, or niche industry software -- we build integrations that connect to your current stack through APIs and automation platforms. The goal is to enhance what you already have, not replace it.",
  },
];

export default function FAQPage() {
  return (
    <PageWrapper>
      <div className="grain">
        <HeroSimple
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about working with OphidianAI."
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "FAQ", href: "/faq" },
          ]}
        />

        <FAQAccordion
          heading="Common Questions"
          subtitle="If you do not see your question here, reach out and we will get you an answer."
          items={faqItems}
        />

        <CTABanner
          headline="Still have questions?"
          subtitle="We are happy to walk you through anything. No pressure, no sales pitch -- just a straightforward conversation about what AI can do for your business."
          cta={{ label: "Contact Us", href: "/contact" }}
        />
      </div>
    </PageWrapper>
  );
}
