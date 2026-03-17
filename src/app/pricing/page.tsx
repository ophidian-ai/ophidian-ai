"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { CTABanner } from "@/components/sections/CTABanner";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { GlassButton } from "@/components/ui/glass-button";
import { GlowCard } from "@/components/ui/spotlight-card";
import { usePageContent } from "@/lib/use-page-content";
import { useEditMode } from "@/lib/edit-mode-context";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/* Web Design Plans                                                    */
/* ------------------------------------------------------------------ */

const webPlans = [
  {
    name: "Starter",
    price: "$2,200 - $2,500",
    description: "A clean, professional website to establish your online presence.",
    features: [
      "Up to 5 pages",
      "Mobile-first responsive design",
      "Basic on-page SEO",
      "Contact form integration",
      "2 rounds of revisions",
      "1-2 week delivery",
    ],
    cta: "Get Started",
    href: "/contact?service=web_starter",
    popular: false,
  },
  {
    name: "Professional",
    price: "$3,500 - $4,000",
    description: "A full-featured website with copywriting, SEO, and unlimited revisions.",
    features: [
      "Up to 10 pages",
      "Full on-page SEO",
      "AI-assisted copywriting included",
      "Analytics dashboard",
      "Unlimited revisions",
      "2-3 week delivery",
    ],
    cta: "Get Started",
    href: "/contact?service=web_professional",
    popular: true,
  },
  {
    name: "E-Commerce",
    price: "$4,500 - $6,000",
    description: "Everything in Professional plus a full online store.",
    features: [
      "Everything in Professional",
      "Product catalog with categories",
      "Secure Stripe checkout",
      "Order notifications",
      "Inventory management",
      "3-4 week delivery",
    ],
    cta: "Get a Quote",
    href: "/contact?service=web_ecommerce",
    popular: false,
  },
];

/* ------------------------------------------------------------------ */
/* SEO Services                                                        */
/* ------------------------------------------------------------------ */

const seoServices = [
  {
    name: "SEO Audit",
    price: "Free",
    description: "A comprehensive audit of your current website and search presence.",
    features: [
      "Technical SEO analysis",
      "Keyword gap assessment",
      "Competitor benchmarking",
      "Actionable recommendations",
    ],
    cta: "Request Free Audit",
    href: "/contact?service=seo_audit",
  },
  {
    name: "SEO Cleanup",
    price: "$400 - $1,200",
    description: "One-time fixes to resolve technical SEO issues and improve rankings.",
    features: [
      "Meta tag optimization",
      "Page speed improvements",
      "Broken link repair",
      "Schema markup setup",
    ],
    cta: "Get a Quote",
    href: "/contact?service=seo_cleanup",
  },
  {
    name: "SEO Growth",
    price: "$200 - $350/mo",
    description: "Ongoing optimization with keyword tracking and monthly reporting. 3-month minimum.",
    features: [
      "Keyword tracking and research",
      "Monthly content updates",
      "Google Business Profile management",
      "Monthly performance reports",
    ],
    cta: "Subscribe",
    href: "/checkout?plan=seo_growth",
  },
];

/* ------------------------------------------------------------------ */
/* Add-ons                                                             */
/* ------------------------------------------------------------------ */

const addOns = [
  { name: "Additional Pages", price: "$200 - $400/page" },
  { name: "Blog Setup", price: "$300 - $500" },
  { name: "Booking Integration", price: "$300 - $500" },
  { name: "Logo Design", price: "$300 - $500" },
];

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

const defaultFaqItems = [
  { question: "How long does it take to build a website?", answer: "Most websites are delivered in 1-3 weeks depending on the plan. Starter sites typically take 1-2 weeks, Professional sites 2-3 weeks, and E-Commerce sites 3-4 weeks. We will give you a firm timeline during our initial call." },
  { question: "What do I need to provide?", answer: "At minimum, your logo, brand colors, and any existing content you want included. If you choose the Professional or E-Commerce plan, we handle copywriting for you -- just tell us about your business and we will take it from there." },
  { question: "Do I own the website when it is done?", answer: "Yes. You own 100% of the code, content, and design. We deploy on Vercel (free hosting tier), and you can transfer or self-host at any time." },
  { question: "What is included in monthly maintenance?", answer: "Maintenance covers hosting, SSL certificates, security monitoring, uptime checks, and minor content updates (text changes, image swaps, etc.). It does not include major redesigns or new page builds -- those are quoted separately." },
  { question: "Can I cancel maintenance at any time?", answer: "Yes. Maintenance is month-to-month with no long-term contracts. Cancel anytime with 30 days notice. Your site stays live -- you just handle updates yourself." },
  { question: "What makes the SEO audit free?", answer: "We use the audit to show you exactly where your site stands and where the opportunities are. There is no obligation to buy anything after the audit. If you want help implementing the recommendations, we will quote that separately." },
  { question: "What is included in the AI Growth plan setup fee?", answer: "The setup fee covers onboarding your business data (FAQs, services, pricing, brand voice), configuring integrations, building your AI chatbot knowledge base, and initial content calendar creation. It is a one-time cost." },
  { question: "Can I buy AI products individually?", answer: "Yes. Every AI product is available a la carte at standalone pricing. However, our tier plans offer significant savings -- the Growth plan at $497/mo includes over $1,200 worth of standalone services." },
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  const content = usePageContent("pricing");
  const { isEditMode } = useEditMode();

  const resolvedFaqItems = defaultFaqItems.map((item, i) => ({
    question: content[`pricing_faq_${i + 1}_q`] || item.question,
    answer: content[`pricing_faq_${i + 1}_a`] || item.answer,
  }));

  return (
    <PageWrapper>
      <div className="grain">
        {/* ---- Web Design Plans ---- */}
        <section className="relative py-20 overflow-x-hidden">
          <div className="text-center mb-12 max-w-3xl mx-auto space-y-4 px-4">
            <Heading level={2} gradient>Web Design Plans</Heading>
            <Text variant="lead">One-time pricing. No subscriptions, no hidden fees.</Text>
          </div>

          <div className="grid md:grid-cols-3 max-w-5xl gap-6 py-6 mx-auto px-4 items-start">
            {webPlans.map((plan) => (
              <GlowCard
                key={plan.name}
                className={`relative text-foreground glass rounded-2xl border p-8 ${
                  plan.popular
                    ? "shadow-[0px_-8px_60px_0px_rgba(57,255,20,0.3)] z-20 border-primary/30"
                    : "border-primary/10 z-10"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-semibold">{plan.name}</h3>
                  {plan.popular && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-3xl font-bold text-foreground mb-2">{plan.price}</p>
                <p className="text-sm text-foreground-muted mb-6">{plan.description}</p>

                <GlassButton size="lg" href={plan.href} className="w-full mb-6">
                  {plan.cta}
                </GlassButton>

                <div className="space-y-3 pt-4 border-t border-primary/10">
                  <h4 className="font-medium text-base mb-3">Includes:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, fi) => (
                      <li key={fi} className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 bg-primary/50 rounded-full flex-shrink-0" />
                        <span className="text-sm text-foreground-muted">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </GlowCard>
            ))}
          </div>
        </section>

        {/* ---- Maintenance Note ---- */}
        <section className="pb-12 px-4">
          <Container width="default">
            <div className="glass rounded-2xl border border-primary/10 p-8 text-center max-w-3xl mx-auto">
              <Text variant="body" className="text-foreground-muted">
                All websites include optional monthly maintenance: <strong className="text-foreground">$100/mo</strong> for Starter and Professional, <strong className="text-foreground">$150/mo</strong> for E-Commerce. Covers hosting, security, and minor content updates.
              </Text>
            </div>
          </Container>
        </section>

        {/* ---- SEO Services ---- */}
        <section className="relative py-20 overflow-x-hidden">
          <div className="text-center mb-12 max-w-3xl mx-auto space-y-4 px-4">
            <Heading level={2} gradient>SEO Services</Heading>
            <Text variant="lead">Get found on Google. Start with a free audit.</Text>
          </div>

          <div className="grid md:grid-cols-3 max-w-5xl gap-6 py-6 mx-auto px-4 items-start">
            {seoServices.map((service) => (
              <GlowCard
                key={service.name}
                className="relative text-foreground glass rounded-2xl border border-primary/10 p-8"
              >
                <h3 className="text-2xl font-semibold mb-2">{service.name}</h3>
                <p className="text-3xl font-bold text-foreground mb-2">{service.price}</p>
                <p className="text-sm text-foreground-muted mb-6">{service.description}</p>

                <GlassButton size="lg" href={service.href} className="w-full mb-6">
                  {service.cta}
                </GlassButton>

                <div className="space-y-3 pt-4 border-t border-primary/10">
                  <h4 className="font-medium text-base mb-3">Includes:</h4>
                  <ul className="space-y-2">
                    {service.features.map((feature, fi) => (
                      <li key={fi} className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 bg-primary/50 rounded-full flex-shrink-0" />
                        <span className="text-sm text-foreground-muted">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </GlowCard>
            ))}
          </div>
        </section>

        {/* ---- AI Growth Tiers ---- */}
        <section className="relative py-20 overflow-x-hidden">
          <div className="text-center mb-12 max-w-3xl mx-auto space-y-4 px-4">
            <Heading level={2} gradient>AI Growth Plans</Heading>
            <Text variant="lead">Recurring AI services that grow your business month after month.</Text>
          </div>

          <div className="grid md:grid-cols-3 max-w-5xl gap-6 py-6 mx-auto px-4 items-start">
            {[
              {
                name: "Essentials",
                price: "$297/mo",
                setup: "$500 setup",
                description: "AI chatbot, content, and SEO reporting to jumpstart your digital presence.",
                features: [
                  "AI chatbot (website)",
                  "4 blog posts + 12 social posts/mo",
                  "Monthly SEO audit & report",
                  "Monthly analytics PDF",
                ],
                cta: "Get Started",
                href: "/contact?service=ai_essentials",
                popular: false,
              },
              {
                name: "Growth",
                price: "$497/mo",
                setup: "$1,000 setup",
                description: "Managed SEO, email campaigns, and review management to accelerate growth.",
                features: [
                  "Everything in Essentials, plus:",
                  "Advanced chatbot (website + 1 channel)",
                  "8 blogs + 20 social posts/mo",
                  "Managed SEO with optimization",
                  "2 email campaigns/mo",
                  "Review monitoring + AI responses",
                  "Live analytics dashboard",
                ],
                cta: "Get Started",
                href: "/contact?service=ai_growth",
                popular: true,
              },
              {
                name: "Pro",
                price: "$797/mo",
                setup: "$1,500 setup",
                description: "Full-service AI growth with ads, CRM, and content strategy.",
                features: [
                  "Everything in Growth, plus:",
                  "Multi-channel chatbot",
                  "12 blogs + 30 social + video scripts",
                  "Full SEO + content strategy",
                  "4 email campaigns + automations",
                  "Review generation campaigns",
                  "Google + Meta ad management",
                  "CRM pipeline + lead scoring",
                  "Dashboard + AI-written insights",
                ],
                cta: "Get Started",
                href: "/contact?service=ai_pro",
                popular: false,
              },
            ].map((plan) => (
              <GlowCard
                key={plan.name}
                className={`relative text-foreground glass rounded-2xl border p-8 ${
                  plan.popular
                    ? "shadow-[0px_-8px_60px_0px_rgba(57,255,20,0.3)] z-20 border-primary/30"
                    : "border-primary/10 z-10"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-semibold">{plan.name}</h3>
                  {plan.popular && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-3xl font-bold text-foreground mb-1">{plan.price}</p>
                <p className="text-xs text-foreground-muted mb-2">{plan.setup}</p>
                <p className="text-sm text-foreground-muted mb-6">{plan.description}</p>

                <GlassButton size="lg" href={plan.href} className="w-full mb-6">
                  {plan.cta}
                </GlassButton>

                <div className="space-y-3 pt-4 border-t border-primary/10">
                  <h4 className="font-medium text-base mb-3">Includes:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, fi) => (
                      <li key={fi} className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 bg-primary/50 rounded-full shrink-0" />
                        <span className="text-sm text-foreground-muted">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </GlowCard>
            ))}
          </div>

          {/* A la carte note */}
          <div className="max-w-3xl mx-auto mt-8 px-4 text-center">
            <Text variant="small">
              Need just one product? All AI services are available{" "}
              <Link href="/services" className="text-primary hover:underline">a la carte</Link>.
            </Text>
          </div>
        </section>

        {/* ---- Add-ons ---- */}
        <section className="pb-20 px-4">
          <Container width="default">
            <div className="text-center mb-8">
              <Heading level={3} gradient>Add-ons</Heading>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 max-w-4xl gap-4 mx-auto">
              {addOns.map((addon) => (
                <div key={addon.name} className="glass rounded-xl border border-primary/10 p-6 text-center">
                  <p className="font-semibold text-foreground mb-1">{addon.name}</p>
                  <p className="text-sm text-primary">{addon.price}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ---- FAQ ---- */}
        {isEditMode ? (
          <section className="py-24 md:py-32">
            <Container width="default">
              <div className="mb-16 max-w-2xl">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {content["pricing_faq_heading"] || "Frequently Asked Questions"}
                </h2>
                <p className="mt-4 text-lg text-foreground-muted">
                  {content["pricing_faq_subtitle"] || "Everything you need to know about our web design, SEO, and AI growth services."}
                </p>
              </div>
              <div className="space-y-6 max-w-3xl">
                {defaultFaqItems.map((item, i) => (
                  <div key={i} className="glass rounded-xl border border-primary/10 p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      {content[`pricing_faq_${i + 1}_q`] || item.question}
                    </h3>
                    <p className="text-foreground-muted text-sm">
                      {content[`pricing_faq_${i + 1}_a`] || item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </Container>
          </section>
        ) : (
          <FAQAccordion
            heading={content["pricing_faq_heading"] || "Frequently Asked Questions"}
            subtitle={content["pricing_faq_subtitle"] || "Everything you need to know about our web design, SEO, and AI growth services."}
            items={resolvedFaqItems}
          />
        )}

        {/* ---- CTA ---- */}
        <CTABanner
          headline="Ready to get started?"
          subtitle="Book a free discovery call and we will outline a plan for your business."
          cta={{ label: "Contact Us", href: "/contact" }}
        />
      </div>
    </PageWrapper>
  );
}
