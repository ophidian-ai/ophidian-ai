import type { Metadata } from "next";
import { PageWrapper } from "@/components/layout/PageWrapper";
import {
  ComparisonPageTemplate,
  type ComparisonPageData,
} from "@/components/sections/ComparisonPageTemplate";

export const metadata: Metadata = {
  title: "OphidianAI vs Wix: Which Is Right for Your Business?",
  description:
    "An honest comparison of OphidianAI custom websites vs Wix. See how performance, SEO, customization, and total cost stack up for small businesses.",
  alternates: {
    canonical: "/compare/ophidianai-vs-wix",
  },
};

const data: ComparisonPageData = {
  headline: "OphidianAI vs Wix",
  subtitle:
    "Custom-built performance vs drag-and-drop convenience. Here's how they compare for small businesses.",
  intro:
    "Wix is one of the most popular website builders in the world, and for good reason — it's approachable, affordable upfront, and lets anyone drag-and-drop a site together in a weekend. But approachable and optimal are different things. If your website is a core business tool (not just a digital business card), the differences between a Wix site and a custom-built site start to matter. Here's an honest breakdown.",
  columns: ["OphidianAI", "Wix"],
  highlightColumn: 0,
  rows: [
    {
      feature: "Page Load Speed",
      values: ["Under 1s (90+ Lighthouse)", "2-5s typical"],
    },
    {
      feature: "Mobile Performance",
      values: ["yes", "partial"],
    },
    {
      feature: "Custom Design",
      values: ["Fully custom, no templates", "Template-based with editor"],
    },
    {
      feature: "SEO Control",
      values: ["Full (meta, schema, sitemap, speed)", "Basic (meta tags, limited schema)"],
    },
    {
      feature: "AI-Powered Features",
      values: ["Chatbot, content engine, SEO automation", "Wix ADI (basic site builder)"],
    },
    {
      feature: "Code Ownership",
      values: ["yes", "no"],
    },
    {
      feature: "Hosting Flexibility",
      values: ["Vercel, AWS, or self-host", "Wix servers only"],
    },
    {
      feature: "E-Commerce",
      values: ["Stripe integration, custom flows", "Built-in (Wix Stores)"],
    },
    {
      feature: "Ongoing Support",
      values: ["Dedicated team, direct access", "Help center + community forums"],
    },
    {
      feature: "Upfront Cost",
      values: ["$1,500 - $5,000 (one-time)", "$0 - $200 (then monthly)"],
    },
    {
      feature: "Monthly Cost",
      values: ["$0 - $150 (optional maintenance)", "$17 - $159/mo (required)"],
    },
    {
      feature: "3-Year Total Cost",
      values: ["$2,500 - $10,400", "$612 - $5,724 + your time"],
    },
  ],
  options: [
    {
      label: "OphidianAI",
      pros: [
        "Lightning-fast load times that improve SEO and conversions",
        "Fully custom design — your site looks like nobody else's",
        "You own the code; take it anywhere, anytime",
        "Built-in AI tools: chatbot, content engine, SEO automation",
        "Dedicated support from the team that built your site",
        "No monthly platform fees — just optional maintenance",
      ],
      cons: [
        "Higher upfront investment ($1,500+)",
        "Changes require a developer (or our maintenance plan)",
        "2-4 week build time vs same-day with Wix",
      ],
    },
    {
      label: "Wix",
      pros: [
        "Low upfront cost — free plan available",
        "Drag-and-drop editor anyone can use",
        "Large template library for quick starts",
        "Built-in e-commerce, booking, and forms",
        "Make simple changes yourself without a developer",
      ],
      cons: [
        "Slower page speeds hurt SEO and mobile experience",
        "Template-based designs often look generic",
        "You don't own your code — locked into Wix platform",
        "Limited SEO tools (no custom schema, limited speed control)",
        "Wix branding on free and lower-tier plans",
        "Monthly fees add up: $17-$159/mo forever",
      ],
    },
  ],
  recommendations: [
    {
      label: "OphidianAI",
      reasons: [
        "Your website needs to generate leads or drive revenue",
        "You care about Google rankings and local SEO",
        "You want a site that's fast, unique, and built for your business",
        "You'd rather invest once than pay monthly platform fees",
        "You want AI tools like chatbots and automated content",
        "You want to own your website and hosting",
      ],
    },
    {
      label: "Wix",
      reasons: [
        "You need a basic informational site as soon as possible",
        "Your budget is under $500 total",
        "You want to make frequent text and image edits yourself",
        "You don't rely on your website for new business",
        "You're testing an idea and need a quick landing page",
      ],
    },
  ],
  faqs: [
    {
      question: "Can I switch from Wix to OphidianAI later?",
      answer:
        "Yes. We regularly help businesses migrate from Wix to custom-built sites. Your content and images transfer over; we handle the technical work and make sure your SEO rankings aren't disrupted during the move.",
    },
    {
      question: "Is Wix really slower than a custom site?",
      answer:
        "In most cases, yes. Wix loads its own JavaScript framework, analytics, and editor code on every page. Our sites are built on Next.js and deployed to Vercel's edge network, which typically delivers Lighthouse performance scores of 90+ compared to Wix's average of 50-70.",
    },
    {
      question: "What about Wix's AI features?",
      answer:
        "Wix ADI can generate a basic site layout from a questionnaire. OphidianAI's AI goes much further: a chatbot that answers customer questions 24/7, an AI content engine that writes blog posts and social media content, and automated SEO monitoring. These are production business tools, not just a site builder.",
    },
    {
      question: "How does the total cost compare over 3 years?",
      answer:
        "A Wix Business plan ($36/mo) costs $1,296 over 3 years — plus your time building and maintaining it. An OphidianAI Business Website ($2,500 one-time) with optional maintenance ($100/mo) costs $6,100 total — but you get a faster, custom site with better SEO and zero DIY time investment.",
    },
  ],
  metaDescription:
    "An honest comparison of OphidianAI custom websites vs Wix. See how performance, SEO, customization, and total cost stack up for small businesses.",
};

export default function OphidianAIvsWixPage() {
  return (
    <PageWrapper>
      <ComparisonPageTemplate data={data} />
    </PageWrapper>
  );
}
