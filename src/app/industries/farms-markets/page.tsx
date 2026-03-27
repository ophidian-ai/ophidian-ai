import type { Metadata } from "next";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { IndustryPageTemplate } from "@/components/sections/IndustryPageTemplate";
import type { IndustryPageData } from "@/components/sections/IndustryPageTemplate";

export const metadata: Metadata = {
  title: "Websites for Farms & Local Markets | OphidianAI",
  description:
    "Beautiful farm and market websites with online ordering, seasonal promotions, and social media content that drives traffic to your stand.",
  keywords: [
    "farm website",
    "farmers market website",
    "local market website Indiana",
    "farm e-commerce",
    "farm marketing",
    "farm stand website",
  ],
};

const iconSun = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
  </svg>
);

const iconCart = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
  </svg>
);

const iconMegaphone = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
  </svg>
);

const iconClock = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const data: IndustryPageData = {
  industry: "Farms & Markets",
  headline: "Websites for Farms & Local Markets",
  subtitle: "Bring the farm stand online and grow year-round.",
  intro:
    "Your business is seasonal, but your online presence shouldn't be. A great website lets customers find you during peak season, place orders ahead of time, and stay connected with your farm even in the off-months. We build farm and market websites that are as fresh and inviting as your produce.",
  contactParam: "farm",
  metaDescription:
    "Beautiful farm and market websites with online ordering, seasonal promotions, and social media content that drives traffic to your stand.",
  painPoints: [
    {
      problem: "Customers don't know when you're open or what's in season",
      solution:
        "A dynamic homepage that highlights what's available right now, your hours, and upcoming market dates. Customers always know when and where to find you.",
      icon: iconSun,
    },
    {
      problem: "You're missing out on online orders and pre-orders",
      solution:
        "We add an e-commerce layer to your site so customers can order produce boxes, baked goods, or seasonal specials online and pick them up at the farm or market.",
      icon: iconCart,
    },
    {
      problem: "You only get traffic during farmers market season",
      solution:
        "A content strategy with blog posts, email newsletters, and social media keeps your audience engaged year-round -- CSA signups in winter, planting updates in spring, harvest features in summer.",
      icon: iconMegaphone,
    },
    {
      problem: "You spend all your time farming and none on marketing",
      solution:
        "Our AI Content Engine generates social media posts, email campaigns, and seasonal promotions automatically. You approve the content -- we handle everything else.",
      icon: iconClock,
    },
  ],
  services: [
    {
      title: "Farm & Market Website",
      description:
        "A beautiful, mobile-first website with seasonal product listings, farm story, photo galleries, location and hours, and optional online ordering for pickup or delivery.",
      href: "/services",
    },
    {
      title: "E-Commerce & Online Ordering",
      description:
        "Let customers order produce boxes, baked goods, and seasonal specials online. Stripe checkout integration, order notifications, and inventory management.",
      href: "/services",
    },
    {
      title: "Social Media Content",
      description:
        "Weekly posts featuring what's fresh, behind-the-scenes farm life, and seasonal specials. We write in your voice and schedule everything automatically.",
      href: "/services/content-generation",
    },
    {
      title: "Email Marketing",
      description:
        "CSA signup campaigns, weekly \"what's fresh\" emails, and seasonal promotion sequences that keep your customers coming back week after week.",
      href: "/services/email-marketing",
    },
    {
      title: "Local SEO",
      description:
        "Show up when people search for \"farmers market near me\" or \"fresh produce Columbus Indiana.\" Google Business Profile optimization and local search strategy.",
      href: "/services/seo-automation",
    },
  ],
  caseStudy: {
    name: "Bloomin' Acres Market",
    slug: "bloomin-acres-market",
    summary:
      "We built Bloomin' Acres Market a fast, modern website that showcases their products, tells their story, and gives customers a reason to visit. 97+ Lighthouse performance scores and a design that captures the warmth of a local market.",
  },
};

export default function FarmsMarketsPage() {
  return (
    <PageWrapper>
      <IndustryPageTemplate data={data} />
    </PageWrapper>
  );
}
