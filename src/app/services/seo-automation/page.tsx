"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { AIProductHero } from "@/components/sections/AIProductHero";
import { ProductDemoSection } from "@/components/sections/ProductDemoSection";
import { CTABanner } from "@/components/sections/CTABanner";
import { SEODashboardMockup } from "@/components/mockups/SEODashboardMockup";

const product = {
  title: "SEO Automation",
  subtitle: "Get found on Google without spending hours on spreadsheets.",
  description:
    "AI-powered SEO that handles the technical work automatically. We run continuous audits, track your keyword rankings, optimize your content, and deliver monthly reports -- so you can focus on running your business while your search presence grows.",
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  ),
  features: [
    { title: "Technical SEO Audits", description: "Automated scans catch broken links, missing meta tags, slow pages, and crawl errors before they hurt your rankings." },
    { title: "Keyword Tracking", description: "Monitor your rankings for target keywords and see exactly how you stack up against local competitors." },
    { title: "Content Optimization", description: "AI analyzes your pages and suggests specific improvements to title tags, headings, and content structure." },
    { title: "Google Business Profile", description: "Keep your GBP listing optimized with regular updates, photo management, and review response guidance." },
    { title: "Competitor Monitoring", description: "Track what your competitors rank for and identify keyword gaps you can exploit." },
    { title: "Monthly Reports", description: "Clear, branded PDF reports showing ranking changes, traffic trends, and next steps -- no jargon." },
  ],
  howItWorks: [
    { step: "1", title: "Audit", description: "We run a comprehensive analysis of your current SEO health and identify the highest-impact opportunities." },
    { step: "2", title: "Optimize", description: "We implement fixes, optimize content, and set up tracking for your target keywords." },
    { step: "3", title: "Grow", description: "Ongoing monitoring and monthly optimization keep your rankings climbing. You get a report every month." },
  ],
  standalonePrice: { setup: "$400", monthly: "$299" },
  tierNudge: "SEO is included in every tier. Get it bundled with chatbot and content starting at $297/mo with Essentials.",
};

export default function SEOAutomationPage() {
  return (
    <PageWrapper>
      <AIProductHero product={product} />
      <ProductDemoSection
        eyebrow="See It in Action"
        headline="Real scores from a real client site"
        description="We don't just promise fast websites — we prove it. These are live Lighthouse scores from a site we built. Performance, accessibility, best practices, and SEO — all green across the board."
        mockup={<SEODashboardMockup />}
      />
      <CTABanner
        headline="Ready to climb the rankings?"
        subtitle="Start with a free SEO audit and see exactly where you stand."
        cta={{ label: "Request Free Audit", href: "/contact?service=seo_audit" }}
      />
    </PageWrapper>
  );
}
