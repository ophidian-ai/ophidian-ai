"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { AIProductHero } from "@/components/sections/AIProductHero";
import { CTABanner } from "@/components/sections/CTABanner";

const product = {
  title: "AI Email Marketing",
  subtitle: "Personalized campaigns that land in inboxes, not spam folders.",
  description:
    "AI-driven email marketing that writes compelling copy, personalizes subject lines per recipient, optimizes send times for maximum open rates, and automates follow-up sequences. We handle the strategy and execution -- you watch the leads come in.",
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  ),
  features: [
    { title: "AI-Written Copy", description: "Campaign emails written in your brand voice with subject lines A/B tested for maximum open rates." },
    { title: "Automated Sequences", description: "Welcome series, abandoned cart, re-engagement, and post-purchase flows that run on autopilot." },
    { title: "Send-Time Optimization", description: "AI learns when each contact is most likely to open and schedules delivery accordingly." },
    { title: "List Segmentation", description: "Automatically segment your audience by behavior, purchase history, and engagement level." },
    { title: "Template Library", description: "Branded email templates designed for your business -- promotions, newsletters, announcements, and more." },
    { title: "Performance Analytics", description: "Open rates, click rates, conversions, and revenue attribution for every campaign." },
  ],
  howItWorks: [
    { step: "1", title: "Onboard", description: "We connect your email platform, import your contacts, and build your brand voice profile." },
    { step: "2", title: "Configure", description: "We set up automated sequences, design templates, and create your campaign calendar." },
    { step: "3", title: "Launch", description: "Campaigns go out on schedule. We monitor performance and optimize based on results." },
  ],
  standalonePrice: { setup: "$500", monthly: "$249" },
  tierNudge: "Email marketing is included in our Growth plan at $497/mo -- bundled with chatbot, content, SEO, and reviews.",
};

export default function EmailMarketingPage() {
  return (
    <PageWrapper>
      <AIProductHero product={product} />
      <CTABanner
        headline="Ready to turn your email list into revenue?"
        subtitle="Book a free consultation and we will map out your first campaign."
        cta={{ label: "Book a Call", href: "/contact?service=ai_email" }}
      />
    </PageWrapper>
  );
}
