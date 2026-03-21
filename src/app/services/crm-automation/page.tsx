"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { AIProductHero } from "@/components/sections/AIProductHero";
import { CTABanner } from "@/components/sections/CTABanner";

const product = {
  title: "CRM Automation",
  subtitle: "Never lose a lead to a missed follow-up again.",
  description:
    "AI-powered CRM that scores leads automatically, triggers follow-up sequences based on behavior, and gives you a clear pipeline view of every prospect. We set it up, integrate it with your existing tools, and train your team to use it.",
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  ),
  features: [
    { title: "AI Lead Scoring", description: "Automatically rank leads by likelihood to convert based on behavior, engagement, and demographic signals." },
    { title: "Automated Follow-Ups", description: "Trigger personalized email and SMS sequences when leads take specific actions or go quiet." },
    { title: "Pipeline Management", description: "Visual pipeline with drag-and-drop stages, activity tracking, and deal forecasting." },
    { title: "Contact Enrichment", description: "AI pulls public data to fill in missing contact details -- company, role, social profiles, and more." },
    { title: "Task Automation", description: "Automatically create tasks, set reminders, and assign follow-ups based on pipeline stage." },
    { title: "Integration Hub", description: "Connect with your website forms, email, calendar, and accounting tools for a single source of truth." },
  ],
  howItWorks: [
    { step: "1", title: "Setup", description: "We configure your CRM, import existing contacts, and build your pipeline stages and automation rules." },
    { step: "2", title: "Integrate", description: "We connect your website forms, email, calendar, and other tools so data flows automatically." },
    { step: "3", title: "Automate", description: "Lead scoring, follow-ups, and task creation run on autopilot. We train your team and monitor performance." },
  ],
  standalonePrice: { setup: "$750", monthly: "$297" },
  tierNudge: "CRM automation is included in our Pro plan at $797/mo -- bundled with every AI growth product we offer.",
};

export default function CRMAutomationPage() {
  return (
    <PageWrapper>
      <AIProductHero product={product} />
      <CTABanner
        headline="Ready to automate your sales pipeline?"
        subtitle="Book a free consultation and we will map out your CRM workflow."
        cta={{ label: "Book a Call", href: "/contact?service=ai_crm" }}
      />
    </PageWrapper>
  );
}
