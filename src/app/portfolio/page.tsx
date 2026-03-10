"use client";

import Image from "next/image";
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
import {
  Globe,
  ShoppingCart,
  Smartphone,
  Palette,
  Database,
  CreditCard,
  Calendar,
  Search,
  Zap,
  CheckCircle,
} from "lucide-react";

const defaultMetrics = [
  { value: "6", label: "Pages built" },
  { value: "100%", label: "Mobile-responsive" },
  { value: "< 2s", label: "Load time" },
  { value: "95+", label: "Lighthouse score" },
];

const techStack = [
  { name: "HTML / CSS / JS", desc: "Custom-built, no frameworks" },
  { name: "Tailwind CSS", desc: "Utility-first styling" },
  { name: "Supabase", desc: "Database and auth" },
  { name: "Stripe", desc: "Payment processing" },
  { name: "Vercel", desc: "Hosting and CDN" },
  { name: "Puppeteer", desc: "Automated screenshots" },
];

const features = [
  { icon: ShoppingCart, title: "Online Ordering", desc: "Full menu with add-to-cart, quantity controls, and checkout flow" },
  { icon: Calendar, title: "Order Calendar", desc: "Interactive calendar showing pickup and delivery availability" },
  { icon: CreditCard, title: "Stripe Payments", desc: "Secure payment processing with order confirmation emails" },
  { icon: Database, title: "Admin Dashboard", desc: "Menu management, order tracking, and business analytics" },
  { icon: Smartphone, title: "Mobile-First", desc: "Responsive design optimized for phone ordering" },
  { icon: Palette, title: "Brand Identity", desc: "Custom design system matching the farm-to-table aesthetic" },
];

const timeline = [
  { phase: "Discovery", duration: "1 week", desc: "Business requirements, brand direction, menu structure" },
  { phase: "Design", duration: "1 week", desc: "Custom design system, wireframes, component library" },
  { phase: "Build", duration: "3 weeks", desc: "Frontend, Supabase backend, Stripe integration, admin panel" },
  { phase: "Launch", duration: "1 week", desc: "QA testing, performance optimization, deployment" },
];

export default function PortfolioPage() {
  const content = usePageContent("portfolio");
  const { isEditMode } = useEditMode();

  const e = (key: string, fallback: string) => content[key] || fallback;

  return (
    <PageWrapper>
      <div className="grain">
        {/* Hero / Main Case Study */}
        <section className="py-24 md:py-32">
          <Container width="default">
            <div className="mb-12 max-w-3xl">
              <Badge variant="default" className="mb-4">Case Study</Badge>
              {isEditMode ? (
                <>
                  <EditableText page="portfolio" contentKey="portfolio_title" defaultValue="Bloomin' Acres" dbValue={content["portfolio_title"]} as="h1" className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4" />
                  <EditableText page="portfolio" contentKey="portfolio_desc" defaultValue="A full-featured e-commerce website for a local sourdough bakery and fresh produce business. Built from scratch with custom design, online ordering, Stripe payments, and a complete admin dashboard." dbValue={content["portfolio_desc"]} as="p" className="text-lg text-foreground-muted" />
                </>
              ) : (
                <>
                  <Heading level={1} gradient className="mb-4">{e("portfolio_title", "Bloomin\u2019 Acres")}</Heading>
                  <Text variant="body" className="text-lg">{e("portfolio_desc", "A full-featured e-commerce website for a local sourdough bakery and fresh produce business. Built from scratch with custom design, online ordering, Stripe payments, and a complete admin dashboard.")}</Text>
                </>
              )}
            </div>

            {/* Hero screenshot */}
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
                  <Image
                    src={e("portfolio_image", "/images/portfolio/bloomin-acres-homepage.png")}
                    alt="Bloomin' Acres website homepage showing the bakery's menu and ordering system"
                    fill
                    className="object-cover object-top"
                  />
                )}
              </div>
            </GlowCard>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              {defaultMetrics.map((item, i) => (
                <GlowCard key={i} className="rounded-xl bg-surface-hover/50 border border-primary/5 p-5 text-center">
                  {isEditMode ? (
                    <>
                      <EditableText page="portfolio" contentKey={`portfolio_metric_${i + 1}_value`} defaultValue={item.value} dbValue={content[`portfolio_metric_${i + 1}_value`]} as="div" className="text-2xl font-bold text-primary mb-1" />
                      <EditableText page="portfolio" contentKey={`portfolio_metric_${i + 1}_label`} defaultValue={item.label} dbValue={content[`portfolio_metric_${i + 1}_label`]} as="p" className="text-sm text-foreground-muted" />
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-primary mb-1">{e(`portfolio_metric_${i + 1}_value`, item.value)}</div>
                      <Text variant="small">{e(`portfolio_metric_${i + 1}_label`, item.label)}</Text>
                    </>
                  )}
                </GlowCard>
              ))}
            </div>
          </Container>
        </section>

        {/* The Challenge / Solution */}
        <section className="py-16 md:py-24">
          <Container width="default">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Search className="h-5 w-5 text-primary" />
                  <Heading level={3} className="text-xl font-bold text-foreground">The Challenge</Heading>
                </div>
                <Text variant="body" className="text-foreground-muted">
                  Bloomin&apos; Acres operated entirely through social media and word of mouth. Customers had to DM or call to place orders, leading to missed sales, scheduling conflicts, and no way to manage inventory. They needed a professional online presence that could handle orders, payments, and menu management without adding complexity to their daily operations.
                </Text>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-accent" />
                  <Heading level={3} className="text-xl font-bold text-foreground">The Solution</Heading>
                </div>
                <Text variant="body" className="text-foreground-muted">
                  We built a complete e-commerce platform from scratch -- no templates, no page builders. A custom design system captures the farm-to-table brand, while the ordering system handles everything from menu browsing to payment processing. An admin dashboard gives the owner full control over products, pricing, availability, and order management.
                </Text>
              </div>
            </div>
          </Container>
        </section>

        {/* Key Features */}
        <section className="py-16 md:py-24">
          <Container width="default">
            <div className="mb-10">
              <Heading level={2} gradient className="mb-2">Key Features</Heading>
              <Text variant="body">What we built for Bloomin&apos; Acres.</Text>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <GlowCard key={feature.title} className="glass rounded-xl border border-primary/10 p-6">
                  <feature.icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <Text variant="small">{feature.desc}</Text>
                </GlowCard>
              ))}
            </div>
          </Container>
        </section>

        {/* Tech Stack */}
        <section className="py-16 md:py-24">
          <Container width="default">
            <div className="mb-10">
              <Heading level={2} gradient className="mb-2">Tech Stack</Heading>
              <Text variant="body">Purpose-built with modern, reliable tools.</Text>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {techStack.map((tech) => (
                <div key={tech.name} className="flex items-center gap-4 rounded-xl bg-surface-hover/30 border border-primary/5 p-4">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-foreground text-sm">{tech.name}</div>
                    <div className="text-xs text-foreground-dim">{tech.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Timeline */}
        <section className="py-16 md:py-24">
          <Container width="narrow">
            <div className="mb-10 text-center">
              <Heading level={2} gradient className="mb-2">Project Timeline</Heading>
              <Text variant="body">From discovery to launch in 6 weeks.</Text>
            </div>
            <div className="space-y-6">
              {timeline.map((step, i) => (
                <div key={step.phase} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm">
                      {i + 1}
                    </div>
                    {i < timeline.length - 1 && (
                      <div className="w-px flex-1 bg-primary/10 mt-2" />
                    )}
                  </div>
                  <div className="pb-8">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-foreground">{step.phase}</h3>
                      <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">{step.duration}</span>
                    </div>
                    <Text variant="small">{step.desc}</Text>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Results */}
        <section className="py-16 md:py-24">
          <Container width="default">
            <div className="glass rounded-2xl border border-primary/10 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="h-6 w-6 text-primary" />
                <Heading level={2} gradient>Results</Heading>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <Text variant="body" className="text-foreground-muted">Professional online presence replacing social media-only sales</Text>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <Text variant="body" className="text-foreground-muted">Automated ordering eliminates manual DM/phone order management</Text>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <Text variant="body" className="text-foreground-muted">Stripe integration enables secure online payments</Text>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <Text variant="body" className="text-foreground-muted">Admin dashboard gives owner full control over menu and orders</Text>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <Text variant="body" className="text-foreground-muted">Mobile-first design captures phone-browsing customers</Text>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <Text variant="body" className="text-foreground-muted">Sub-2-second load times with 95+ Lighthouse performance score</Text>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* More Projects Coming */}
        <section className="py-16 md:py-24">
          <Container width="narrow">
            <div className="text-center animate-fade-up">
              {isEditMode ? (
                <>
                  <EditableText page="portfolio" contentKey="coming_soon_heading" defaultValue="More projects coming soon" dbValue={content["coming_soon_heading"]} as="h3" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4" />
                  <EditableText page="portfolio" contentKey="coming_soon_text" defaultValue="OphidianAI is actively building our portfolio. We are currently taking on new clients -- if you have a project in mind, we would love to hear about it." dbValue={content["coming_soon_text"]} as="p" className="text-foreground-muted mb-8" />
                </>
              ) : (
                <>
                  <Heading level={3} gradient className="mb-4">{e("coming_soon_heading", "More projects coming soon")}</Heading>
                  <Text variant="body" className="mb-8">{e("coming_soon_text", "OphidianAI is actively building our portfolio. We are currently taking on new clients -- if you have a project in mind, we would love to hear about it.")}</Text>
                </>
              )}
              <GlassButton size="lg" href="/contact">Start a Project</GlassButton>
            </div>
          </Container>
        </section>

        {/* CTA */}
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
