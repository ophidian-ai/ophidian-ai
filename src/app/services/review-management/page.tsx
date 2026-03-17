"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { AIProductHero } from "@/components/sections/AIProductHero";
import { CTABanner } from "@/components/sections/CTABanner";

const product = {
  title: "Review Management",
  subtitle: "Turn happy customers into five-star reviews on autopilot.",
  description:
    "Most happy customers never leave a review unless you ask. Our system monitors reviews across Google, Facebook, and Yelp, drafts professional AI responses, and runs campaigns to generate new reviews from your satisfied customers.",
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  ),
  features: [
    { title: "Multi-Platform Monitoring", description: "Track reviews across Google, Facebook, Yelp, and industry-specific platforms from a single dashboard." },
    { title: "AI Response Drafts", description: "Get professional, personalized response drafts for every review -- positive or negative -- in seconds." },
    { title: "Review Generation", description: "Automated SMS and email campaigns that ask satisfied customers to leave reviews at the right moment." },
    { title: "Sentiment Analysis", description: "AI flags negative trends early so you can address service issues before they become reputation problems." },
    { title: "Competitor Benchmarking", description: "See how your review scores and volume compare to local competitors." },
    { title: "Monthly Reports", description: "Review volume, average rating, response rate, and sentiment trends delivered monthly." },
  ],
  howItWorks: [
    { step: "1", title: "Connect", description: "We link your Google Business Profile, Facebook, and other review platforms to our monitoring system." },
    { step: "2", title: "Respond", description: "AI drafts responses for every review. You approve them or let them go out automatically." },
    { step: "3", title: "Generate", description: "We launch review request campaigns to your customer list, driving new reviews consistently." },
  ],
  standalonePrice: { monthly: "$249" },
  tierNudge: "Review management is included in our Growth plan at $497/mo -- bundled with chatbot, content, SEO, and email.",
};

export default function ReviewManagementPage() {
  return (
    <PageWrapper>
      <AIProductHero product={product} />
      <CTABanner
        headline="Ready to build a five-star reputation?"
        subtitle="Book a free consultation and we will audit your current review presence."
        cta={{ label: "Get Started", href: "/contact?service=ai_reviews" }}
      />
    </PageWrapper>
  );
}
