"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { AIProductHero } from "@/components/sections/AIProductHero";
import { CTABanner } from "@/components/sections/CTABanner";

const product = {
  title: "AI Content Generation",
  subtitle: "Blog posts, social media, and email sequences that sound like you -- not a robot.",
  description:
    "We build a brand voice profile from your existing content, then generate blog posts, social media updates, and email sequences that match your tone and style. Every piece is reviewed for accuracy and optimized for engagement.",
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  ),
  features: [
    { title: "Brand Voice Profile", description: "We analyze your existing content to capture your tone, vocabulary, and style -- so every piece sounds authentically you." },
    { title: "Blog Posts", description: "SEO-optimized articles that establish authority, drive organic traffic, and give your audience a reason to keep coming back." },
    { title: "Social Media Content", description: "Platform-specific posts for Facebook, Instagram, TikTok, LinkedIn, and Google Business Profile with hashtags and visual direction." },
    { title: "Email Sequences", description: "Welcome series, promotional campaigns, and re-engagement sequences that nurture leads into customers." },
    { title: "Content Calendar", description: "A structured monthly publishing schedule so you always know what is going out and when." },
    { title: "Performance Tracking", description: "Monthly reports showing which content drives the most traffic, engagement, and conversions." },
  ],
  howItWorks: [
    { step: "1", title: "Onboard", description: "We study your brand, audience, and competitors to build your voice profile and content strategy." },
    { step: "2", title: "Create", description: "AI generates drafts based on your strategy. Our team reviews every piece for quality and accuracy." },
    { step: "3", title: "Publish", description: "Content goes live on your channels per the calendar. We track performance and refine the approach monthly." },
  ],
  standalonePrice: { monthly: "$149" },
  tierNudge: "Get 2x more content plus SEO and email marketing with our Growth plan at $497/mo.",
};

export default function ContentGenerationPage() {
  return (
    <PageWrapper>
      <AIProductHero product={product} />
      <CTABanner
        headline="Ready for consistent, quality content?"
        subtitle="Book a free consultation and we will outline a content strategy for your business."
        cta={{ label: "Book a Call", href: "/contact?service=ai_content" }}
      />
    </PageWrapper>
  );
}
