"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { CTABanner } from "@/components/sections/CTABanner";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { GlassButton } from "@/components/ui/glass-button";
import { GlowCard } from "@/components/ui/spotlight-card";
import { usePageContent } from "@/lib/use-page-content";
import { EditableText } from "@/components/editable/editable-text";
import { EditableImage } from "@/components/editable/editable-image";
import { useEditMode } from "@/lib/edit-mode-context";

const defaultMetrics = [
  { value: "6", label: "Pages built" },
  { value: "Stripe + Supabase", label: "Integrated" },
  { value: "100%", label: "Mobile-responsive" },
];

export default function PortfolioPage() {
  const content = usePageContent("portfolio");
  const { isEditMode } = useEditMode();

  const e = (key: string, fallback: string) => content[key] || fallback;

  return (
    <PageWrapper>
      <div className="grain">
        <section className="py-24 md:py-32">
          <Container width="default">
            <GlowCard className="glass rounded-2xl overflow-hidden border border-primary/10 animate-fade-up">
              <div className="relative aspect-video bg-surface border-b border-primary/10 overflow-hidden">
                {isEditMode ? (
                  <EditableImage
                    page="portfolio"
                    contentKey="portfolio_image"
                    defaultSrc="/images/portfolio/bloomin-acres-homepage.png"
                    dbValue={content["portfolio_image"]}
                    alt="Bloomin' Acres website homepage"
                    fill
                    className="object-cover object-top"
                  />
                ) : (
                  <img
                    src={e("portfolio_image", "/images/portfolio/bloomin-acres-homepage.png")}
                    alt="Bloomin' Acres website homepage showing the bakery's menu and ordering system"
                    className="w-full h-full object-cover object-top"
                  />
                )}
              </div>

              <div className="p-8 md:p-12">
                {isEditMode ? (
                  <>
                    <EditableText page="portfolio" contentKey="portfolio_badge" defaultValue="Website Design" dbValue={content["portfolio_badge"]} as="span" className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4" />
                    <EditableText page="portfolio" contentKey="portfolio_title" defaultValue="Bloomin' Acres" dbValue={content["portfolio_title"]} as="h2" className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4" />
                    <EditableText page="portfolio" contentKey="portfolio_desc" defaultValue="A full-featured e-commerce website for a local sourdough bakery and fresh produce business. Built with a custom design system, Stripe payments, Supabase backend, and automated menu management." dbValue={content["portfolio_desc"]} as="p" className="text-foreground-muted mb-8 max-w-3xl" />
                  </>
                ) : (
                  <>
                    <Badge variant="default" className="mb-4">{e("portfolio_badge", "Website Design")}</Badge>
                    <Heading level={2} gradient className="mb-4">{e("portfolio_title", "Bloomin\u2019 Acres")}</Heading>
                    <Text variant="body" className="mb-8 max-w-3xl">{e("portfolio_desc", "A full-featured e-commerce website for a local sourdough bakery and fresh produce business. Built with a custom design system, Stripe payments, Supabase backend, and automated menu management.")}</Text>
                  </>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  {defaultMetrics.map((item, i) => (
                    <GlowCard key={i} className="rounded-lg bg-surface-hover/50 border border-primary/5 p-4 text-center">
                      {isEditMode ? (
                        <>
                          <EditableText page="portfolio" contentKey={`portfolio_metric_${i + 1}_value`} defaultValue={item.value} dbValue={content[`portfolio_metric_${i + 1}_value`]} as="div" className="text-xl font-semibold text-primary mb-1" />
                          <EditableText page="portfolio" contentKey={`portfolio_metric_${i + 1}_label`} defaultValue={item.label} dbValue={content[`portfolio_metric_${i + 1}_label`]} as="p" className="text-sm text-foreground-muted" />
                        </>
                      ) : (
                        <>
                          <div className="text-xl font-semibold text-primary mb-1">{e(`portfolio_metric_${i + 1}_value`, item.value)}</div>
                          <Text variant="small">{e(`portfolio_metric_${i + 1}_label`, item.label)}</Text>
                        </>
                      )}
                    </GlowCard>
                  ))}
                </div>
              </div>
            </GlowCard>
          </Container>
        </section>

        <section className="py-24 md:py-32">
          <Container width="narrow">
            <div className="text-center animate-fade-up">
              {isEditMode ? (
                <>
                  <EditableText page="portfolio" contentKey="coming_soon_heading" defaultValue="More projects coming soon" dbValue={content["coming_soon_heading"]} as="h3" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4" />
                  <EditableText page="portfolio" contentKey="coming_soon_text" defaultValue="OphidianAI is an early-stage agency, and we are actively building our portfolio. We are currently taking on new clients -- if you have a project in mind, we would love to hear about it." dbValue={content["coming_soon_text"]} as="p" className="text-foreground-muted mb-8" />
                </>
              ) : (
                <>
                  <Heading level={3} gradient className="mb-4">{e("coming_soon_heading", "More projects coming soon")}</Heading>
                  <Text variant="body" className="mb-8">{e("coming_soon_text", "OphidianAI is an early-stage agency, and we are actively building our portfolio. We are currently taking on new clients -- if you have a project in mind, we would love to hear about it.")}</Text>
                </>
              )}
              <GlassButton size="lg" href="/contact">Start a Project</GlassButton>
            </div>
          </Container>
        </section>

        {isEditMode ? (
          <section className="py-20 md:py-24 relative overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/5" />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
              <EditableText page="portfolio" contentKey="cta_headline" defaultValue="Ready to build something great?" dbValue={content["cta_headline"]} as="h2" className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4" />
              <EditableText page="portfolio" contentKey="cta_subtitle" defaultValue="Let's talk about your project. No contracts, no pressure -- just a conversation about what you need." dbValue={content["cta_subtitle"]} as="p" className="text-lg text-foreground-muted mb-8 max-w-xl mx-auto" />
            </div>
          </section>
        ) : (
          <CTABanner
            headline={e("cta_headline", "Ready to build something great?")}
            subtitle={e("cta_subtitle", "Let's talk about your project. No contracts, no pressure -- just a conversation about what you need.")}
            cta={{ label: e("cta_label", "Get in Touch"), href: "/contact" }}
          />
        )}
      </div>
    </PageWrapper>
  );
}
