import { PageWrapper } from "@/components/layout/PageWrapper";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export default function TermsPage() {
  return (
    <PageWrapper>
      <div className="grain">
        <section className="py-24 md:py-32">
          <Container width="narrow">
            <Heading level={1} gradient className="mb-4 text-3xl font-bold">
              Terms of Service
            </Heading>
            <Text variant="small" className="mb-12">
              Effective date: March 9, 2026
            </Text>

            <div className="space-y-10">
              {/* Introduction */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  1. Agreement to Terms
                </Heading>
                <Text variant="body">
                  These Terms of Service (&quot;Terms&quot;) constitute a legal
                  agreement between you and OphidianAI, operated by Eric Lefler
                  in Columbus, Indiana. By accessing ophidianai.com or engaging
                  our services, you agree to be bound by these Terms. If you do
                  not agree, do not use our website or services.
                </Text>
              </div>

              {/* Services */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  2. Services
                </Heading>
                <Text variant="body" className="mb-3">
                  OphidianAI provides the following services to businesses:
                </Text>
                <ul className="list-disc space-y-2 pl-6 text-foreground-muted">
                  <li>
                    Custom website design and development.
                  </li>
                  <li>
                    AI tool development and integration into existing business
                    workflows.
                  </li>
                  <li>
                    AI consulting and strategic implementation.
                  </li>
                </ul>
                <Text variant="body" className="mt-3">
                  The specific scope, deliverables, and timeline for any project
                  will be defined in a separate proposal or statement of work
                  agreed upon by both parties before work begins.
                </Text>
              </div>

              {/* Accounts */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  3. Accounts
                </Heading>
                <Text variant="body">
                  Certain features of our website require an account. You are
                  responsible for maintaining the confidentiality of your
                  credentials and for all activity that occurs under your
                  account. You agree to provide accurate information when
                  creating an account and to notify us immediately if you suspect
                  unauthorized access. We reserve the right to suspend or
                  terminate accounts that violate these Terms.
                </Text>
              </div>

              {/* Acceptable Use */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  4. Acceptable Use
                </Heading>
                <Text variant="body" className="mb-3">
                  You agree not to:
                </Text>
                <ul className="list-disc space-y-2 pl-6 text-foreground-muted">
                  <li>
                    Use our website or services for any unlawful purpose or in
                    violation of any applicable law.
                  </li>
                  <li>
                    Attempt to gain unauthorized access to our systems,
                    databases, or other users&apos; accounts.
                  </li>
                  <li>
                    Transmit malware, viruses, or any code designed to disrupt or
                    damage our services.
                  </li>
                  <li>
                    Scrape, crawl, or use automated tools to extract data from
                    our website without written permission.
                  </li>
                  <li>
                    Misrepresent your identity or affiliation with any person or
                    organization.
                  </li>
                  <li>
                    Use our services to build products that directly compete with
                    OphidianAI using deliverables we created for you.
                  </li>
                </ul>
              </div>

              {/* Payment Terms */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  5. Payment Terms
                </Heading>
                <Text variant="body" className="mb-3">
                  Payment terms are outlined in each project proposal or
                  statement of work. General terms include:
                </Text>
                <ul className="list-disc space-y-2 pl-6 text-foreground-muted">
                  <li>
                    Payments are processed securely through Stripe. By making a
                    payment, you also agree to Stripe&apos;s terms of service.
                  </li>
                  <li>
                    Subscription-based services are billed on a recurring basis
                    as specified in your agreement. You may cancel your
                    subscription with 30 days&apos; written notice.
                  </li>
                  <li>
                    Project-based work may require a deposit before work begins,
                    with remaining payments due at agreed milestones.
                  </li>
                  <li>
                    Invoices are due within 14 days of issuance unless otherwise
                    agreed. Late payments may incur a fee of 1.5% per month on
                    the outstanding balance.
                  </li>
                  <li>
                    Refunds are handled on a case-by-case basis. Fees for work
                    already completed are non-refundable.
                  </li>
                </ul>
              </div>

              {/* Intellectual Property */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  6. Intellectual Property
                </Heading>
                <Heading level={3} className="mb-2 text-lg font-medium">
                  Our Property
                </Heading>
                <Text variant="body" className="mb-4">
                  The OphidianAI website, brand, logo, original content, and
                  proprietary tools remain the intellectual property of
                  OphidianAI. You may not copy, modify, distribute, or create
                  derivative works from our materials without written permission.
                </Text>
                <Heading level={3} className="mb-2 text-lg font-medium">
                  Client Deliverables
                </Heading>
                <Text variant="body">
                  Upon full payment, you receive ownership of the custom code,
                  designs, and content we create specifically for your project,
                  unless otherwise stated in your agreement. We retain the right
                  to use general techniques, knowledge, and non-confidential
                  elements of our work in future projects. We may also showcase
                  completed projects in our portfolio unless you request
                  otherwise in writing.
                </Text>
              </div>

              {/* Confidentiality */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  7. Confidentiality
                </Heading>
                <Text variant="body">
                  Both parties agree to keep confidential any proprietary or
                  sensitive information shared during the course of a project.
                  This includes business data, technical specifications, API
                  keys, credentials, and strategic plans. Confidentiality
                  obligations survive termination of any agreement between us.
                </Text>
              </div>

              {/* Limitation of Liability */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  8. Limitation of Liability
                </Heading>
                <Text variant="body" className="mb-3">
                  To the maximum extent permitted by law:
                </Text>
                <ul className="list-disc space-y-2 pl-6 text-foreground-muted">
                  <li>
                    OphidianAI provides its services &quot;as is&quot; and makes
                    no warranties, express or implied, regarding the results you
                    will achieve from our services.
                  </li>
                  <li>
                    OphidianAI is not liable for any indirect, incidental,
                    consequential, or punitive damages arising from the use of
                    our website or services.
                  </li>
                  <li>
                    Our total liability for any claim arising from our services
                    is limited to the amount you paid us in the 12 months
                    preceding the claim.
                  </li>
                  <li>
                    We are not responsible for downtime, data loss, or service
                    interruptions caused by third-party providers (Supabase,
                    Vercel, Stripe, Resend, or others).
                  </li>
                </ul>
              </div>

              {/* Indemnification */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  9. Indemnification
                </Heading>
                <Text variant="body">
                  You agree to indemnify and hold OphidianAI harmless from any
                  claims, damages, or expenses (including reasonable legal fees)
                  arising from your use of our services, your violation of these
                  Terms, or your infringement of any third-party rights.
                </Text>
              </div>

              {/* Termination */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  10. Termination
                </Heading>
                <Text variant="body" className="mb-3">
                  Either party may terminate a service agreement with 30
                  days&apos; written notice. Additionally:
                </Text>
                <ul className="list-disc space-y-2 pl-6 text-foreground-muted">
                  <li>
                    We may terminate or suspend your access immediately if you
                    violate these Terms.
                  </li>
                  <li>
                    Upon termination, you remain responsible for payment of all
                    work completed up to the termination date.
                  </li>
                  <li>
                    We will provide you with any completed deliverables and a
                    reasonable transition period to migrate away from our
                    services.
                  </li>
                </ul>
              </div>

              {/* Governing Law */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  11. Governing Law
                </Heading>
                <Text variant="body">
                  These Terms are governed by the laws of the State of Indiana,
                  without regard to conflict of law principles. Any disputes
                  arising from these Terms or our services will be resolved in
                  the courts located in Bartholomew County, Indiana.
                </Text>
              </div>

              {/* Changes */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  12. Changes to These Terms
                </Heading>
                <Text variant="body">
                  We may update these Terms from time to time. When we do, we
                  will revise the effective date at the top of this page.
                  Continued use of our website or services after changes are
                  posted constitutes acceptance of the updated Terms. For active
                  clients, material changes will be communicated directly.
                </Text>
              </div>

              {/* Contact */}
              <div>
                <Heading level={2} className="mb-3 text-xl font-semibold">
                  13. Contact Us
                </Heading>
                <Text variant="body">
                  If you have questions about these Terms, contact us at:
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
