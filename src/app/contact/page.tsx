import { PageWrapper } from "@/components/layout/PageWrapper";
import { HeroSimple } from "@/components/sections/HeroSimple";
import { ContactForm } from "@/components/sections/ContactForm";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";

export default function ContactPage() {
  return (
    <PageWrapper>
      <HeroSimple
        title="Get in Touch"
        subtitle="Have a project in mind or want to explore what AI can do for your business? We'd love to hear from you."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Contact", href: "/contact" },
        ]}
      />

      {/* Two-column layout: form + contact info */}
      <section className="pb-24 md:pb-32">
        <Container width="default">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* Left: Contact form */}
            <div className="lg:col-span-3">
              <ContactForm
                heading="Send Us a Message"
                subtitle="Tell us about your project and we'll get back to you with a plan."
              />
            </div>

            {/* Right: Contact info */}
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <Heading level={3} className="mb-6 text-lg font-semibold">
                  Contact Information
                </Heading>

                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="h-5 w-5 mt-0.5 shrink-0 text-primary"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                      />
                    </svg>
                    <div>
                      <Text variant="label" className="mb-1">
                        Email
                      </Text>
                      <a
                        href="mailto:eric.lefler@ophidianai.com"
                        className="text-foreground hover:text-primary transition-colors"
                      >
                        eric.lefler@ophidianai.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="h-5 w-5 mt-0.5 shrink-0 text-primary"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                      />
                    </svg>
                    <div>
                      <Text variant="label" className="mb-1">
                        Location
                      </Text>
                      <Text variant="body" className="!text-foreground">
                        Columbus, Indiana
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="h-5 w-5 mt-0.5 shrink-0 text-primary"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                    <div>
                      <Text variant="label" className="mb-1">
                        Response Time
                      </Text>
                      <Text variant="body" className="!text-foreground">
                        We respond within 24 hours
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

    </PageWrapper>
  );
}
