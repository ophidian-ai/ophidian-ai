"use client";

import { NavMain } from "@/components/layout/NavMain";
import { FooterMain } from "@/components/layout/FooterMain";
import { HeroAnimated } from "@/components/ui/hero-animated";
import { StatsBar } from "@/components/sections/StatsBar";
import { FeaturesGrid } from "@/components/sections/FeaturesGrid";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { CTABanner } from "@/components/sections/CTABanner";

export default function Home() {
  return (
    <>
      <NavMain />
      <div className="grain">
        <HeroAnimated
          taglineWords={[
            "Welcome",
            "to",
            "OphidianAI",
            "--",
            "Intelligence.",
            "Engineered.",
          ]}
          headlineWords={[
            "AI",
            "that",
            "works",
            "for",
            "your",
            "business,",
            "not",
            "the",
            "other",
            "way",
            "around.",
          ]}
          sublineWords={[
            "Custom",
            "AI",
            "integrations",
            "that",
            "automate",
            "operations,",
            "accelerate",
            "decisions,",
            "and",
            "unlock",
            "revenue.",
          ]}
          bottomWords={[
            "Custom",
            "websites,",
            "AI",
            "tools,",
            "built",
            "for",
            "performance.",
          ]}
        />

        <StatsBar
          stats={[
            { value: "10x", label: "Faster workflows" },
            { value: "40%", label: "Cost reduction" },
            { value: "24/7", label: "Always-on automation" },
            { value: "< 2wk", label: "Time to first integration" },
          ]}
        />

        <FeaturesGrid
          heading="What We Build"
          subtitle="From intelligent automation to full-stack AI systems, we integrate AI where it matters most."
          features={[
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                </svg>
              ),
              title: "AI Assistants",
              description:
                "Custom chatbots and virtual assistants that understand your business, answer customer questions, and handle routine tasks automatically.",
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
                </svg>
              ),
              title: "Workflow Automation",
              description:
                "Connect your tools and automate repetitive processes. From data entry to report generation, we wire AI into your daily operations.",
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              ),
              title: "Document Intelligence",
              description:
                "Extract, classify, and process documents at scale. Turn unstructured data into structured insights your team can act on.",
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181" />
                </svg>
              ),
              title: "Predictive Analytics",
              description:
                "AI-powered dashboards that forecast trends, flag anomalies, and surface the insights that drive better business decisions.",
            },
          ]}
        />

        <ProcessSteps
          heading="How We Work"
          subtitle="A proven process from discovery to deployment. No black boxes, no surprises."
          steps={[
            {
              title: "Discovery",
              description:
                "We audit your current workflows, identify high-impact automation opportunities, and define clear success metrics.",
            },
            {
              title: "Architecture",
              description:
                "We design the integration blueprint -- which AI models, what data flows, how it connects to your existing stack.",
            },
            {
              title: "Build & Test",
              description:
                "We build the integration in rapid sprints with weekly demos. You see progress, give feedback, and stay in control.",
            },
            {
              title: "Deploy & Monitor",
              description:
                "We launch to production with monitoring, alerting, and ongoing support. Your AI keeps getting smarter over time.",
            },
          ]}
        />

        <CTABanner
          headline="Ready to put AI to work?"
          subtitle="Book a free discovery call and we'll map out your first integration in 30 minutes."
          cta={{ label: "Book a Free Call", href: "/contact" }}
        />
      </div>
      <FooterMain />
    </>
  );
}
