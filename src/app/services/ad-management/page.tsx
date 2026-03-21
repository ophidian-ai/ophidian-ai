"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { AIProductHero } from "@/components/sections/AIProductHero";
import { CTABanner } from "@/components/sections/CTABanner";

const product = {
  title: "AI Ad Management",
  subtitle: "Smarter ads that spend less and convert more.",
  description:
    "AI-driven Google Ads and Meta Ads management that optimizes bidding, tests creative variations, and reallocates budget to your best-performing campaigns automatically. We handle the strategy, setup, and ongoing management -- you get more leads for less spend.",
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38a1.125 1.125 0 0 1-1.518-.47 16.19 16.19 0 0 1-.985-2.783m2.638-9.422c-.253-.962-.584-1.892-.985-2.783a1.128 1.128 0 0 1 .463-1.51l.657-.38c.55-.318 1.26-.134 1.518.47.424.94.777 1.916.985 2.783m-2.638 9.422H18a2.25 2.25 0 0 0 2.25-2.25V9a2.25 2.25 0 0 0-2.25-2.25h-5.66" />
    </svg>
  ),
  features: [
    { title: "Google Ads Management", description: "Search, display, and local service ads managed with AI-optimized bidding and keyword targeting." },
    { title: "Meta Ads Management", description: "Facebook and Instagram ad campaigns with AI-driven audience targeting and creative rotation." },
    { title: "Smart Bidding", description: "AI adjusts bids in real-time based on conversion probability, time of day, device, and audience signals." },
    { title: "Creative Testing", description: "Automated A/B testing of ad copy, images, and headlines to find what converts best." },
    { title: "Budget Optimization", description: "AI reallocates spend across campaigns and platforms based on performance, maximizing ROI." },
    { title: "Performance Dashboard", description: "Real-time reporting on spend, impressions, clicks, conversions, and cost per lead." },
  ],
  howItWorks: [
    { step: "1", title: "Strategy", description: "We analyze your market, competitors, and goals to build a targeted advertising strategy." },
    { step: "2", title: "Launch", description: "We set up campaigns, create ad creative, configure tracking, and launch across Google and Meta." },
    { step: "3", title: "Optimize", description: "AI continuously optimizes bidding, targeting, and creative. You get weekly performance updates." },
  ],
  standalonePrice: { setup: "$500", monthly: "$399" },
  tierNudge: "Ad management is included in our Pro plan at $797/mo -- bundled with every AI growth product we offer.",
};

export default function AdManagementPage() {
  return (
    <PageWrapper>
      <AIProductHero product={product} />
      <CTABanner
        headline="Ready to get more leads from your ad spend?"
        subtitle="Book a free consultation and we will audit your current campaigns."
        cta={{ label: "Book a Call", href: "/contact?service=ai_ads" }}
      />
    </PageWrapper>
  );
}
