import type { Metadata } from "next";
import { PageWrapper } from "@/components/layout/PageWrapper";
import {
  ComparisonPageTemplate,
  type ComparisonPageData,
} from "@/components/sections/ComparisonPageTemplate";

export const metadata: Metadata = {
  title:
    "Agency vs Freelancer vs DIY: A Small Business Website Guide",
  description:
    "Should you hire an agency, a freelancer, or build your small business website yourself? Honest comparison of cost, timeline, quality, and ongoing support.",
  alternates: {
    canonical: "/compare/agency-vs-freelancer-vs-diy",
  },
};

const data: ComparisonPageData = {
  headline: "Agency vs Freelancer vs DIY",
  subtitle:
    "Three ways to get a website. Here's what each one actually costs, delivers, and requires from you.",
  intro:
    "Every small business owner eventually faces this decision: hire an agency, find a freelancer, or build it yourself with Wix, Squarespace, or WordPress. Each path has real trade-offs. Some people overspend on an agency when a freelancer would do. Others waste months on DIY only to start over with a professional. This guide gives you the real numbers so you can make the right call for your business.",
  columns: ["Agency (OphidianAI)", "Freelancer", "DIY (Wix/Squarespace)"],
  highlightColumn: 0,
  rows: [
    {
      feature: "Upfront Cost",
      values: ["$1,500 - $5,000", "$500 - $3,000", "$0 - $200"],
    },
    {
      feature: "Monthly Cost",
      values: [
        "$0 - $150 (optional)",
        "$0 - $100 (if available)",
        "$16 - $160 (required)",
      ],
    },
    {
      feature: "Timeline",
      values: ["1-4 weeks", "2-8 weeks", "1-4 weeks (your time)"],
    },
    {
      feature: "Design Quality",
      values: ["Professional, custom", "Varies widely", "Template-based"],
    },
    {
      feature: "Page Speed (Lighthouse)",
      values: ["90+", "60-95 (varies)", "40-70 typical"],
    },
    {
      feature: "SEO Setup",
      values: ["yes", "partial", "partial"],
    },
    {
      feature: "Mobile Optimization",
      values: ["yes", "partial", "partial"],
    },
    {
      feature: "AI Features (Chatbot, Content)",
      values: ["yes", "no", "no"],
    },
    {
      feature: "Ongoing Support",
      values: [
        "Dedicated team, guaranteed",
        "Depends on availability",
        "Help center + forums",
      ],
    },
    {
      feature: "Code Ownership",
      values: ["yes", "Usually (check contract)", "no"],
    },
    {
      feature: "Revision Rounds",
      values: ["Unlimited (Professional+)", "1-3 typical", "Unlimited (DIY)"],
    },
    {
      feature: "Your Time Investment",
      values: ["Low (we handle it)", "Medium (you manage the project)", "High (you build everything)"],
    },
    {
      feature: "3-Year Total Cost",
      values: [
        "$2,500 - $10,400",
        "$500 - $6,600",
        "$576 - $5,760 + 50-200 hrs",
      ],
    },
  ],
  options: [
    {
      label: "Agency (OphidianAI)",
      pros: [
        "Consistent quality — process-driven, not person-dependent",
        "Full service: design, development, SEO, AI tools, and support",
        "Transparent pricing published on the website",
        "Ongoing maintenance and support from the team that built it",
        "AI-powered extras: chatbot, content generation, SEO automation",
        "Code ownership — take your site anywhere",
      ],
      cons: [
        "Higher upfront cost than freelancers or DIY",
        "May be more than you need for a simple brochure site",
        "Build time is 1-4 weeks (not same-day)",
      ],
    },
    {
      label: "Freelancer",
      pros: [
        "Often less expensive than an agency",
        "Direct communication with the person doing the work",
        "Can find specialists for specific technologies",
        "More flexible on scope and process",
        "Good freelancers produce excellent work",
      ],
      cons: [
        "Quality varies enormously — vetting takes time",
        "Single point of failure (vacation, illness, disappearing)",
        "No guaranteed ongoing support after launch",
        "Project management falls on you",
        "Scope creep and timeline delays are common",
        "May not include SEO, performance tuning, or mobile optimization",
      ],
    },
    {
      label: "DIY (Wix/Squarespace)",
      pros: [
        "Lowest upfront cost — start for free",
        "Full control over edits and timeline",
        "Large template libraries to choose from",
        "Built-in e-commerce and booking tools",
        "No dependency on anyone else's schedule",
      ],
      cons: [
        "Your time has a cost (50-200+ hours for a good site)",
        "Template designs look like thousands of other sites",
        "Slower page speeds hurt SEO and conversions",
        "Limited SEO tools and no custom optimization",
        "No code ownership — locked into the platform",
        "You handle all troubleshooting and updates yourself",
        "Monthly platform fees are required and never stop",
      ],
    },
  ],
  recommendations: [
    {
      label: "an Agency (like OphidianAI)",
      reasons: [
        "Your website needs to generate leads and revenue",
        "You want everything handled — design, development, SEO, and support",
        "Speed and search rankings are important to your business",
        "You want AI tools like chatbots and automated content",
        "You value predictable pricing and guaranteed timelines",
        "Your time is better spent running your business, not building a website",
      ],
    },
    {
      label: "a Freelancer",
      reasons: [
        "You have a specific technical need (e.g., a custom WordPress plugin)",
        "Your budget is limited but you want custom work",
        "You've found a freelancer with strong portfolio and references",
        "You're comfortable project-managing the work yourself",
        "You need a one-time project and don't need ongoing support",
      ],
    },
    {
      label: "DIY",
      reasons: [
        "Your total budget is under $500",
        "You enjoy building websites and have the time",
        "You need something live this week, not this month",
        "Your website is a simple brochure — not a lead generation tool",
        "You're testing a business idea before investing in a custom site",
      ],
    },
  ],
  faqs: [
    {
      question: "Aren't agencies too expensive for small businesses?",
      answer:
        "That used to be true. Traditional agencies charge $10,000-$50,000+ for a website. OphidianAI is built specifically for small businesses — our sites start at $1,500 with transparent pricing published on our website. No surprise invoices, no hourly billing that spirals.",
    },
    {
      question: "How do I vet a freelancer?",
      answer:
        "Ask for 3+ portfolio links to live sites (not mockups). Check page speed on those sites using Google PageSpeed Insights. Ask about their process for SEO, mobile optimization, and post-launch support. Get a detailed scope of work in writing before paying anything. If they can't answer these questions clearly, keep looking.",
    },
    {
      question: "Can I start with DIY and upgrade to OphidianAI later?",
      answer:
        "Absolutely. Many of our clients started with Wix or Squarespace, outgrew it, and moved to a custom site. We handle the full migration — content, images, blog posts, and SEO redirects — so you don't lose any Google rankings in the process.",
    },
    {
      question: "What does 'code ownership' actually mean?",
      answer:
        "It means you own the source code of your website. With OphidianAI, you can download your entire site, host it anywhere, or hire any developer to modify it. With Wix or Squarespace, your site only exists on their platform — if you leave, you start over from scratch.",
    },
    {
      question: "What if I just need a landing page?",
      answer:
        "Our Landing Page package starts at $1,500 and includes custom responsive design, mobile optimization, contact form, SEO setup, and 14 days of post-launch support. It's a one-time cost with no monthly fees. For a single page, that's often comparable to 2-3 years of Squarespace subscription — and you get a faster, custom-designed result.",
    },
  ],
  metaDescription:
    "Should you hire an agency, a freelancer, or build your small business website yourself? Honest comparison of cost, timeline, quality, and ongoing support.",
};

export default function AgencyVsFreelancerVsDIYPage() {
  return (
    <PageWrapper>
      <ComparisonPageTemplate data={data} />
    </PageWrapper>
  );
}
