import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { GlassButton } from "@/components/ui/glass-button";
import { GlowCard } from "@/components/ui/spotlight-card";
import { JsonLd } from "@/components/JsonLd";

export interface PainPoint {
  problem: string;
  solution: string;
  icon: ReactNode;
}

export interface ServiceHighlight {
  title: string;
  description: string;
  href: string;
}

export interface CaseStudyRef {
  name: string;
  slug: string;
  summary: string;
}

export interface IndustryPageData {
  /** Industry name used in headings */
  industry: string;
  /** Full page headline */
  headline: string;
  /** Sub-headline for the hero */
  subtitle: string;
  /** Intro paragraph */
  intro: string;
  /** Pain points with matching solutions */
  painPoints: PainPoint[];
  /** Relevant OphidianAI services */
  services: ServiceHighlight[];
  /** Optional case study reference */
  caseStudy?: CaseStudyRef;
  /** SEO meta description */
  metaDescription: string;
  /** Contact CTA query param (e.g. "restaurant") */
  contactParam: string;
}

export function IndustryPageTemplate({ data }: { data: IndustryPageData }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: data.headline,
    description: data.metaDescription,
    provider: {
      "@type": "Organization",
      name: "OphidianAI",
      url: "https://ophidianai.com",
    },
  };

  return (
    <div className="grain">
      <JsonLd data={schema} />

      {/* Hero */}
      <section className="py-24 md:py-32">
        <Container width="default">
          <div className="max-w-3xl mx-auto text-center animate-fade-up">
            <Text variant="label" className="mb-4">
              Industries We Serve
            </Text>
            <Heading level={1} gradient className="mb-4">
              {data.headline}
            </Heading>
            <Text variant="lead" className="mb-6">
              {data.subtitle}
            </Text>
            <Text variant="body" className="mb-8 max-w-2xl mx-auto">
              {data.intro}
            </Text>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GlassButton size="lg" href={`/contact?industry=${data.contactParam}`}>
                Book a Free Call
              </GlassButton>
              <GlassButton size="lg" href="/portfolio">
                See Our Work
              </GlassButton>
            </div>
          </div>
        </Container>
      </section>

      {/* Pain Points + Solutions */}
      <section className="py-20 md:py-24">
        <Container width="default">
          <div className="mb-12 text-center">
            <Heading level={2} gradient>
              Challenges {data.industry} Face Online
            </Heading>
            <Text variant="lead" className="mt-4 max-w-2xl mx-auto">
              We hear the same problems from {data.industry.toLowerCase()} owners across Indiana. Here&apos;s how we solve them.
            </Text>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {data.painPoints.map((pp, i) => (
              <GlowCard
                key={i}
                className="glass rounded-2xl border border-primary/10 p-8 animate-fade-up"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    {pp.icon}
                  </div>
                  <div>
                    <Heading level={4} className="mb-2 text-red-400/80">
                      {pp.problem}
                    </Heading>
                    <Text variant="body">
                      {pp.solution}
                    </Text>
                  </div>
                </div>
              </GlowCard>
            ))}
          </div>
        </Container>
      </section>

      {/* Service Highlights */}
      <section className="py-20 md:py-24">
        <Container width="default">
          <div className="mb-12 text-center">
            <Heading level={2} gradient>
              What We Build for {data.industry}
            </Heading>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.services.map((service, i) => (
              <Link key={i} href={service.href} className="group">
                <GlowCard className="glass rounded-2xl border border-primary/10 p-8 h-full transition-all duration-300 group-hover:border-primary/30 animate-fade-up">
                  <Heading level={4} className="mb-2 group-hover:text-primary transition-colors">
                    {service.title}
                  </Heading>
                  <Text variant="small">{service.description}</Text>
                  <div className="mt-4 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more &rarr;
                  </div>
                </GlowCard>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Case Study Reference */}
      {data.caseStudy && (
        <section className="py-20 md:py-24">
          <Container width="narrow">
            <GlowCard className="glass rounded-2xl border border-primary/10 p-10 text-center animate-fade-up">
              <Text variant="label" className="mb-4">
                Case Study
              </Text>
              <Heading level={3} gradient className="mb-4">
                See how we helped {data.caseStudy.name}
              </Heading>
              <Text variant="body" className="mb-6 max-w-lg mx-auto">
                {data.caseStudy.summary}
              </Text>
              <GlassButton size="default" href={`/portfolio/${data.caseStudy.slug}`}>
                Read the Full Story
              </GlassButton>
            </GlowCard>
          </Container>
        </section>
      )}

      {/* Pricing CTA */}
      <section className="py-20 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/5" />
        <div className="absolute inset-0 -z-10 border-y border-primary/10" />
        <Container width="default">
          <div className="flex flex-col items-center text-center animate-fade-up">
            <Heading level={2} gradient className="mb-4">
              Transparent Pricing for {data.industry}
            </Heading>
            <Text variant="lead" className="mb-8 max-w-xl">
              Every plan includes a custom website, SEO setup, and ongoing support. No hidden fees, no long-term contracts.
            </Text>
            <div className="flex flex-col sm:flex-row gap-4">
              <GlassButton size="lg" href="/pricing">
                View Pricing
              </GlassButton>
              <GlassButton size="lg" href={`/contact?industry=${data.contactParam}`}>
                Get a Custom Quote
              </GlassButton>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
