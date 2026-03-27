import type { Metadata } from "next";
import { PageWrapper } from "@/components/layout/PageWrapper";
import {
  ComparisonPageTemplate,
  type ComparisonPageData,
} from "@/components/sections/ComparisonPageTemplate";

export const metadata: Metadata = {
  title: "OphidianAI vs Squarespace: Which Is Right for Your Business?",
  description:
    "Compare OphidianAI custom websites with Squarespace templates. Performance, design flexibility, SEO, and pricing for small businesses.",
  alternates: {
    canonical: "/compare/ophidianai-vs-squarespace",
  },
};

const data: ComparisonPageData = {
  headline: "OphidianAI vs Squarespace",
  subtitle:
    "Beautiful templates vs a site built specifically for your business. Here's what actually matters.",
  intro:
    "Squarespace is known for polished, design-forward templates — and it deserves that reputation. For photographers, artists, and portfolio sites, Squarespace is a strong choice. But for small businesses that need their website to generate leads, rank on Google, and work as a real business tool, the template approach has limits. Here's how the two options compare.",
  columns: ["OphidianAI", "Squarespace"],
  highlightColumn: 0,
  rows: [
    {
      feature: "Page Load Speed",
      values: ["Under 1s (90+ Lighthouse)", "2-4s typical"],
    },
    {
      feature: "Mobile Performance",
      values: ["yes", "partial"],
    },
    {
      feature: "Design Approach",
      values: ["Custom design for your brand", "Choose from template library"],
    },
    {
      feature: "SEO Control",
      values: ["Full (meta, schema, sitemap, speed)", "Good basics, limited advanced"],
    },
    {
      feature: "AI-Powered Features",
      values: ["Chatbot, content engine, SEO automation", "Squarespace AI (text generation)"],
    },
    {
      feature: "Code Ownership",
      values: ["yes", "no"],
    },
    {
      feature: "Hosting Flexibility",
      values: ["Vercel, AWS, or self-host", "Squarespace servers only"],
    },
    {
      feature: "E-Commerce",
      values: ["Stripe integration, custom flows", "Built-in (Squarespace Commerce)"],
    },
    {
      feature: "Blogging",
      values: ["Full MDX blog with SEO optimization", "Built-in blog"],
    },
    {
      feature: "Third-Party Integrations",
      values: ["Unlimited (custom API connections)", "Limited to Squarespace extensions"],
    },
    {
      feature: "Upfront Cost",
      values: ["$1,500 - $5,000 (one-time)", "$0 (then monthly)"],
    },
    {
      feature: "Monthly Cost",
      values: ["$0 - $150 (optional maintenance)", "$16 - $52/mo (required)"],
    },
    {
      feature: "3-Year Total Cost",
      values: ["$2,500 - $10,400", "$576 - $1,872 + your time"],
    },
  ],
  options: [
    {
      label: "OphidianAI",
      pros: [
        "Exceptional page speed that directly improves SEO rankings",
        "Design is built around your brand, not adapted from a template",
        "Full code ownership — no platform lock-in",
        "AI business tools: chatbot, content engine, automated SEO",
        "Unlimited integrations with any API or service",
        "Dedicated human support from the people who built your site",
      ],
      cons: [
        "Higher upfront cost ($1,500+)",
        "Content updates require a developer or maintenance plan",
        "Longer initial build time (2-4 weeks)",
      ],
    },
    {
      label: "Squarespace",
      pros: [
        "Beautiful templates, especially for visual businesses",
        "Intuitive drag-and-drop editor",
        "Built-in e-commerce, scheduling, and email marketing",
        "Lower monthly cost for basic sites",
        "Good built-in blog and portfolio features",
      ],
      cons: [
        "Slower than custom-built sites (impacts SEO and conversions)",
        "Templates mean your site looks similar to thousands of others",
        "No code ownership — content is tied to Squarespace",
        "Limited advanced SEO (no custom schema markup, slow JS)",
        "Extension marketplace is smaller than competitors",
        "Monthly fees are required — no free tier for custom domains",
      ],
    },
  ],
  recommendations: [
    {
      label: "OphidianAI",
      reasons: [
        "You need your website to actively generate leads and customers",
        "Local SEO and Google rankings are a priority",
        "You want AI-powered tools — chatbots, content automation, SEO monitoring",
        "You need custom integrations beyond what templates offer",
        "You want to own your site and move it whenever you want",
        "You prefer a one-time investment over ongoing platform fees",
      ],
    },
    {
      label: "Squarespace",
      reasons: [
        "You're a photographer, artist, or creative who needs a polished portfolio",
        "You want to build and update the site yourself with a visual editor",
        "Your budget is under $500 total and you have time to DIY",
        "You need a simple site quickly and design quality matters most",
        "Your site is primarily a brochure, not a lead generation tool",
      ],
    },
  ],
  faqs: [
    {
      question: "Can I migrate from Squarespace to OphidianAI?",
      answer:
        "Yes. We handle the full migration — content, images, blog posts, and SEO redirects so your Google rankings carry over. Most migrations take 2-3 weeks alongside the new build.",
    },
    {
      question: "Squarespace templates look great. Why would I need custom design?",
      answer:
        "Squarespace templates are well-designed, but they're shared by thousands of sites. A custom design means your website reflects your specific brand, speaks directly to your customers, and stands out from competitors. For businesses where trust and differentiation matter, custom design has a real ROI.",
    },
    {
      question: "What about Squarespace's built-in email marketing?",
      answer:
        "Squarespace Email Campaigns is decent for basic newsletters. OphidianAI integrates with dedicated email platforms (Resend, Mailchimp, ConvertKit) and offers AI-generated email content as part of our Growth plans — more powerful and more flexible.",
    },
    {
      question: "Is OphidianAI more expensive in the long run?",
      answer:
        "It depends on the plan. Squarespace Business ($33/mo) costs $1,188 over 3 years. An OphidianAI Business Website ($2,500) with optional maintenance ($100/mo) costs $6,100 — but includes custom design, better performance, SEO optimization, and AI tools that Squarespace doesn't offer. The question isn't just cost — it's return on investment.",
    },
  ],
  metaDescription:
    "Compare OphidianAI custom websites with Squarespace templates. Performance, design flexibility, SEO, and pricing for small businesses.",
};

export default function OphidianAIvsSquarespacePage() {
  return (
    <PageWrapper>
      <ComparisonPageTemplate data={data} />
    </PageWrapper>
  );
}
