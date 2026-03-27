import type { Metadata } from "next";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { IndustryPageTemplate } from "@/components/sections/IndustryPageTemplate";
import type { IndustryPageData } from "@/components/sections/IndustryPageTemplate";

export const metadata: Metadata = {
  title: "Websites for Churches & Ministries | OphidianAI",
  description:
    "Modern, mobile-friendly church websites with event calendars, visitor chatbots, and content tools that help your congregation stay connected.",
  keywords: [
    "church website",
    "church website design",
    "ministry website",
    "church website Indiana",
    "church event calendar",
    "church chatbot",
  ],
};

const iconPhone = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
  </svg>
);

const iconCalendar = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);

const iconUsers = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
);

const iconHeart = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
  </svg>
);

const data: IndustryPageData = {
  industry: "Churches",
  headline: "Websites for Churches & Ministries",
  subtitle: "Help your congregation stay connected -- online and off.",
  intro:
    "Your church's website is often the first thing a visitor sees before they ever walk through your doors. If it's hard to navigate, looks outdated on a phone, or doesn't show when your next service is, you're missing an opportunity to welcome new members. We build church websites that are warm, modern, and easy for anyone on your team to keep updated.",
  contactParam: "church",
  metaDescription:
    "Modern, mobile-friendly church websites with event calendars, visitor chatbots, and content tools that help your congregation stay connected.",
  painPoints: [
    {
      problem: "Your site was built by a volunteer five years ago and it shows",
      solution:
        "We build a modern, professionally designed website that reflects the warmth and mission of your church -- without requiring a web developer on staff to maintain it.",
      icon: iconPhone,
    },
    {
      problem: "Nobody can find your service times or upcoming events",
      solution:
        "A clear, prominent events calendar and service schedule front-and-center on your homepage. Visitors get the info they need in seconds, not clicks.",
      icon: iconCalendar,
    },
    {
      problem: "First-time visitors have questions but nobody to ask",
      solution:
        "An AI chatbot welcomes visitors to your site 24/7, answers common questions about service times, parking, kids' programs, and what to expect on a first visit.",
      icon: iconUsers,
    },
    {
      problem: "Keeping the congregation informed takes hours of manual updates",
      solution:
        "Our Content Engine helps you create weekly bulletins, social media announcements, and email newsletters that keep your community engaged without burning out your staff.",
      icon: iconHeart,
    },
  ],
  services: [
    {
      title: "Church Website Design",
      description:
        "A welcoming, mobile-first website with service times, event calendar, sermon archive, staff directory, and giving integration. Designed to make visitors feel at home before they arrive.",
      href: "/services",
    },
    {
      title: "Visitor Chatbot",
      description:
        "An AI assistant that answers questions from potential visitors -- service times, directions, what to wear, kids' programs, and how to get involved.",
      href: "/services/ai-chatbot",
    },
    {
      title: "Social Media & Email",
      description:
        "Weekly social media posts and email newsletters that keep your congregation informed about events, sermon series, volunteer opportunities, and community news.",
      href: "/services/content-generation",
    },
    {
      title: "Local SEO",
      description:
        "Make sure people searching for \"churches near me\" find you. Google Business Profile optimization, local search rankings, and map visibility.",
      href: "/services/seo-automation",
    },
  ],
  caseStudy: {
    name: "Point of Hope Church",
    slug: "point-of-hope-church",
    summary:
      "We built Point of Hope Church a modern, mobile-friendly website with clear service information, an events page, and fast load times -- giving their congregation a digital home that matches the warmth of their physical one.",
  },
};

export default function ChurchesPage() {
  return (
    <PageWrapper>
      <IndustryPageTemplate data={data} />
    </PageWrapper>
  );
}
