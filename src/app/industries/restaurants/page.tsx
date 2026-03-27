import type { Metadata } from "next";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { IndustryPageTemplate } from "@/components/sections/IndustryPageTemplate";
import type { IndustryPageData } from "@/components/sections/IndustryPageTemplate";

export const metadata: Metadata = {
  title: "Websites & AI Marketing for Restaurants | OphidianAI",
  description:
    "Custom restaurant websites with online menus, AI chatbots for reservations, and social media content that fills seats. Serving Indiana restaurants.",
  keywords: [
    "restaurant website Indiana",
    "restaurant marketing",
    "restaurant website design",
    "online menu website",
    "restaurant chatbot",
    "restaurant social media marketing",
  ],
};

const iconMenu = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const iconGlobe = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
);

const iconChat = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
  </svg>
);

const iconPhoto = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 0 0 1.5-1.5V5.25a1.5 1.5 0 0 0-1.5-1.5H3.75a1.5 1.5 0 0 0-1.5 1.5v14.25a1.5 1.5 0 0 0 1.5 1.5Z" />
  </svg>
);

const data: IndustryPageData = {
  industry: "Restaurants",
  headline: "Websites & AI Marketing for Restaurants",
  subtitle: "Fill more seats with a website that actually works for you.",
  intro:
    "Your food is great -- but if customers can't find your menu, check your hours, or place an order online, they're going to the restaurant down the street that makes it easy. We build fast, mobile-friendly restaurant websites paired with AI marketing that keeps your tables full.",
  contactParam: "restaurant",
  metaDescription:
    "Custom restaurant websites with online menus, AI chatbots for reservations, and social media content that fills seats. Serving Indiana restaurants.",
  painPoints: [
    {
      problem: "Your menu is a blurry PDF nobody can read on their phone",
      solution:
        "We build a clean, searchable menu page that loads instantly on any device. Customers see your dishes with descriptions and prices -- no pinching and zooming required.",
      icon: iconMenu,
    },
    {
      problem: "You're invisible on Google when people search \"restaurants near me\"",
      solution:
        "We optimize your Google Business Profile, build local SEO into your site, and create content that targets the searches your customers actually make -- like \"best pizza in Columbus Indiana.\"",
      icon: iconGlobe,
    },
    {
      problem: "You're answering the same questions about hours and reservations all day",
      solution:
        "An AI chatbot on your website handles the repetitive questions -- hours, reservation availability, menu items, dietary options -- so your staff can focus on the people in front of them.",
      icon: iconChat,
    },
    {
      problem: "You know you should post on social media but never have time",
      solution:
        "Our Content Engine creates weekly posts featuring your specials, events, and seasonal dishes -- written in your voice, scheduled automatically, with the right hashtags for local reach.",
      icon: iconPhoto,
    },
  ],
  services: [
    {
      title: "Custom Restaurant Website",
      description:
        "Mobile-first design with menu pages, location info, hours, online ordering integration, and photo galleries that make your food look as good online as it tastes in person.",
      href: "/services",
    },
    {
      title: "AI Chatbot for Reservations",
      description:
        "A 24/7 assistant that answers customer questions, takes reservation requests, and captures contact info for marketing -- all without your staff lifting a finger.",
      href: "/services/ai-chatbot",
    },
    {
      title: "Social Media Content",
      description:
        "AI-generated posts for Instagram, Facebook, and Google Business Profile featuring your daily specials, events, and seasonal promotions. Consistent posting without the time commitment.",
      href: "/services/content-generation",
    },
    {
      title: "Local SEO",
      description:
        "Get found when hungry customers search for restaurants in your area. Google Business Profile optimization, keyword targeting, and monthly performance reports.",
      href: "/services/seo-automation",
    },
    {
      title: "Review Management",
      description:
        "Monitor reviews across Google, Yelp, and TripAdvisor. Get AI-drafted responses and campaigns that encourage happy customers to leave reviews.",
      href: "/services/review-management",
    },
    {
      title: "Email Marketing",
      description:
        "Automated email campaigns for special events, seasonal menus, and loyalty promotions that bring customers back again and again.",
      href: "/services/email-marketing",
    },
  ],
};

export default function RestaurantsPage() {
  return (
    <PageWrapper>
      <IndustryPageTemplate data={data} />
    </PageWrapper>
  );
}
