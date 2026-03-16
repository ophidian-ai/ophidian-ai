"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { CTABanner } from "@/components/sections/CTABanner";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { usePageContent } from "@/lib/use-page-content";
import { EditableText } from "@/components/editable/editable-text";
import { EditableImage } from "@/components/editable/editable-image";
import { useEditMode } from "@/lib/edit-mode-context";

const defaultValues = [
  { title: "No Black Boxes", description: "We explain every decision, every integration, every result. You'll always know what your AI is doing and why." },
  { title: "Speed Over Perfection", description: "Ship fast, iterate, deliver value in weeks not months. Progress beats polish when you're trying to move the needle." },
  { title: "Your Stack, Our AI", description: "We integrate with what you already use, not force new tools on your team. Your workflows stay intact -- they just get smarter." },
];

const defaultSteps = [
  { title: "Discovery Call", description: "We learn your business, your tools, and your pain points. No questionnaires or intake forms -- just a conversation about what's slowing you down." },
  { title: "Scope & Proposal", description: "Within days, you get a clear proposal outlining exactly what we'll build, how long it'll take, and what it'll cost. No surprises." },
  { title: "Build & Iterate", description: "We build in short cycles with regular check-ins. You see progress every week, not just at the end. Feedback gets incorporated immediately." },
  { title: "Launch & Support", description: "We deploy, train your team, and stick around to make sure everything runs smoothly. Ongoing support keeps your integrations performing as your business evolves." },
];

const defaultAbout = {
  heading: "Why We Exist",
  p1: "AI is transforming how businesses operate -- but most companies don't know where to start. They're buried in vendor pitches, overwhelmed by options, and skeptical of promises that sound too good to be true.",
  p2: "OphidianAI exists to bridge that gap. We cut through the noise, identify the automations and integrations that will actually impact your bottom line, and build them into your existing workflows. No rip-and-replace. No six-month discovery phases. Just practical AI that works.",
  p3: "We're not here to sell you a vision of the future. We're here to make your business faster, leaner, and more capable today.",
  founder_name: "Eric Lefler",
  founder_title: "Founder, OphidianAI",
  founder_heading: "Meet the Founder",
  founder_p1: "Eric Lefler started OphidianAI with a simple thesis: small and mid-size businesses deserve the same AI capabilities that enterprise companies take for granted -- without the enterprise price tag or complexity.",
  founder_p2: "Based in Columbus, Indiana, Eric builds every integration hands-on. That means direct communication, fast turnarounds, and solutions shaped by someone who understands both the technology and the business problems it needs to solve.",
};

export default function AboutPage() {
  const content = usePageContent("about");
  const { isEditMode } = useEditMode();

  const e = (key: string, fallback: string) => content[key] || fallback;

  return (
    <PageWrapper>
      <div className="grain">
        <section className="py-24 md:py-32">
          <Container width="default">
            <div className="flex flex-col items-start gap-8 sm:gap-12 lg:flex-row lg:gap-16 animate-fade-up">
              <div className="w-full lg:w-1/2">
                {isEditMode ? (
                  <>
                    <EditableText page="about" contentKey="heading" defaultValue={defaultAbout.heading} dbValue={content["heading"]} as="h2" className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6" />
                    <EditableText page="about" contentKey="p1" defaultValue={defaultAbout.p1} dbValue={content["p1"]} as="p" className="text-foreground-muted mb-4" />
                    <EditableText page="about" contentKey="p2" defaultValue={defaultAbout.p2} dbValue={content["p2"]} as="p" className="text-foreground-muted mb-4" />
                    <EditableText page="about" contentKey="p3" defaultValue={defaultAbout.p3} dbValue={content["p3"]} as="p" className="text-foreground-muted" />
                  </>
                ) : (
                  <>
                    <Heading level={2} gradient className="mb-6">{e("heading", defaultAbout.heading)}</Heading>
                    <Text variant="body" className="mb-4">{e("p1", defaultAbout.p1)}</Text>
                    <Text variant="body" className="mb-4">{e("p2", defaultAbout.p2)}</Text>
                    <Text variant="body">{e("p3", defaultAbout.p3)}</Text>
                  </>
                )}
              </div>
              <div className="w-full lg:w-1/2">
                <div className="glass relative aspect-[4/3] rounded-2xl overflow-hidden flex items-center justify-center border border-primary/10 bg-surface">
                  {content["founder_image"] || isEditMode ? (
                    <EditableImage
                      page="about"
                      contentKey="founder_image"
                      defaultSrc="/images/about/founder-placeholder.png"
                      dbValue={content["founder_image"]}
                      alt="Eric Lefler, Founder of OphidianAI"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-24 w-24 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                        <span className="text-4xl font-bold text-primary font-mono">EL</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-center z-10">
                    {isEditMode ? (
                      <>
                        <EditableText page="about" contentKey="founder_name" defaultValue={defaultAbout.founder_name} dbValue={content["founder_name"]} as="p" className="text-white font-semibold" />
                        <EditableText page="about" contentKey="founder_title" defaultValue={defaultAbout.founder_title} dbValue={content["founder_title"]} as="p" className="text-white/70 text-sm" />
                      </>
                    ) : (
                      <>
                        <p className="text-white font-semibold">{e("founder_name", defaultAbout.founder_name)}</p>
                        <p className="text-white/70 text-sm">{e("founder_title", defaultAbout.founder_title)}</p>
                      </>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="mt-16 max-w-3xl animate-fade-up">
              {isEditMode ? (
                <>
                  <EditableText page="about" contentKey="founder_heading" defaultValue={defaultAbout.founder_heading} dbValue={content["founder_heading"]} as="h3" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4" />
                  <EditableText page="about" contentKey="founder_p1" defaultValue={defaultAbout.founder_p1} dbValue={content["founder_p1"]} as="p" className="text-foreground-muted mb-4" />
                  <EditableText page="about" contentKey="founder_p2" defaultValue={defaultAbout.founder_p2} dbValue={content["founder_p2"]} as="p" className="text-foreground-muted" />
                </>
              ) : (
                <>
                  <Heading level={3} gradient className="mb-4">{e("founder_heading", defaultAbout.founder_heading)}</Heading>
                  <Text variant="body" className="mb-4">{e("founder_p1", defaultAbout.founder_p1)}</Text>
                  <Text variant="body">{e("founder_p2", defaultAbout.founder_p2)}</Text>
                </>
              )}
            </div>
          </Container>
        </section>

        <section className="py-24 md:py-32">
          <Container width="default">
            <div className="mb-16 max-w-2xl animate-fade-up">
              {isEditMode ? (
                <>
                  <EditableText page="about" contentKey="values_heading" defaultValue="How We Work" dbValue={content["values_heading"]} as="h2" className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" />
                  <EditableText page="about" contentKey="values_subtitle" defaultValue="Three principles that guide every project we take on." dbValue={content["values_subtitle"]} as="p" className="mt-4 text-lg text-foreground-muted" />
                </>
              ) : (
                <>
                  <Heading level={2} gradient>{e("values_heading", "How We Work")}</Heading>
                  <Text variant="lead" className="mt-4">{e("values_subtitle", "Three principles that guide every project we take on.")}</Text>
                </>
              )}
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {defaultValues.map((value, i) => (
                <Card key={i} variant="feature" className="animate-fade-up">
                  {isEditMode ? (
                    <>
                      <EditableText page="about" contentKey={`value_${i + 1}_title`} defaultValue={value.title} dbValue={content[`value_${i + 1}_title`]} as="h4" className="text-lg font-semibold text-foreground mb-2" />
                      <EditableText page="about" contentKey={`value_${i + 1}_desc`} defaultValue={value.description} dbValue={content[`value_${i + 1}_desc`]} as="p" className="text-foreground-muted text-sm" />
                    </>
                  ) : (
                    <>
                      <Heading level={4} className="mb-2">{e(`value_${i + 1}_title`, value.title)}</Heading>
                      <Text>{e(`value_${i + 1}_desc`, value.description)}</Text>
                    </>
                  )}
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {isEditMode ? (
          <section className="py-24 md:py-32">
            <Container width="default">
              <div className="mb-16 max-w-2xl">
                <EditableText page="about" contentKey="process_heading" defaultValue="Our Approach" dbValue={content["process_heading"]} as="h2" className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" />
                <EditableText page="about" contentKey="process_subtitle" defaultValue="A straightforward process designed to get you from idea to working integration as fast as possible." dbValue={content["process_subtitle"]} as="p" className="mt-4 text-lg text-foreground-muted" />
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {defaultSteps.map((step, i) => (
                  <div key={i} className="glass rounded-2xl border border-primary/10 p-8">
                    <div className="text-primary font-mono text-sm mb-4">{String(i + 1).padStart(2, "0")}</div>
                    <EditableText page="about" contentKey={`process_${i + 1}_title`} defaultValue={step.title} dbValue={content[`process_${i + 1}_title`]} as="h3" className="text-lg font-semibold text-foreground mb-2" />
                    <EditableText page="about" contentKey={`process_${i + 1}_desc`} defaultValue={step.description} dbValue={content[`process_${i + 1}_desc`]} as="p" className="text-foreground-muted text-sm" />
                  </div>
                ))}
              </div>
            </Container>
          </section>
        ) : (
          <ProcessSteps
            heading={e("process_heading", "Our Approach")}
            subtitle={e("process_subtitle", "A straightforward process designed to get you from idea to working integration as fast as possible.")}
            steps={defaultSteps.map((step, i) => ({
              title: e(`process_${i + 1}_title`, step.title),
              description: e(`process_${i + 1}_desc`, step.description),
            }))}
          />
        )}

        {isEditMode ? (
          <section className="py-20 md:py-24 relative overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/5" />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
              <EditableText page="about" contentKey="cta_headline" defaultValue="Ready to put AI to work?" dbValue={content["cta_headline"]} as="h2" className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4" />
              <EditableText page="about" contentKey="cta_subtitle" defaultValue="Book a free discovery call and find out what AI can do for your business -- no commitment, no pitch deck." dbValue={content["cta_subtitle"]} as="p" className="text-lg text-foreground-muted mb-8 max-w-xl mx-auto" />
            </div>
          </section>
        ) : (
          <CTABanner
            headline={e("cta_headline", "Ready to put AI to work?")}
            subtitle={e("cta_subtitle", "Book a free discovery call and find out what AI can do for your business -- no commitment, no pitch deck.")}
            cta={{ label: e("cta_label", "Get in Touch"), href: "/contact" }}
          />
        )}
      </div>
    </PageWrapper>
  );
}
