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
              Effective date: March 16, 2026
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
                  <li>
                    Social media account access granted through Meta (Facebook
                    and Instagram) when you authorize our social media management
                    services. This includes your Facebook Page access tokens,
                    Instagram Professional account identifiers, and the
                    permissions you grant to our application.
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

                <Heading level={3} className="mb-2 text-lg font-medium">
                  Information from Third-Party Platforms
                </Heading>
                <Text variant="body" className="mb-2">
                  When you connect your Facebook Page or Instagram Professional
                  account to our social media management services, we may receive
                  the following data from Meta:
                </Text>
                <ul className="list-disc space-y-2 pl-6 text-foreground-muted">
                  <li>
                    Your Facebook Page name, ID, and associated metadata.
                  </li>
                  <li>
                    Your Instagram Professional account profile information,
                    including username, profile picture, and account type.
                  </li>
                  <li>
                    Content you have published on your connected accounts
                    (posts, media, captions) to inform our content strategy.
                  </li>
                  <li>
                    Engagement metrics and insights (likes, comments, reach,
                    impressions) from your connected accounts.
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
                    Publish content (posts, images, videos, reels, stories) to
                    your Facebook Page and Instagram Professional account on your
                    behalf as part of our social media management services.
                  </li>
                  <li>
                    Monitor engagement metrics on your connected social media
                    accounts to inform content strategy and reporting.
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
                  <li>
                    <strong className="text-foreground">Meta Platforms</strong>{" "}
                    -- Facebook and Instagram APIs for social media management
                    services. When you connect your accounts, data is exchanged
                    between our application and Meta in accordance with{" "}
                    <a
                      href="https://www.facebook.com/privacy/policy/"
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Meta&apos;s Privacy Policy
                    </a>
                    .
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

              {/* Meta Platform Data */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  7. Meta Platform Data (Facebook &amp; Instagram)
                </Heading>
                <Text variant="body" className="mb-3">
                  If you use our social media management services and connect
                  your Facebook Page or Instagram Professional account, the
                  following additional terms apply:
                </Text>
                <Heading level={3} className="mb-2 text-lg font-medium">
                  What We Access
                </Heading>
                <ul className="mb-4 list-disc space-y-2 pl-6 text-foreground-muted">
                  <li>
                    Your Facebook Page and Instagram Professional account
                    profile information, content, and engagement metrics.
                  </li>
                  <li>
                    The ability to publish content (posts, images, videos,
                    reels, stories) to your connected accounts on your behalf.
                  </li>
                  <li>
                    The ability to read and respond to comments on your
                    connected accounts.
                  </li>
                </ul>
                <Heading level={3} className="mb-2 text-lg font-medium">
                  How We Store It
                </Heading>
                <ul className="mb-4 list-disc space-y-2 pl-6 text-foreground-muted">
                  <li>
                    Access tokens are stored encrypted at rest and transmitted
                    only over HTTPS.
                  </li>
                  <li>
                    We store the minimum data necessary to provide the service
                    (account IDs, tokens, and scheduling data).
                  </li>
                  <li>
                    We do not sell, share, or transfer Meta platform data to
                    third parties, except as required to provide our services to
                    you.
                  </li>
                </ul>
                <Heading level={3} className="mb-2 text-lg font-medium">
                  Revoking Access
                </Heading>
                <Text variant="body" className="mb-3">
                  You may disconnect your Facebook or Instagram account from our
                  services at any time by:
                </Text>
                <ul className="mb-4 list-disc space-y-2 pl-6 text-foreground-muted">
                  <li>
                    Removing our app from your Facebook Settings under Apps and
                    Websites.
                  </li>
                  <li>
                    Contacting us at{" "}
                    <a
                      href="mailto:eric.lefler@ophidianai.com"
                      className="text-primary hover:underline"
                    >
                      eric.lefler@ophidianai.com
                    </a>{" "}
                    to request disconnection.
                  </li>
                </ul>
                <Text variant="body" className="mb-3">
                  When you revoke access, we will delete all stored Meta
                  platform data associated with your account within 30 days.
                </Text>
                <Heading level={3} className="mb-2 text-lg font-medium">
                  Data Deletion Requests
                </Heading>
                <Text variant="body">
                  In compliance with Meta Platform Terms, we provide a data
                  deletion callback. When you remove our app from your Facebook
                  account, Meta notifies us and we automatically initiate
                  deletion of all data received from Meta on your behalf. You
                  may also request deletion directly by emailing{" "}
                  <a
                    href="mailto:eric.lefler@ophidianai.com"
                    className="text-primary hover:underline"
                  >
                    eric.lefler@ophidianai.com
                  </a>
                  . We will confirm deletion within 30 days and provide a
                  confirmation code for your records.
                </Text>
              </div>

              {/* Data Security */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  8. Data Security
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
                  9. Data Retention
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
                  10. Your Rights
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
                  11. Children&apos;s Privacy
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
                  12. Changes to This Policy
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
                  13. Contact Us
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
