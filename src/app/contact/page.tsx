"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { ContactForm } from "@/components/sections/ContactForm";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { usePageContent } from "@/lib/use-page-content";
import { EditableText } from "@/components/editable/editable-text";
import { useEditMode } from "@/lib/edit-mode-context";

export default function ContactPage() {
  const content = usePageContent("contact");
  const { isEditMode } = useEditMode();

  const e = (key: string, fallback: string) => content[key] || fallback;

  return (
    <PageWrapper>
      <section className="pb-24 md:pb-32">
        <Container width="default">
          <div className="grid gap-12 lg:grid-cols-5 items-start">
            <div className="lg:col-span-3">
              <ContactForm
                heading={e("contact_heading", "Send Us a Message")}
                subtitle={e("contact_subtitle", "Tell us about your project and we'll get back to you with a plan.")}
              />
            </div>

            <div className="lg:col-span-2 lg:mt-[19.5rem]">
              <Card>
                <Heading level={3} className="mb-6 text-lg font-semibold">
                  Contact Information
                </Heading>

                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5 mt-0.5 shrink-0 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                    <div>
                      <Text variant="label" className="mb-1">Email</Text>
                      {isEditMode ? (
                        <EditableText page="contact" contentKey="contact_email" defaultValue="eric.lefler@ophidianai.com" dbValue={content["contact_email"]} as="span" className="text-foreground" />
                      ) : (
                        <a href={`mailto:${e("contact_email", "eric.lefler@ophidianai.com")}`} className="text-foreground hover:text-primary transition-colors">
                          {e("contact_email", "eric.lefler@ophidianai.com")}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5 mt-0.5 shrink-0 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    <div>
                      <Text variant="label" className="mb-1">Location</Text>
                      {isEditMode ? (
                        <EditableText page="contact" contentKey="contact_location" defaultValue="Columbus, Indiana" dbValue={content["contact_location"]} as="p" className="text-foreground" />
                      ) : (
                        <Text variant="body" className="!text-foreground">{e("contact_location", "Columbus, Indiana")}</Text>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5 mt-0.5 shrink-0 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <div>
                      <Text variant="label" className="mb-1">Response Time</Text>
                      {isEditMode ? (
                        <EditableText page="contact" contentKey="contact_response_time" defaultValue="We respond within 24 hours" dbValue={content["contact_response_time"]} as="p" className="text-foreground" />
                      ) : (
                        <Text variant="body" className="!text-foreground">{e("contact_response_time", "We respond within 24 hours")}</Text>
                      )}
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
