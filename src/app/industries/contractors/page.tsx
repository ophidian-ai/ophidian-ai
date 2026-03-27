import type { Metadata } from "next";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { IndustryPageTemplate } from "@/components/sections/IndustryPageTemplate";
import type { IndustryPageData } from "@/components/sections/IndustryPageTemplate";

export const metadata: Metadata = {
  title: "Websites for Contractors & Service Businesses | OphidianAI",
  description:
    "Professional contractor websites that generate leads, build credibility, and dominate local search. HVAC, plumbing, electrical, roofing, and more.",
  keywords: [
    "contractor website Indiana",
    "HVAC website",
    "plumber website design",
    "contractor marketing",
    "service business website",
    "contractor SEO",
  ],
};

const iconWrench = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
  </svg>
);

const iconSearch = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const iconStar = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
  </svg>
);

const iconPhone = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
  </svg>
);

const data: IndustryPageData = {
  industry: "Contractors",
  headline: "Websites for Contractors & Service Businesses",
  subtitle: "Stop losing jobs to competitors who have a better website.",
  intro:
    "Word of mouth got you this far, but homeowners are checking websites before they call for a quote. If you don't have a professional online presence -- or the first result on Google is a competitor -- you're leaving money on the table. We build contractor websites that generate leads, build trust, and show up when customers search for your services.",
  contactParam: "contractor",
  metaDescription:
    "Professional contractor websites that generate leads, build credibility, and dominate local search. HVAC, plumbing, electrical, roofing, and more.",
  painPoints: [
    {
      problem: "You rely on word of mouth and have no website at all",
      solution:
        "We build you a professional website in weeks, not months. Service pages, a gallery of your work, customer testimonials, and a clear \"Get a Quote\" button on every page.",
      icon: iconWrench,
    },
    {
      problem: "Competitors show up on Google and you don't",
      solution:
        "Local SEO puts your business on the map -- literally. We optimize your Google Business Profile, target searches like \"HVAC repair near me,\" and build the local authority that gets you into the map pack.",
      icon: iconSearch,
    },
    {
      problem: "You have great reviews but nobody sees them",
      solution:
        "We pull your best Google and Yelp reviews directly onto your website and run review generation campaigns that keep the 5-star ratings coming in consistently.",
      icon: iconStar,
    },
    {
      problem: "Customers call but you're on a job and can't answer",
      solution:
        "An AI chatbot on your site captures the lead's name, contact info, and project details while you're on the job site. You get a notification and can follow up when you're free.",
      icon: iconPhone,
    },
  ],
  services: [
    {
      title: "Contractor Website",
      description:
        "A professional website with service pages, work gallery, testimonials, and lead capture forms. Built to convert visitors into quote requests.",
      href: "/services",
    },
    {
      title: "Lead Capture Chatbot",
      description:
        "An AI assistant that captures project details, collects contact info, and qualifies leads -- even when you're on a job site and can't answer the phone.",
      href: "/services/ai-chatbot",
    },
    {
      title: "Local SEO",
      description:
        "Dominate local search results for your services. Google Business Profile optimization, local keyword targeting, and competitor monitoring.",
      href: "/services/seo-automation",
    },
    {
      title: "Review Management",
      description:
        "Showcase your best reviews on your website and run automated campaigns that encourage satisfied customers to leave reviews after every job.",
      href: "/services/review-management",
    },
    {
      title: "Google Ads",
      description:
        "Targeted Google Ads for your service area so you show up at the top when homeowners search for exactly what you do.",
      href: "/services/ad-management",
    },
    {
      title: "Content & Social Media",
      description:
        "Before-and-after project posts, seasonal maintenance tips, and local community content that builds your reputation as the go-to contractor in your area.",
      href: "/services/content-generation",
    },
  ],
};

export default function ContractorsPage() {
  return (
    <PageWrapper>
      <IndustryPageTemplate data={data} />
    </PageWrapper>
  );
}
