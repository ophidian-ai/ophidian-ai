import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { GlassButton } from "@/components/ui/glass-button";
import { GlowCard } from "@/components/ui/spotlight-card";
import { CTABanner } from "@/components/sections/CTABanner";
import {
  ComparisonTable,
  type ComparisonRow,
} from "@/components/sections/ComparisonTable";
import { JsonLd } from "@/components/JsonLd";

export interface ProsCons {
  label: string;
  pros: string[];
  cons: string[];
}

export interface WhenToChoose {
  label: string;
  reasons: string[];
}

export interface ComparisonPageData {
  headline: string;
  subtitle: string;
  intro: string;
  columns: string[];
  highlightColumn?: number;
  rows: ComparisonRow[];
  options: ProsCons[];
  recommendations: WhenToChoose[];
  /** FAQ items */
  faqs?: { question: string; answer: string }[];
  metaDescription: string;
}

export function ComparisonPageTemplate({
  data,
}: {
  data: ComparisonPageData;
}) {
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
              Compare Options
            </Text>
            <Heading level={1} gradient className="mb-4">
              {data.headline}
            </Heading>
            <Text variant="lead" className="mb-8">
              {data.subtitle}
            </Text>
          </div>
        </Container>
      </section>

      {/* Intro */}
      <section className="pb-16">
        <Container width="narrow">
          <Text variant="body" className="text-center">
            {data.intro}
          </Text>
        </Container>
      </section>

      {/* Comparison Table */}
      <section className="pb-20">
        <Container width="default">
          <div className="mb-8 text-center">
            <Heading level={2} gradient>
              Side-by-Side Comparison
            </Heading>
          </div>
          <ComparisonTable
            columns={data.columns}
            rows={data.rows}
            highlightColumn={data.highlightColumn}
          />
        </Container>
      </section>

      {/* Pros & Cons */}
      <section className="py-20">
        <Container width="default">
          <div className="mb-12 text-center">
            <Heading level={2} gradient>
              Pros & Cons
            </Heading>
          </div>
          <div
            className={`grid gap-8 ${
              data.options.length === 2
                ? "md:grid-cols-2"
                : data.options.length === 3
                ? "md:grid-cols-3"
                : "md:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {data.options.map((option) => (
              <GlowCard
                key={option.label}
                className="glass rounded-2xl border border-primary/10 p-8"
              >
                <h3 className="text-xl font-semibold text-foreground mb-6">
                  {option.label}
                </h3>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {option.pros.map((pro) => (
                      <li
                        key={pro}
                        className="flex items-start gap-2 text-sm text-foreground-muted"
                      >
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-primary/50 shrink-0" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-red-400 uppercase tracking-wider mb-3">
                    Limitations
                  </h4>
                  <ul className="space-y-2">
                    {option.cons.map((con) => (
                      <li
                        key={con}
                        className="flex items-start gap-2 text-sm text-foreground-muted"
                      >
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-red-400/50 shrink-0" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </GlowCard>
            ))}
          </div>
        </Container>
      </section>

      {/* When to Choose */}
      <section className="py-20">
        <Container width="default">
          <div className="mb-12 text-center">
            <Heading level={2} gradient>
              Which Is Right for You?
            </Heading>
          </div>
          <div
            className={`grid gap-8 ${
              data.recommendations.length === 2
                ? "md:grid-cols-2"
                : "md:grid-cols-3"
            }`}
          >
            {data.recommendations.map((rec) => (
              <GlowCard
                key={rec.label}
                className="glass rounded-2xl border border-primary/10 p-8"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Choose {rec.label} if&hellip;
                </h3>
                <ul className="space-y-3">
                  {rec.reasons.map((reason) => (
                    <li
                      key={reason}
                      className="flex items-start gap-2 text-sm text-foreground-muted"
                    >
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-primary/50 shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </GlowCard>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ (optional) */}
      {data.faqs && data.faqs.length > 0 && (
        <section className="py-20">
          <Container width="narrow">
            <div className="mb-12 text-center">
              <Heading level={2} gradient>
                Frequently Asked Questions
              </Heading>
            </div>
            <div className="space-y-4">
              {data.faqs.map((faq) => (
                <GlowCard
                  key={faq.question}
                  className="glass rounded-xl border border-primary/10 p-6"
                >
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {faq.question}
                  </h3>
                  <Text variant="body">{faq.answer}</Text>
                </GlowCard>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* CTA */}
      <CTABanner
        headline="Ready to see what we can build for you?"
        subtitle="Book a free discovery call. We'll review your current setup and show you what's possible."
        cta={{ label: "Book a Free Call", href: "/contact" }}
      />
    </div>
  );
}

export default ComparisonPageTemplate;
