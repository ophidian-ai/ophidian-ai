"use client";

import { NavMain } from "@/components/layout/NavMain";
import { FooterMain } from "@/components/layout/FooterMain";
import { HeroAnimated } from "@/components/ui/hero-animated";
import { ScrollScrubHero } from "@/components/hero/ScrollScrubHero";
import { StatsBar } from "@/components/sections/StatsBar";
import { FeaturesGrid } from "@/components/sections/FeaturesGrid";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { CTABanner } from "@/components/sections/CTABanner";
import { TestimonialsColumn, type Testimonial } from "@/components/ui/testimonials-columns";
import { usePageContent } from "@/lib/use-page-content";
import { EditableText } from "@/components/editable/editable-text";
import { useEditMode } from "@/lib/edit-mode-context";

const defaultHero = {
  tagline: "Welcome to OphidianAI -- Intelligence. Engineered.",
  headline: "AI that works for your business, not the other way around.",
  subline: "Custom AI integrations that automate operations, accelerate decisions, and unlock revenue.",
  bottom: "Custom websites, AI tools, built for performance.",
};

const defaultStats = [
  { value: "10x", label: "Faster workflows" },
  { value: "40%", label: "Cost reduction" },
  { value: "24/7", label: "Always-on automation" },
  { value: "< 2wk", label: "Time to first integration" },
];

const featureIcons = [
  <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" /></svg>,
  <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" /></svg>,
  <svg key="3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>,
  <svg key="4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181" /></svg>,
];

const defaultFeatures = [
  { title: "AI Assistants", description: "Custom chatbots and virtual assistants that understand your business, answer customer questions, and handle routine tasks automatically." },
  { title: "Workflow Automation", description: "Connect your tools and automate repetitive processes. From data entry to report generation, we wire AI into your daily operations." },
  { title: "Document Intelligence", description: "Extract, classify, and process documents at scale. Turn unstructured data into structured insights your team can act on." },
  { title: "Predictive Analytics", description: "AI-powered dashboards that forecast trends, flag anomalies, and surface the insights that drive better business decisions." },
];

const testimonials: Testimonial[] = [
  {
    text: "OphidianAI transformed our online presence completely. The website they built drives real results and our customers love it.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    name: "Sarah Mitchell",
    role: "Small Business Owner",
  },
  {
    text: "The AI integration streamlined our customer support. Response times dropped by 80% and satisfaction scores went through the roof.",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    name: "James Rodriguez",
    role: "Operations Manager",
  },
  {
    text: "Working with Eric was seamless. He understood our vision immediately and delivered a site that exceeded our expectations.",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    name: "Emily Chen",
    role: "Marketing Director",
  },
  {
    text: "The automated workflows OphidianAI built saved us 20+ hours a week. That's time we now spend growing the business.",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "David Park",
    role: "CEO",
  },
  {
    text: "Finally, a tech partner who speaks our language. No jargon, just results. Our e-commerce conversion rate doubled.",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    name: "Lisa Thompson",
    role: "E-commerce Manager",
  },
  {
    text: "The AI chatbot handles 70% of our support tickets now. It's like having an extra team member that never sleeps.",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "Amanda Foster",
    role: "Customer Success Lead",
  },
  {
    text: "OphidianAI built exactly what we needed -- no bloat, no unnecessary features. Clean, fast, and effective.",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "Michael Rivera",
    role: "Product Manager",
  },
  {
    text: "They delivered a solution that scaled with us. As we grew, the system grew too. Best investment we made this year.",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "Rachel Kim",
    role: "COO",
  },
  {
    text: "The analytics dashboard OphidianAI built gives us real-time insights we never had before. Game changer for our strategy.",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    name: "Chris Anderson",
    role: "Data Analyst",
  },
];

const testimonialCol1 = testimonials.slice(0, 3);
const testimonialCol2 = testimonials.slice(3, 6);
const testimonialCol3 = testimonials.slice(6, 9);

const defaultSteps = [
  { title: "Discovery", description: "We audit your current workflows, identify high-impact automation opportunities, and define clear success metrics." },
  { title: "Architecture", description: "We design the integration blueprint -- which AI models, what data flows, how it connects to your existing stack." },
  { title: "Build & Test", description: "We build the integration in rapid sprints with weekly demos. You see progress, give feedback, and stay in control." },
  { title: "Deploy & Monitor", description: "We launch to production with monitoring, alerting, and ongoing support. Your AI keeps getting smarter over time." },
];

export default function Home() {
  const content = usePageContent("home");
  const { isEditMode } = useEditMode();

  return (
    <>
      <NavMain />
      <div className="grain">
        {isEditMode ? (
          <section className="pt-32 pb-24 md:pb-32 text-center px-4">
            <EditableText page="home" contentKey="hero_tagline" defaultValue={defaultHero.tagline} dbValue={content["hero_tagline"]} as="p" className="text-lg text-foreground-muted mb-4" />
            <EditableText page="home" contentKey="hero_headline" defaultValue={defaultHero.headline} dbValue={content["hero_headline"]} as="h1" className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground-muted bg-clip-text text-transparent" />
            <EditableText page="home" contentKey="hero_subline" defaultValue={defaultHero.subline} dbValue={content["hero_subline"]} as="p" className="text-xl text-foreground-muted mb-8 max-w-3xl mx-auto" />
            <EditableText page="home" contentKey="hero_bottom" defaultValue={defaultHero.bottom} dbValue={content["hero_bottom"]} as="p" className="text-foreground-muted" />
          </section>
        ) : (
          <ScrollScrubHero />
        )}

        {isEditMode ? (
          <section className="py-16 md:py-20 border-y border-surface-border">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                {defaultStats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <EditableText page="home" contentKey={`stat_${i + 1}_value`} defaultValue={stat.value} dbValue={content[`stat_${i + 1}_value`]} as="p" className="text-4xl font-bold text-primary md:text-5xl font-mono tracking-tight" />
                    <EditableText page="home" contentKey={`stat_${i + 1}_label`} defaultValue={stat.label} dbValue={content[`stat_${i + 1}_label`]} as="p" className="mt-2 text-sm text-foreground-muted" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <StatsBar
            stats={defaultStats.map((stat, i) => ({
              value: content[`stat_${i + 1}_value`] || stat.value,
              label: content[`stat_${i + 1}_label`] || stat.label,
            }))}
          />
        )}

        {isEditMode ? (
          <section className="py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 max-w-2xl">
                <EditableText page="home" contentKey="features_heading" defaultValue="What We Build" dbValue={content["features_heading"]} as="h2" className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" />
                <EditableText page="home" contentKey="features_subtitle" defaultValue="From intelligent automation to full-stack AI systems, we integrate AI where it matters most." dbValue={content["features_subtitle"]} as="p" className="mt-4 text-lg text-foreground-muted" />
              </div>
              <div className="grid gap-8 md:grid-cols-2">
                {defaultFeatures.map((feat, i) => (
                  <div key={i} className="glass rounded-2xl border border-primary/10 p-8">
                    <div className="text-primary mb-4">{featureIcons[i]}</div>
                    <EditableText page="home" contentKey={`feature_${i + 1}_title`} defaultValue={feat.title} dbValue={content[`feature_${i + 1}_title`]} as="h3" className="text-lg font-semibold text-foreground mb-2" />
                    <EditableText page="home" contentKey={`feature_${i + 1}_desc`} defaultValue={feat.description} dbValue={content[`feature_${i + 1}_desc`]} as="p" className="text-foreground-muted text-sm" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <FeaturesGrid
            heading={content["features_heading"] || "What We Build"}
            subtitle={content["features_subtitle"] || "From intelligent automation to full-stack AI systems, we integrate AI where it matters most."}
            features={defaultFeatures.map((feat, i) => ({
              icon: featureIcons[i],
              title: content[`feature_${i + 1}_title`] || feat.title,
              description: content[`feature_${i + 1}_desc`] || feat.description,
            }))}
          />
        )}

        {isEditMode ? (
          <section className="py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 max-w-2xl">
                <EditableText page="home" contentKey="process_heading" defaultValue="How We Work" dbValue={content["process_heading"]} as="h2" className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" />
                <EditableText page="home" contentKey="process_subtitle" defaultValue="A proven process from discovery to deployment. No black boxes, no surprises." dbValue={content["process_subtitle"]} as="p" className="mt-4 text-lg text-foreground-muted" />
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {defaultSteps.map((step, i) => (
                  <div key={i} className="glass rounded-2xl border border-primary/10 p-8">
                    <div className="text-primary font-mono text-sm mb-4">{String(i + 1).padStart(2, "0")}</div>
                    <EditableText page="home" contentKey={`process_${i + 1}_title`} defaultValue={step.title} dbValue={content[`process_${i + 1}_title`]} as="h3" className="text-lg font-semibold text-foreground mb-2" />
                    <EditableText page="home" contentKey={`process_${i + 1}_desc`} defaultValue={step.description} dbValue={content[`process_${i + 1}_desc`]} as="p" className="text-foreground-muted text-sm" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <ProcessSteps
            heading={content["process_heading"] || "How We Work"}
            subtitle={content["process_subtitle"] || "A proven process from discovery to deployment. No black boxes, no surprises."}
            steps={defaultSteps.map((step, i) => ({
              title: content[`process_${i + 1}_title`] || step.title,
              description: content[`process_${i + 1}_desc`] || step.description,
            }))}
          />
        )}

        <section className="py-24 md:py-32 relative">
          <div className="container z-10 mx-auto px-4">
            <div className="flex flex-col items-center justify-center max-w-[540px] mx-auto">
              <div className="flex justify-center">
                <div className="border border-primary/20 py-1 px-4 rounded-lg text-primary text-sm">
                  Testimonials
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 text-foreground">
                Trusted by{" "}
                <span className="gradient-text">growing businesses</span>
              </h2>
              <p className="text-center mt-5 text-foreground-muted">
                See what our clients have to say about working with OphidianAI.
              </p>
            </div>
            <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
              <TestimonialsColumn testimonials={testimonialCol1} duration={15} />
              <TestimonialsColumn
                testimonials={testimonialCol2}
                className="hidden md:block"
                duration={19}
              />
              <TestimonialsColumn
                testimonials={testimonialCol3}
                className="hidden lg:block"
                duration={17}
              />
            </div>
          </div>
        </section>

        {isEditMode ? (
          <section className="py-20 md:py-24 relative overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/5" />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
              <EditableText page="home" contentKey="cta_headline" defaultValue="Ready to put AI to work?" dbValue={content["cta_headline"]} as="h2" className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4" />
              <EditableText page="home" contentKey="cta_subtitle" defaultValue="Book a free discovery call and we'll map out your first integration in 30 minutes." dbValue={content["cta_subtitle"]} as="p" className="text-lg text-foreground-muted mb-8 max-w-xl mx-auto" />
              <EditableText page="home" contentKey="cta_label" defaultValue="Book a Free Call" dbValue={content["cta_label"]} as="span" className="inline-block px-6 py-3 rounded-full border border-primary/30 text-primary font-medium" />
            </div>
          </section>
        ) : (
          <CTABanner
            headline={content["cta_headline"] || "Ready to put AI to work?"}
            subtitle={content["cta_subtitle"] || "Book a free discovery call and we'll map out your first integration in 30 minutes."}
            cta={{ label: content["cta_label"] || "Book a Free Call", href: "/contact" }}
          />
        )}
      </div>
      <FooterMain />
    </>
  );
}
