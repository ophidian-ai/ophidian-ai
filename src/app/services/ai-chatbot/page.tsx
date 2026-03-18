"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { AIProductHero } from "@/components/sections/AIProductHero";
import { CTABanner } from "@/components/sections/CTABanner";

const product = {
  title: "AI Chatbot",
  subtitle: "A 24/7 sales rep and support agent that never takes a day off.",
  description:
    "Our AI chatbots are trained on your business data -- services, pricing, FAQs, policies -- so they answer like a member of your team. Embedded directly on your website, they capture leads, book appointments, and resolve customer questions instantly.",
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
    </svg>
  ),
  features: [
    { title: "Trained on Your Data", description: "We ingest your website, FAQs, menus, service lists, and policies so the chatbot speaks with authority about your business." },
    { title: "Lead Capture", description: "Collects visitor names, emails, and phone numbers in natural conversation -- no forms required." },
    { title: "Appointment Booking", description: "Integrates with your calendar to let customers book directly through the chat widget." },
    { title: "Multi-Channel", description: "Deploy on your website, Facebook Messenger, Instagram DMs, or SMS -- all from one system." },
    { title: "Handoff to Human", description: "When a question needs a real person, the bot seamlessly escalates with full conversation context." },
    { title: "Analytics Dashboard", description: "See conversation volume, common questions, lead capture rates, and customer satisfaction scores." },
  ],
  howItWorks: [
    { step: "1", title: "Onboard", description: "We collect your business info, FAQs, and service details to train the chatbot's knowledge base." },
    { step: "2", title: "Configure", description: "We customize the widget design, conversation flows, and integrations to match your brand." },
    { step: "3", title: "Launch", description: "We embed the chatbot on your site and monitor performance, refining responses as needed." },
  ],
  standalonePrice: { setup: "$500", monthly: "$149" },
  tierNudge: "Save over 50% by bundling with content and SEO in our Growth plan at $497/mo.",
};

export default function AIChatbotPage() {
  return (
    <PageWrapper>
      <AIProductHero product={product} />
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight">Try it now</h2>
        <p className="text-muted-foreground text-lg">
          Click the chat button in the bottom-right corner to see our AI chatbot in action.
        </p>
      </section>
      <CTABanner
        headline="Ready to add an AI chatbot?"
        subtitle="Book a free consultation and we will demo a chatbot trained on your business."
        cta={{ label: "Get Started", href: "/contact?service=ai_chatbot" }}
      />
    </PageWrapper>
  );
}
