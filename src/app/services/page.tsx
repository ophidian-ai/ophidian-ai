import { PageWrapper } from "@/components/layout/PageWrapper";
import { FeaturesGrid } from "@/components/sections/FeaturesGrid";
import { CTABanner } from "@/components/sections/CTABanner";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/JsonLd";

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: [
    {
      "@type": "Service",
      position: 1,
      name: "AI Assistants & Chatbots",
      description:
        "Custom conversational AI for customer support, lead qualification, and internal operations.",
      provider: { "@type": "Organization", name: "OphidianAI" },
    },
    {
      "@type": "Service",
      position: 2,
      name: "Workflow Automation",
      description:
        "Connect tools and automate repetitive processes with intelligent automation.",
      provider: { "@type": "Organization", name: "OphidianAI" },
    },
    {
      "@type": "Service",
      position: 3,
      name: "Custom AI Integrations",
      description:
        "AI solutions built on your proprietary data, plugged into your existing tech stack.",
      provider: { "@type": "Organization", name: "OphidianAI" },
    },
  ],
};

const services = [
  {
    title: "AI Assistants & Chatbots",
    description:
      "Your customers expect instant answers. Your team needs to focus on high-value work. Custom conversational AI bridges that gap -- handling customer support, qualifying leads, and streamlining internal operations around the clock. We build assistants that understand your business, speak your brand voice, and get smarter with every interaction.",
    bullets: [
      "Customer-facing support bots that resolve issues without escalation",
      "Internal assistants for HR, IT, and operations workflows",
      "Sales copilots that qualify leads and book meetings automatically",
      "Multi-channel deployment across web, Slack, Teams, and SMS",
    ],
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-12 w-12"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
        />
      </svg>
    ),
  },
  {
    title: "Workflow Automation",
    description:
      "Manual data entry, copy-pasting between tools, and repetitive reporting drain your team's time and introduce errors. We connect your existing tools with intelligent automation that moves data, triggers actions, and handles the busywork -- so your team can focus on decisions, not data wrangling.",
    bullets: [
      "CRM, ERP, and accounting system integrations",
      "Automated report generation and distribution",
      "Intelligent document routing and approval workflows",
      "Email parsing, data extraction, and auto-filing",
    ],
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-12 w-12"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      </svg>
    ),
  },
  {
    title: "Custom AI Integrations",
    description:
      "Off-the-shelf AI tools only go so far. When you need AI that fits your exact processes, data, and competitive advantage, we build it. From fine-tuned models to custom pipelines, we engineer AI solutions that plug directly into your existing tech stack and deliver measurable results.",
    bullets: [
      "AI pipelines built on your proprietary data and workflows",
      "Integration with any API, database, or SaaS platform",
      "Fine-tuned models for domain-specific accuracy",
      "Scalable architecture that grows with your business",
    ],
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-12 w-12"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"
        />
      </svg>
    ),
  },
];

export default function ServicesPage() {
  return (
    <PageWrapper>
      <JsonLd data={serviceSchema} />
      <div className="grain">
        <section className="py-24 md:py-32">
          <Container width="default">
            <div className="space-y-32">
              {services.map((service, i) => {
                const isReversed = i % 2 !== 0;
                return (
                  <div
                    key={service.title}
                    className={`flex flex-col items-center gap-12 lg:gap-16 ${
                      isReversed ? "lg:flex-row-reverse" : "lg:flex-row"
                    } animate-fade-up`}
                  >
                    {/* Image placeholder */}
                    <div className="w-full lg:w-1/2 shrink-0">
                      <div className="glass relative aspect-[4/3] rounded-2xl overflow-hidden flex items-center justify-center border border-primary/10">
                        <div className="text-primary/30">{service.icon}</div>
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="w-full lg:w-1/2">
                      <Heading level={3} gradient className="mb-4">
                        {service.title}
                      </Heading>
                      <Text variant="body" className="mb-6">
                        {service.description}
                      </Text>
                      <ul className="space-y-3 mb-8">
                        {service.bullets.map((bullet) => (
                          <li
                            key={bullet}
                            className="flex items-start gap-3 text-foreground-muted"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              className="h-5 w-5 mt-0.5 shrink-0 text-primary"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m4.5 12.75 6 6 9-13.5"
                              />
                            </svg>
                            <span className="text-sm">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                      <Button variant="secondary" size="md" href="/contact">
                        Learn More
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>

        <FeaturesGrid
          heading="Additional Capabilities"
          subtitle="Every integration we build comes backed by a full suite of supporting capabilities."
          features={[
            {
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
              ),
              title: "Document Processing",
              description:
                "Extract, classify, and route documents automatically. Turn invoices, contracts, and forms into structured data your systems can act on.",
            },
            {
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                  />
                </svg>
              ),
              title: "Analytics & Insights",
              description:
                "AI-powered dashboards that surface trends, flag anomalies, and deliver the insights your team needs to make faster, smarter decisions.",
            },
            {
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                  />
                </svg>
              ),
              title: "API Integrations",
              description:
                "Connect any SaaS tool, database, or third-party service. We build the bridges between your systems so data flows where it needs to go.",
            },
            {
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                  />
                </svg>
              ),
              title: "Training & Support",
              description:
                "Every integration includes hands-on training for your team and ongoing support. We make sure your people are confident and your AI keeps performing.",
            },
          ]}
        />

        <CTABanner
          headline="Find the right plan for your team"
          subtitle="Predictable monthly pricing with no long-term contracts. Scale up or down as your needs evolve."
          cta={{ label: "View Pricing", href: "/pricing" }}
        />
      </div>
    </PageWrapper>
  );
}
