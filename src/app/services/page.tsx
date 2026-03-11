"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { FeaturesGrid } from "@/components/sections/FeaturesGrid";
import { CTABanner } from "@/components/sections/CTABanner";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { GlassButton } from "@/components/ui/glass-button";
import { JsonLd } from "@/components/JsonLd";
import { GlowCard } from "@/components/ui/spotlight-card";
import { usePageContent } from "@/lib/use-page-content";
import { EditableText } from "@/components/editable/editable-text";
import { EditableImage } from "@/components/editable/editable-image";
import { useEditMode } from "@/lib/edit-mode-context";

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: [
    { "@type": "Service", position: 1, name: "Custom Web Design", description: "Modern, mobile-first websites designed and built for small businesses.", provider: { "@type": "Organization", name: "OphidianAI" } },
    { "@type": "Service", position: 2, name: "E-Commerce Solutions", description: "Full online stores with product catalogs, secure checkout, and inventory management.", provider: { "@type": "Organization", name: "OphidianAI" } },
    { "@type": "Service", position: 3, name: "Search Engine Optimization", description: "Get found on Google with technical SEO, keyword research, and ongoing optimization.", provider: { "@type": "Organization", name: "OphidianAI" } },
  ],
};

/* Monitor icon */
const iconMonitor = (
  <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-12 w-12">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
  </svg>
);

/* Shopping cart icon */
const iconCart = (
  <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-12 w-12">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
  </svg>
);

/* Search/magnifying glass icon */
const iconSearch = (
  <svg key="3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-12 w-12">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const serviceIcons = [iconMonitor, iconCart, iconSearch];

const defaultServices = [
  {
    title: "Custom Web Design",
    description: "Modern, mobile-first websites built to convert visitors into customers. Every site we deliver is designed around your brand, optimized for search engines, and deployed on fast, secure hosting. No templates -- everything is custom.",
    bullets: ["Up to 10 pages", "Mobile-first responsive design", "On-page SEO included", "Deployed on fast secure hosting"],
  },
  {
    title: "E-Commerce Solutions",
    description: "Full online stores that make it easy for customers to browse, buy, and come back. We handle everything from product catalog setup to secure Stripe checkout integration, so you can focus on running your business.",
    bullets: ["Product catalog with categories", "Secure Stripe checkout", "Order notifications", "Inventory management"],
  },
  {
    title: "Search Engine Optimization",
    description: "Get found on Google by the customers already searching for what you offer. We start with a free audit to identify quick wins, then build a long-term strategy around keyword research, content optimization, and local SEO.",
    bullets: ["Free SEO audit", "Google Business Profile optimization", "Keyword research and tracking", "Monthly performance reports"],
  },
];

const capabilityIcons = [
  <svg key="c1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>,
  <svg key="c2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>,
  <svg key="c3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>,
  <svg key="c4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" /></svg>,
];

const defaultCapabilities = [
  { title: "AI-Assisted Copywriting", description: "Professional website copy written with AI assistance, tailored to your brand voice and optimized for conversions and search engines." },
  { title: "Performance Optimized", description: "Every site scores 90+ on Google PageSpeed. Fast load times mean better rankings and fewer lost visitors." },
  { title: "Analytics Dashboard", description: "Know exactly how your site is performing with built-in analytics tracking visitors, conversions, and top-performing pages." },
  { title: "Ongoing Support", description: "Optional monthly maintenance keeps your site secure, updated, and running smoothly. Content updates included." },
];

export default function ServicesPage() {
  const content = usePageContent("services");
  const { isEditMode } = useEditMode();

  return (
    <PageWrapper>
      <JsonLd data={serviceSchema} />
      <div className="grain">
        <section className="py-24 md:py-32">
          <Container width="default">
            <div className="space-y-32">
              {defaultServices.map((service, i) => {
                const isReversed = i % 2 !== 0;
                const si = i + 1;
                return (
                  <div key={i} className={`flex flex-col items-center gap-12 lg:gap-16 ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} animate-fade-up`}>
                    <div className="w-full lg:w-1/2 shrink-0">
                      <GlowCard className="glass relative aspect-[4/3] rounded-2xl overflow-hidden flex items-center justify-center border border-primary/10">
                        {content[`service_${si}_image`] || isEditMode ? (
                          <EditableImage
                            page="services"
                            contentKey={`service_${si}_image`}
                            defaultSrc={`/images/services/service-${si}-placeholder.png`}
                            dbValue={content[`service_${si}_image`]}
                            alt={service.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="text-primary/30">{serviceIcons[i]}</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
                      </GlowCard>
                    </div>
                    <div className="w-full lg:w-1/2">
                      {isEditMode ? (
                        <>
                          <EditableText page="services" contentKey={`service_${si}_title`} defaultValue={service.title} dbValue={content[`service_${si}_title`]} as="h3" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4" />
                          <EditableText page="services" contentKey={`service_${si}_desc`} defaultValue={service.description} dbValue={content[`service_${si}_desc`]} as="p" className="text-foreground-muted mb-6" />
                        </>
                      ) : (
                        <>
                          <Heading level={3} gradient className="mb-4">{content[`service_${si}_title`] || service.title}</Heading>
                          <Text variant="body" className="mb-6">{content[`service_${si}_desc`] || service.description}</Text>
                        </>
                      )}
                      <ul className="space-y-3 mb-8">
                        {service.bullets.map((bullet, bi) => (
                          <li key={bi} className="flex items-start gap-3 text-foreground-muted">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 mt-0.5 shrink-0 text-primary"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                            {isEditMode ? (
                              <EditableText page="services" contentKey={`service_${si}_bullet_${bi + 1}`} defaultValue={bullet} dbValue={content[`service_${si}_bullet_${bi + 1}`]} as="span" className="text-sm" />
                            ) : (
                              <span className="text-sm">{content[`service_${si}_bullet_${bi + 1}`] || bullet}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                      <GlassButton size="default" href="/contact">Learn More</GlassButton>
                    </div>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>

        {isEditMode ? (
          <section className="py-24 md:py-32">
            <Container width="default">
              <div className="mb-16 max-w-2xl">
                <EditableText page="services" contentKey="capabilities_heading" defaultValue="Additional Capabilities" dbValue={content["capabilities_heading"]} as="h2" className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" />
                <EditableText page="services" contentKey="capabilities_subtitle" defaultValue="Every website we build comes with these capabilities included." dbValue={content["capabilities_subtitle"]} as="p" className="mt-4 text-lg text-foreground-muted" />
              </div>
              <div className="grid gap-8 md:grid-cols-2">
                {defaultCapabilities.map((cap, i) => (
                  <div key={i} className="glass rounded-2xl border border-primary/10 p-8">
                    <div className="text-primary mb-4">{capabilityIcons[i]}</div>
                    <EditableText page="services" contentKey={`capability_${i + 1}_title`} defaultValue={cap.title} dbValue={content[`capability_${i + 1}_title`]} as="h3" className="text-lg font-semibold text-foreground mb-2" />
                    <EditableText page="services" contentKey={`capability_${i + 1}_desc`} defaultValue={cap.description} dbValue={content[`capability_${i + 1}_desc`]} as="p" className="text-foreground-muted text-sm" />
                  </div>
                ))}
              </div>
            </Container>
          </section>
        ) : (
          <FeaturesGrid
            heading={content["capabilities_heading"] || "Additional Capabilities"}
            subtitle={content["capabilities_subtitle"] || "Every website we build comes with these capabilities included."}
            features={defaultCapabilities.map((cap, i) => ({
              icon: capabilityIcons[i],
              title: content[`capability_${i + 1}_title`] || cap.title,
              description: content[`capability_${i + 1}_desc`] || cap.description,
            }))}
          />
        )}

        {isEditMode ? (
          <section className="py-20 md:py-24 relative overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/5" />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
              <EditableText page="services" contentKey="cta_headline" defaultValue="See Our Pricing" dbValue={content["cta_headline"]} as="h2" className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4" />
              <EditableText page="services" contentKey="cta_subtitle" defaultValue="Transparent pricing for every budget. No hidden fees, no long-term contracts." dbValue={content["cta_subtitle"]} as="p" className="text-lg text-foreground-muted mb-8 max-w-xl mx-auto" />
            </div>
          </section>
        ) : (
          <CTABanner
            headline={content["cta_headline"] || "See Our Pricing"}
            subtitle={content["cta_subtitle"] || "Transparent pricing for every budget. No hidden fees, no long-term contracts."}
            cta={{ label: content["cta_label"] || "View Pricing", href: "/pricing" }}
          />
        )}
      </div>
    </PageWrapper>
  );
}
