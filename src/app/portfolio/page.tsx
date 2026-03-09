import { PageWrapper } from "@/components/layout/PageWrapper";
import { CTABanner } from "@/components/sections/CTABanner";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function PortfolioPage() {
  return (
    <PageWrapper>
      <div className="grain">
        <section className="py-24 md:py-32">
          <Container width="default">
            <div className="glass rounded-2xl overflow-hidden border border-primary/10 animate-fade-up">
              <div className="relative aspect-video bg-surface border-b border-primary/10 overflow-hidden">
                <img
                  src="/images/portfolio/bloomin-acres-homepage.png"
                  alt="Bloomin' Acres website homepage showing the bakery's menu and ordering system"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* Content */}
              <div className="p-8 md:p-12">
                <Badge variant="default" className="mb-4">
                  Website Design
                </Badge>

                <Heading level={2} gradient className="mb-4">
                  Bloomin&apos; Acres
                </Heading>

                <Text variant="body" className="mb-8 max-w-3xl">
                  A full-featured e-commerce website for a local sourdough
                  bakery and fresh produce business. Built with a custom design
                  system, Stripe payments, Supabase backend, and automated menu
                  management.
                </Text>

                {/* Key results */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  {[
                    { metric: "6", label: "Pages built" },
                    {
                      metric: "Stripe + Supabase",
                      label: "Integrated",
                    },
                    { metric: "100%", label: "Mobile-responsive" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg bg-surface-hover/50 border border-primary/5 p-4 text-center"
                    >
                      <div className="text-xl font-semibold text-primary mb-1">
                        {item.metric}
                      </div>
                      <Text variant="small">{item.label}</Text>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* More projects coming soon */}
        <section className="py-24 md:py-32">
          <Container width="narrow">
            <div className="text-center animate-fade-up">
              <Heading level={3} gradient className="mb-4">
                More projects coming soon
              </Heading>
              <Text variant="body" className="mb-8">
                OphidianAI is an early-stage agency, and we are actively
                building our portfolio. We are currently taking on new clients
                -- if you have a project in mind, we would love to hear about
                it.
              </Text>
              <Button variant="primary" size="lg" href="/contact">
                Start a Project
              </Button>
            </div>
          </Container>
        </section>

        <CTABanner
          headline="Ready to build something great?"
          subtitle="Let's talk about your project. No contracts, no pressure -- just a conversation about what you need."
          cta={{ label: "Get in Touch", href: "/contact" }}
        />
      </div>
    </PageWrapper>
  );
}
