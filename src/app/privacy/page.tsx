import { PageWrapper } from "@/components/layout/PageWrapper";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export default function PrivacyPage() {
  return (
    <PageWrapper>
      <div className="grain">
        <section className="py-24 md:py-32">
          <Container width="narrow">
            <Heading level={1} gradient className="mb-4 text-3xl font-bold">
              Privacy Policy
            </Heading>
            <Text variant="small" className="mb-12">
              Effective date: March 9, 2026
            </Text>

            <div className="space-y-10">
              {/* Introduction */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  1. Introduction
                </Heading>
                <Text variant="body">
                  OphidianAI (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
                  is an AI agency and integrations company operated by Eric
                  Lefler in Columbus, Indiana. This Privacy Policy explains how
                  we collect, use, disclose, and protect your information when
                  you visit ophidianai.com or use our services. By using our
                  website or engaging our services, you agree to the practices
                  described in this policy.
                </Text>
              </div>

              {/* Information We Collect */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  2. Information We Collect
                </Heading>
                <Heading level={3} className="mb-2 text-lg font-medium">
                  Information You Provide
                </Heading>
                <ul className="mb-4 list-disc space-y-2 pl-6 text-foreground-muted">
                  <li>
                    Contact information (name, email address, phone number) when
                    you submit our contact form or communicate with us directly.
                  </li>
                  <li>
                    Business information you share during discovery calls,
                    project consultations, or onboarding.
                  </li>
                  <li>
                    Payment information processed through Stripe when you
                    purchase our services. We do not store your full payment card
                    details on our servers.
                  </li>
                  <li>
                    Account credentials if you create an account on our
                    platform, managed through Supabase authentication.
                  </li>
                </ul>

                <Heading level={3} className="mb-2 text-lg font-medium">
                  Information Collected Automatically
                </Heading>
                <ul className="list-disc space-y-2 pl-6 text-foreground-muted">
                  <li>
                    Usage data through Vercel Analytics, including page views,
                    referral sources, browser type, device type, and general
                    geographic region. Vercel Analytics is privacy-focused and
                    does not use cookies for tracking.
                  </li>
                  <li>
                    Server logs that may include your IP address, request
                    timestamps, and pages visited.
                  </li>
                </ul>
              </div>

              {/* How We Use Your Information */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  3. How We Use Your Information
                </Heading>
                <Text variant="body" className="mb-3">
                  We use the information we collect to:
                </Text>
                <ul className="list-disc space-y-2 pl-6 text-foreground-muted">
                  <li>
                    Respond to your inquiries and communicate with you about our
                    services.
                  </li>
                  <li>
                    Deliver, maintain, and improve the websites, AI tools, and
                    integrations we build for you.
                  </li>
                  <li>Process payments and manage your account.</li>
                  <li>
                    Send transactional emails (project updates, invoices,
                    support responses) through Resend.
                  </li>
                  <li>
                    Analyze website usage to improve our site and service
                    offerings.
                  </li>
                  <li>
                    Comply with legal obligations and protect our rights.
                  </li>
                </ul>
              </div>

              {/* Cookies and Tracking */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  4. Cookies and Tracking
                </Heading>
                <Text variant="body" className="mb-3">
                  Our website uses minimal cookies:
                </Text>
                <ul className="list-disc space-y-2 pl-6 text-foreground-muted">
                  <li>
                    <strong className="text-foreground">
                      Essential cookies:
                    </strong>{" "}
                    Required for authentication and core site functionality
                    (managed by Supabase).
                  </li>
                  <li>
                    <strong className="text-foreground">Analytics:</strong>{" "}
                    Vercel Analytics collects anonymized usage data without
                    placing tracking cookies on your device.
                  </li>
                </ul>
                <Text variant="body" className="mt-3">
                  We do not use third-party advertising cookies or sell your data
                  to advertisers.
                </Text>
              </div>

              {/* Third-Party Services */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  5. Third-Party Services
                </Heading>
                <Text variant="body" className="mb-3">
                  We use the following third-party services to operate our
                  business. Each has its own privacy policy governing data
                  handling:
                </Text>
                <ul className="list-disc space-y-2 pl-6 text-foreground-muted">
                  <li>
                    <strong className="text-foreground">Supabase</strong> --
                    Authentication and database services.
                  </li>
                  <li>
                    <strong className="text-foreground">Stripe</strong> --
                    Payment processing.
                  </li>
                  <li>
                    <strong className="text-foreground">Resend</strong> --
                    Transactional email delivery.
                  </li>
                  <li>
                    <strong className="text-foreground">Vercel</strong> --
                    Website hosting and analytics.
                  </li>
                </ul>
              </div>

              {/* Data Sharing */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  6. Data Sharing and Disclosure
                </Heading>
                <Text variant="body" className="mb-3">
                  We do not sell, rent, or trade your personal information. We
                  may share your data only in the following circumstances:
                </Text>
                <ul className="list-disc space-y-2 pl-6 text-foreground-muted">
                  <li>
                    With the third-party service providers listed above, solely
                    to deliver our services.
                  </li>
                  <li>
                    When required by law, regulation, or legal process.
                  </li>
                  <li>
                    To protect the rights, safety, or property of OphidianAI,
                    our clients, or others.
                  </li>
                </ul>
              </div>

              {/* Data Security */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  7. Data Security
                </Heading>
                <Text variant="body">
                  We implement reasonable technical and organizational measures
                  to protect your information, including encrypted connections
                  (HTTPS), secure authentication through Supabase, and
                  PCI-compliant payment processing through Stripe. However, no
                  method of transmission or storage is completely secure, and we
                  cannot guarantee absolute security.
                </Text>
              </div>

              {/* Data Retention */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  8. Data Retention
                </Heading>
                <Text variant="body">
                  We retain your personal information for as long as necessary to
                  fulfill the purposes described in this policy, maintain our
                  business relationship, or comply with legal obligations. If you
                  request deletion of your data, we will remove it within 30
                  days, except where retention is required by law.
                </Text>
              </div>

              {/* Your Rights */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  9. Your Rights
                </Heading>
                <Text variant="body" className="mb-3">
                  Depending on your location, you may have the right to:
                </Text>
                <ul className="list-disc space-y-2 pl-6 text-foreground-muted">
                  <li>
                    Access the personal information we hold about you.
                  </li>
                  <li>
                    Request correction of inaccurate or incomplete data.
                  </li>
                  <li>Request deletion of your personal information.</li>
                  <li>
                    Object to or restrict certain processing of your data.
                  </li>
                  <li>
                    Request a portable copy of your data.
                  </li>
                </ul>
                <Text variant="body" className="mt-3">
                  To exercise any of these rights, contact us at{" "}
                  <a
                    href="mailto:eric.lefler@ophidianai.com"
                    className="text-primary hover:underline"
                  >
                    eric.lefler@ophidianai.com
                  </a>
                  .
                </Text>
              </div>

              {/* Children */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  10. Children&apos;s Privacy
                </Heading>
                <Text variant="body">
                  Our services are not directed at individuals under 18. We do
                  not knowingly collect personal information from children. If
                  you believe we have collected data from a minor, please contact
                  us and we will promptly delete it.
                </Text>
              </div>

              {/* Changes */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  11. Changes to This Policy
                </Heading>
                <Text variant="body">
                  We may update this Privacy Policy from time to time. When we
                  do, we will revise the effective date at the top of this page.
                  Continued use of our website or services after changes are
                  posted constitutes acceptance of the updated policy.
                </Text>
              </div>

              {/* Contact */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  12. Contact Us
                </Heading>
                <Text variant="body">
                  If you have questions about this Privacy Policy or how we
                  handle your data, contact us at:
                </Text>
                <div className="mt-3 text-foreground-muted">
                  <p>OphidianAI</p>
                  <p>Eric Lefler</p>
                  <p>Columbus, Indiana</p>
                  <p>
                    <a
                      href="mailto:eric.lefler@ophidianai.com"
                      className="text-primary hover:underline"
                    >
                      eric.lefler@ophidianai.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </PageWrapper>
  );
}
