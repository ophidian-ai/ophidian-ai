import { PageWrapper } from "@/components/layout/PageWrapper";
import { HeroSimple } from "@/components/sections/HeroSimple";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { CTABanner } from "@/components/sections/CTABanner";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";

const values = [
  {
    title: "No Black Boxes",
    description:
      "We explain every decision, every integration, every result. You'll always know what your AI is doing and why.",
  },
  {
    title: "Speed Over Perfection",
    description:
      "Ship fast, iterate, deliver value in weeks not months. Progress beats polish when you're trying to move the needle.",
  },
  {
    title: "Your Stack, Our AI",
    description:
      "We integrate with what you already use, not force new tools on your team. Your workflows stay intact -- they just get smarter.",
  },
];

export default function AboutPage() {
  return (
    <PageWrapper>
      <div className="grain">
        <HeroSimple
          title="About OphidianAI"
          subtitle="We help businesses cut through the AI noise and build integrations that actually move the needle -- no hype, no bloat, just results."
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
          ]}
        />

        {/* Story Section */}
        <section className="py-24 md:py-32">
          <Container width="default">
            <div className="flex flex-col items-start gap-12 lg:flex-row lg:gap-16 animate-fade-up">
              {/* Left: narrative */}
              <div className="w-full lg:w-1/2">
                <Heading level={2} gradient className="mb-6">
                  Why We Exist
                </Heading>
                <Text variant="body" className="mb-4">
                  AI is transforming how businesses operate -- but most companies
                  don't know where to start. They're buried in vendor pitches,
                  overwhelmed by options, and skeptical of promises that sound
                  too good to be true.
                </Text>
                <Text variant="body" className="mb-4">
                  OphidianAI exists to bridge that gap. We cut through the noise,
                  identify the automations and integrations that will actually
                  impact your bottom line, and build them into your existing
                  workflows. No rip-and-replace. No six-month discovery phases.
                  Just practical AI that works.
                </Text>
                <Text variant="body">
                  We're not here to sell you a vision of the future. We're here
                  to make your business faster, leaner, and more capable today.
                </Text>
              </div>

              {/* Right: photo placeholder */}
              <div className="w-full lg:w-1/2">
                <div className="glass relative aspect-[4/3] rounded-2xl overflow-hidden flex items-center justify-center border border-primary/10 bg-surface">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-24 w-24 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                      <span className="text-4xl font-bold text-primary font-mono">EL</span>
                    </div>
                    <div className="text-center">
                      <p className="text-foreground font-semibold">Eric Lefler</p>
                      <p className="text-foreground-muted text-sm">Founder, OphidianAI</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Founder bio */}
            <div className="mt-16 max-w-3xl animate-fade-up">
              <Heading level={3} gradient className="mb-4">
                Meet the Founder
              </Heading>
              <Text variant="body" className="mb-4">
                Eric Lefler started OphidianAI with a simple thesis: small and
                mid-size businesses deserve the same AI capabilities that
                enterprise companies take for granted -- without the enterprise
                price tag or complexity.
              </Text>
              <Text variant="body">
                Based in Columbus, Indiana, Eric builds every integration
                hands-on. That means direct communication, fast turnarounds,
                and solutions shaped by someone who understands both the
                technology and the business problems it needs to solve.
              </Text>
            </div>
          </Container>
        </section>

        {/* Values / Approach Section */}
        <section className="py-24 md:py-32">
          <Container width="default">
            <div className="mb-16 max-w-2xl animate-fade-up">
              <Heading level={2} gradient>
                How We Work
              </Heading>
              <Text variant="lead" className="mt-4">
                Three principles that guide every project we take on.
              </Text>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {values.map((value) => (
                <Card key={value.title} variant="feature" className="animate-fade-up">
                  <Heading level={4} className="mb-2">
                    {value.title}
                  </Heading>
                  <Text>{value.description}</Text>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        <ProcessSteps
          heading="Our Approach"
          subtitle="A straightforward process designed to get you from idea to working integration as fast as possible."
          steps={[
            {
              title: "Discovery Call",
              description:
                "We learn your business, your tools, and your pain points. No questionnaires or intake forms -- just a conversation about what's slowing you down.",
            },
            {
              title: "Scope & Proposal",
              description:
                "Within days, you get a clear proposal outlining exactly what we'll build, how long it'll take, and what it'll cost. No surprises.",
            },
            {
              title: "Build & Iterate",
              description:
                "We build in short cycles with regular check-ins. You see progress every week, not just at the end. Feedback gets incorporated immediately.",
            },
            {
              title: "Launch & Support",
              description:
                "We deploy, train your team, and stick around to make sure everything runs smoothly. Ongoing support keeps your integrations performing as your business evolves.",
            },
          ]}
        />

        <CTABanner
          headline="Ready to put AI to work?"
          subtitle="Book a free discovery call and find out what AI can do for your business -- no commitment, no pitch deck."
          cta={{ label: "Get in Touch", href: "/contact" }}
        />
      </div>
    </PageWrapper>
  );
}
